// 请求发送层：用假 GM 把整条请求栈（鉴权头、签名、body 组装）真跑一遍，
// 断言「方法 + 地址 + 参数」是否按预期发出。不连知乎真实接口。
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resetGM, lastCallTo, callsTo, reply, fakeGM } from '../helpers/fake-gm.mjs';
import { lastModal, resetF7Calls } from '../helpers/f7-stub.mjs';

const { tokenManager } = await import('@/services/auth.js');
const { initZhihu, getZhihuInstance, updateZhihuLoginData } = await import('@/services/zhihu/module.js');

const seedTokens = () => tokenManager.saveTokens(
    'test-access-token', 'test-refresh', 86400, false,
    { access_token: 'test-access-token', cookie: { d_c0: 'test-dc0' } },
);

// 凭证先备好再装配请求栈，initZhihu 才不会去取游客凭证
seedTokens();
await initZhihu();

/** 令牌与请求实例同步：登录框成功后也是这两步 */
const seedLogin = () => {
    seedTokens();
    updateZhihuLoginData(tokenManager.getLoginData());
};

const { blockUser, unblockUser } = await import('@/composables/useBlockToggle.js');
const { followUser, unfollowUser, useFollowToggle } = await import('@/composables/useFollowToggle.js');
const { useUser } = await import('@/composables/userManager.js');
const { reportRead } = await import('@/services/read-report.js');
const { fetchDislikeOptions, submitDislike } = await import('@/services/negative-feedback.js');
const { HistoryService } = await import('@/services/history.js');
const { loginWithPassword, sendSmsCode, submitCaptcha, getCaptchaImage, logout, rebuildCredential } = await import('@/services/auth.js');
const { ensureGuestCredential } = await import('@/services/zhihu/guest.js');
const $http = (await import('@/services/http.js')).default;

/**
 * 请求栈默认把正文 LAES 加密后才发，密文读不出字段。
 * 正文加密调用固定带第二个参数（x-Zse-96 的 url 加密不带），据此截获送进加密层的原文。
 */
async function plainBodiesOf(fn) {
    const inst = getZhihuInstance();
    const original = inst.encryptData;
    const plains = [];
    inst.encryptData = (data, ...rest) => {
        if (rest.length) plains.push(data);
        return original(data, ...rest);
    };
    try {
        await fn();
    } finally {
        inst.encryptData = original;
    }
    return plains;
}

test('拉黑发 POST 且带加密头，解除发 DELETE 并拼用户 id', async () => {
    resetGM();
    await blockUser('u1');
    const post = lastCallTo('blocked_users');
    assert.equal(post.method, 'POST');
    assert.equal(post.url, 'https://api.zhihu.com/settings/blocked_users');
    assert.equal(post.body, 'people_id=u1');
    assert.ok(post.headers['x-Zse-96'], 'encryptHead 应产出签名头');
    assert.equal(post.headers['Content-Type'], 'application/x-www-form-urlencoded');

    await unblockUser('u1');
    const del = lastCallTo('blocked_users');
    assert.equal(del.method, 'DELETE');
    assert.equal(del.url, 'https://api.zhihu.com/settings/blocked_users/u1');
});

test('关注与取关分别打 followers 的 POST 与带自身 id 的 DELETE', async () => {
    resetGM();
    await followUser('u2');
    const add = lastCallTo('people/u2/followers');
    assert.equal(add.method, 'POST');
    assert.equal(add.url, 'https://api.zhihu.com/people/u2/followers');

    await unfollowUser('u2', 'me');
    const rm = lastCallTo('people/u2/followers');
    assert.equal(rm.method, 'DELETE');
    assert.equal(rm.url, 'https://api.zhihu.com/people/u2/followers/me');
});

test('已读上报按 targets=[[r,<brief>]] 发出，对象型 brief 会被序列化', async () => {
    resetGM();
    await reportRead({ actionType: 'answer', uuid: 7 });
    const call = lastCallTo('lastread/touch/v2');
    assert.equal(call.method, 'POST');
    assert.ok(call.body.startsWith('targets='));
    assert.equal(decodeURIComponent(call.body.slice('targets='.length)),
        '[["r",{"actionType":"answer","uuid":7}]]');

    await reportRead('{"a":1}');
    assert.equal(decodeURIComponent(lastCallTo('lastread').body.slice(8)), '[["r",{"a":1}]]');
});

test('游客态与缺 brief 时不发已读上报', async () => {
    resetGM();
    tokenManager.saveTokens('guest-token', null, 86400, true, { access_token: 'guest-token' });
    await reportRead({ a: 1 });
    await reportRead(null);
    assert.equal(callsTo('lastread').length, 0);
    seedLogin();
});

test('负反馈：拉面板选项并映射成动作，回传打后端地址', async () => {
    resetGM();
    reply('negative-feedback/panel', {
        data: {
            items: [
                { raw_button: { text: { panel_text: '不感兴趣', toast_text: '已减少推荐' }, action: { backend_url: 'https://api.zhihu.com/nf/1' } } },
                { raw_button: { text: { panel_text: '举报' }, action: { intent_url: 'report-target' } } },
                { raw_button: null },
            ],
        },
    });
    const options = await fetchDislikeOptions('answer', 'a1');
    assert.equal(options.length, 2, '缺按钮的项应被丢掉');
    assert.deepEqual(options[0], { label: '不感兴趣', toast: '已减少推荐', backendUrl: 'https://api.zhihu.com/nf/1', intentUrl: null });
    assert.equal(options[1].intentUrl, 'report-target');
    assert.ok(lastCallTo('panel').url.includes('content_type=answer&content_token=a1'));

    assert.equal(await submitDislike('https://api.zhihu.com/nf/1'), true);
    const sent = lastCallTo('/nf/1');
    assert.equal(sent.method, 'POST');
    assert.equal(sent.body, null, '空正文被请求栈省略，不发空串');
});

test('浏览历史上报：发出的是 LAES 密文，明文字段齐备', async () => {
    resetGM();
    const plains = await plainBodiesOf(() => HistoryService.addRecord({ id: 'a1', type: 'people', title: '标题', progress: 140 }));

    const call = lastCallTo('read_history/add');
    assert.equal(call.method, 'POST');
    assert.ok(call.body, '正文应被发出');
    assert.ok(!call.body.startsWith('{'), '线上发出的是密文而不是明文 JSON');
    assert.equal(call.headers['Content-Type'], 'application/x-www-form-urlencoded');

    const body = JSON.parse(plains[0]);
    assert.equal(body.content_token, 'a1');
    assert.equal(body.content_type, 'profile', 'people 对应服务端的 profile');
    assert.equal(body.read_progress, 100, '进度被夹到 0..100');
    assert.equal(typeof body.read_time, 'number');
});

test('分页结果对象能把 next 游标打到下一页地址', async () => {
    resetGM();
    reply('/feed?page=1', { data: [{ id: 1 }], paging: { is_end: false, next: 'https://api.zhihu.com/feed?page=2' } });
    reply('/feed?page=2', { data: [{ id: 2 }], paging: { is_end: true } });

    const first = await $http.get('https://api.zhihu.com/feed?page=1');
    assert.equal(first.hasMore, true);
    const second = await first.next();
    assert.equal(second.data[0].id, 2);
    assert.equal(second.hasMore, false, 'is_end 后不再声称还有下一页');
    assert.deepEqual(callsTo('/feed').map((c) => c.url), [
        'https://api.zhihu.com/feed?page=1',
        'https://api.zhihu.com/feed?page=2',
    ]);
});

test('知乎 Cookie 走 GM 的 cookie 通道而不是请求头', async () => {
    resetGM();
    await $http.get('https://api.zhihu.com/me');
    const call = fakeGM.calls[0];
    assert.equal('Cookie' in call.headers, false, 'Cookie 不应留在 headers 里');
    assert.match(call.cookie, /d_c0=test-dc0/);
    assert.equal(call.anonymous, true);
    assert.equal(call.headers.Authorization, 'Bearer test-access-token');
});

test('密码登录：签名与用户名进正文，换到的新令牌立刻用于后续请求', async () => {
    resetGM();
    reply('prod/sign_in', {
        access_token: 'fresh-a', refresh_token: 'fresh-r', expires_in: 86400,
        cookie: { d_c0: 'login-dc0', z_c0: 'fresh-zc0' },
    });

    const plains = await plainBodiesOf(() => loginWithPassword('13800000000', 'pw'));
    const params = new URLSearchParams(plains[0]);
    assert.equal(params.get('grant_type'), 'password');
    assert.equal(params.get('username'), '+8613800000000');
    assert.equal(params.get('password'), 'pw');
    assert.ok(params.get('signature'), '签名由 grant_type + timestamp 推出');
    assert.equal(params.get('client_id'), '8d5227e0aaaa4797a763ac64e0c3b8');

    const sent = lastCallTo('prod/sign_in');
    assert.equal(sent.method, 'POST');
    assert.notEqual(sent.body, plains[0], '发出的是密文');
    assert.equal(sent.headers['Content-Type'], 'application/x-www-form-urlencoded');

    // 登录框成功后把新凭证写回请求实例，此处复刻那一步
    updateZhihuLoginData(tokenManager.getLoginData());
    await $http.get('https://api.zhihu.com/me');
    const afterLogin = lastCallTo('/me');
    assert.equal(afterLogin.headers.Authorization, 'Bearer fresh-a');
    assert.match(afterLogin.cookie, /d_c0=login-dc0/, '登录响应的 cookie 整组换用');
    assert.doesNotMatch(afterLogin.cookie, /test-dc0/, '旧账号的会话键不残留');
    seedLogin();
});

test('发短信验证码与取/交图形验证码：票据走 cookie，提交正文不加密', async () => {
    resetGM();
    reply('auth/digits', { status: 'sent' });
    const smsPlains = await plainBodiesOf(() => sendSmsCode('13800000000', 'ticket-1'));
    assert.equal(new URLSearchParams(smsPlains[0]).get('username'), '+8613800000000');
    const sms = lastCallTo('auth/digits');
    assert.match(sms.cookie, /capsion_ticket=ticket-1/);
    assert.equal('Cookie' in sms.headers, false);

    reply('api.zhihu.com/captcha', { success: true, img_base64: 'QUJD' });
    await submitCaptcha('点我', 'ticket-2');
    const posted = callsTo('api.zhihu.com/captcha').find((c) => c.method === 'POST');
    assert.equal(posted.body, `input_text=${encodeURIComponent('点我')}`, '声明不加密就应原样发出');
    assert.match(posted.cookie, /capsion_ticket=ticket-2/);

    const dataUrl = await getCaptchaImage('ticket-3');
    const put = callsTo('api.zhihu.com/captcha').find((c) => c.method === 'PUT');
    assert.equal(put.body, null, '取图是空正文');
    assert.equal(dataUrl, 'data:image/jpeg;base64,QUJD');
});

test('通用关注开关：按配置拼地址与请求体，关注数同步增减且不为负', async () => {
    resetGM();
    reply('api.zhihu.com/me', { id: 'me-9', name: '我' });
    const { refreshUser, currentUser } = useUser();
    await refreshUser();
    assert.equal(currentUser.value.id, 'me-9');

    let following = false;
    let count = 1;
    const { toggle } = useFollowToggle({
        url: () => 'https://api.zhihu.com/people/u-7/followers',
        isFollowing: () => following,
        setFollowing: (v) => { following = v; },
        deleteWithUserId: true,
        followerCount: () => count,
        setFollowerCount: (n) => { count = n; },
    });

    await toggle();
    assert.equal(lastCallTo('people/u-7/followers').method, 'POST');
    assert.equal(following, true);
    assert.equal(count, 2);

    await toggle();
    const del = lastCallTo('people/u-7/followers');
    assert.equal(del.method, 'DELETE');
    assert.equal(del.url, 'https://api.zhihu.com/people/u-7/followers/me-9', '取关拼自身 id');
    assert.equal(following, false);
    assert.equal(count, 1);

    count = 0;
    following = true;
    await toggle();
    assert.equal(count, 0, '计数已为 0 时不再减成负数');
});

test('401 先刷新令牌再重试一次原请求', async () => {
    resetGM();
    let meHits = 0;
    fakeGM.routes.push({
        test: (c) => c.url.includes('prod/sign_in'),
        respond: () => ({ body: { access_token: 'after-refresh', refresh_token: 'r2', expires_in: 86400 } }),
    });
    fakeGM.routes.push({
        test: (c) => c.url.includes('/me'),
        respond: () => {
            meHits += 1;
            return meHits === 1 ? { status: 401, body: {} } : { body: { id: 'me' } };
        },
    });

    assert.deepEqual(await $http.get('https://api.zhihu.com/me'), { id: 'me' });
    assert.equal(meHits, 2, '只重试一次');
    assert.equal(callsTo('prod/sign_in').length, 1);
    const [rejected, retried] = callsTo('/me');
    assert.equal(retried.headers.Authorization, 'Bearer after-refresh');
    assert.notEqual(rejected.headers['x-Zse-96'], retried.headers['x-Zse-96'], '签名按新令牌重算');
    assert.match(retried.cookie, /d_c0=test-dc0/, '刷新响应不带 cookie 时沿用已登录的');
    seedLogin();
});

test('登出带上当前令牌，游客重建失败也不影响本地清理', async () => {
    resetGM();
    reply('client_logout', { status: 'ok' });
    // 游客凭证引导故意打不通：登出的本地清理与游客重建是两件事
    reply('init/udid_guest', {}, { status: 500 });

    const plains = await plainBodiesOf(() => logout());
    const params = new URLSearchParams(plains[0]);
    assert.equal(params.get('token'), 'test-access-token');
    assert.equal(params.get('use_refresh_direct_sign'), '0');
    assert.equal(lastCallTo('client_logout').method, 'POST');

    assert.equal(tokenManager.getAccessToken(), null);
    assert.equal(localStorage.getItem('zhihu_auth'), null, '落盘凭证也要清掉');
    const inst = getZhihuInstance();
    assert.equal(inst.accessToken, '', '实例里的旧令牌要停用，不能等下一次 401 才丢');
    assert.ok(!inst.commonDefaultHeaders.Authorization, '登出后的请求头不该再带 Authorization');
    seedLogin();
    assert.equal(tokenManager.getAccessToken(), 'test-access-token');
});

test('刷新令牌遇服务端拒绝才作废凭证，遇临时故障留着还能用的', async () => {
    resetGM();
    reply('prod/sign_in', {}, { status: 503 });
    await rebuildCredential();
    assert.equal(tokenManager.getAccessToken(), 'test-access-token', '5xx 不该清掉登录态');

    resetGM();
    reply('prod/sign_in', {}, { status: 400 });
    await rebuildCredential();
    assert.equal(tokenManager.getAccessToken(), null, '服务端明确拒绝时作废');
    seedLogin();
});

test('刷新成功但仍被拒：作废凭证、提示并重建请求栈', async () => {
    resetGM();
    resetF7Calls();
    let issued = 0;
    fakeGM.routes.push({
        test: (c) => c.url.includes('prod/sign_in'),
        respond: () => ({ body: { access_token: `fresh-${issued++}`, refresh_token: 'r', expires_in: 86400 } }),
    });
    fakeGM.routes.push({ test: (c) => c.url.includes('/me'), respond: () => ({ status: 401, body: {} }) });
    reply('init/udid_guest', {}, { status: 500 });

    await assert.rejects(() => $http.get('https://api.zhihu.com/me'));
    assert.equal(tokenManager.getAccessToken(), null, '二次 401 应作废凭证');
    const modal = lastModal();
    assert.match(modal.text, /登录状态已失效/);
    assert.equal(callsTo('udid_guest').length, 0, '用户确认前不该自己重建');
    await modal.invoke();
    await new Promise((r) => setTimeout(r, 30));
    assert.ok(callsTo('udid_guest').length >= 1, '确认后重建请求栈，走游客引导');
    seedLogin();
});

test('并发请求撞 401 时共用一次凭证重建，并各自重试一次', async () => {
    resetGM();
    let refreshCount = 0;
    fakeGM.routes.push({
        test: (c) => c.url.includes('prod/sign_in'),
        respond: () => {
            refreshCount += 1;
            return { body: { access_token: `fresh-${refreshCount}`, refresh_token: 'r', expires_in: 86400 } };
        },
    });
    const hits = {};
    fakeGM.routes.push({
        test: (c) => c.url.includes('/bulk'),
        respond: (c) => {
            hits[c.url] = (hits[c.url] || 0) + 1;
            return hits[c.url] === 1 ? { status: 401, body: {} } : { body: { ok: c.url } };
        },
    });

    const urls = ['/bulk/1', '/bulk/2', '/bulk/3'].map((p) => `https://api.zhihu.com${p}`);
    const results = await Promise.all(urls.map((u) => $http.get(u)));
    assert.deepEqual(results.map((r) => r.ok), urls, '三条都应在重试后拿到数据');
    assert.equal(refreshCount, 1, '同批 401 只刷一次令牌');
    assert.equal(callsTo('/bulk').length, 6, '每条各重试一次，不多不少');
    seedLogin();
});

test('游客凭证到期前直接复用，到期后必须重新引导', async () => {
    resetGM();
    tokenManager.saveTokens('guest-a', null, 86400, true, { guest: { access_token: 'guest-a' } });
    assert.equal(tokenManager.isExpired(), false);
    const cached = await ensureGuestCredential();
    assert.equal(cached.guest.access_token, 'guest-a');
    assert.equal(callsTo('udid_guest').length, 0, '没到期就不该重新引导');

    tokenManager.saveTokens('guest-old', null, -1, true, { guest: { access_token: 'guest-old' } });
    assert.equal(tokenManager.isExpired(), true, '到期判定');
    reply('init/udid_guest', {}, { status: 500 });
    await assert.rejects(() => ensureGuestCredential(), '到期后应走重新引导而不是返回过期凭证');
    assert.equal(callsTo('udid_guest').length, 1);
    seedLogin();
});

test('刷新接口自身撞 401 不再套一层重建：不与在等的作业互等，并给出失效提示', async () => {
    resetGM();
    resetF7Calls();
    fakeGM.routes.push({ test: (c) => c.url.includes('prod/sign_in'), respond: () => ({ status: 401, body: {} }) });
    fakeGM.routes.push({ test: (c) => c.url.includes('/me'), respond: () => ({ status: 401, body: {} }) });

    const settled = await Promise.race([
        $http.get('https://api.zhihu.com/me').then(() => 'resolved', () => 'rejected'),
        new Promise((r) => setTimeout(() => r('timeout'), 3000)),
    ]);
    assert.notEqual(settled, 'timeout', '刷新被拒时请求必须结束，不能卡在它自己触发的重建作业上');
    assert.equal(settled, 'rejected');
    assert.equal(callsTo('prod/sign_in').length, 1, '刷新请求被拒后不该再触发一次刷新');
    assert.equal(tokenManager.getAccessToken(), null, '凭证应作废');
    assert.match(lastModal().text, /登录状态已失效/, '应给出一条失效提示');
    seedLogin();
});

test('风控以 200 回正文里的 error 时按失败处理，原因原样抛出', async () => {
    resetGM();
    reply('comment_v5/comment/123/child_comment', {
        error: { message: '您当前请求存在异常，暂时限制本次访问。', code: 40362 },
    });

    await assert.rejects(
        () => $http.get('https://api.zhihu.com/comment_v5/comment/123/child_comment?limit=20&order_by=ts'),
        /您当前请求存在异常/,
        '这种响应没有 data/paging，当成功交给调用方只会显示"暂无评论"，原因必须可见',
    );
});
