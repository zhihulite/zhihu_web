// tests/live/api.test.js
// 真接口用例：GM 桥换成 dev 反代（LIVE=1 时 setup.mjs 装 proxy-gm），断言知乎真实响应形状。
// 默认 npm test 不跑这里（LIVE 未置 → 全 skip）；跑法 npm run test:live，需 npm run dev 起着。
import { test } from 'node:test';
import assert from 'node:assert/strict';

const LIVE = process.env.LIVE === '1';
const skip = LIVE ? false : '需要 LIVE=1 与 npm run dev（反代）';

const { proxyReachable } = await import('../helpers/proxy-gm.mjs');
const { rawHttp, default: $http } = await import('@/services/http.js');
const { mapRecommendItem } = await import('@/mappers/feed.js');
const { KEYS, getString } = await import('@/services/storage.js');

const reachable = LIVE ? await proxyReachable() : false;
const skipAll = reachable ? false : (LIVE ? '反代不可达：先 npm run dev' : skip);

test('知乎日报：免登录端点的真实形状', { skip: skipAll }, async () => {
    const res = await rawHttp.get('https://news-at.zhihu.com/api/4/news/latest');

    assert.ok(Array.isArray(res.stories), 'stories 应是数组');
    assert.ok(res.stories.length > 0);
    assert.ok(res.stories.every((s) => s.id && s.title), '每条都要有 id 与标题');
});

test('游客凭证引导：udid_guest + zst/events/s 真跑一遍', { skip: skipAll }, async () => {
    const { tokenManager } = await import('@/services/auth.js');
    const { ensureGuestCredential } = await import('@/services/zhihu/guest.js');

    tokenManager.clear();
    const ok = await ensureGuestCredential(true);
    assert.ok(ok, '引导失败说明上游封禁或 LAES 解不开 st_ruid');

    const data = tokenManager.getLoginData();
    assert.ok(data?.guest?.access_token, '游客 access_token 在 guest 字段里（saveTokens 存的是原响应）');
    assert.ok(getString(KEYS.udid), 'udid 应已落盘');
});

test('推荐分区：真实响应里能读出分区名', { skip: skipAll }, async () => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    await initZhihu();

    const res = await $http.get('https://api.zhihu.com/feed-root/sections/query/v2');
    const list = res?.selected_sections || res?.data || [];
    assert.ok(Array.isArray(list) && list.length > 0, '分区应非空');
    assert.ok(list.some((s) => s.section_name || s.name), '至少一个分区有名字');
});

test('推荐流：真实条目过 mapper 不抛错', { skip: skipAll }, async () => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    await initZhihu();

    // 与 HomeView 同口径：推荐走 isWWW（web 端头，返回 type:'feed'；不带则是 app 端的 common_card）
    const res = await $http.get('https://api.zhihu.com/topstory/recommend', { isWWW: true });
    // PaginatedResult.data 是一次性取值（读完即释放数组），只能取一次
    const rawItems = res.data;
    assert.ok(Array.isArray(rawItems) && rawItems.length > 0, '真实推荐应有 data');

    const mapped = rawItems.map(mapRecommendItem).filter(Boolean);
    assert.ok(mapped.length > 0, '至少一条 feed 卡片能映射出来');
    for (const item of mapped.slice(0, 5)) {
        assert.ok(item.id, '条目要有 id');
        assert.equal(typeof item.title, 'string', '标题缺失要回落成字符串而不是 undefined');
    }
});

/** 游客态拿不到的接口按 skip 处理，不算失败 */
async function tryGet(url, options) {
    try {
        const res = await $http.get(url, options);
        return { ok: true, res };
    } catch (e) {
        if (e.status === 401 || e.status === 403) return { ok: false, status: e.status };
        throw e;
    }
}

/** 真实推荐里的第一条回答；没有就返回 null */
async function firstAnswer() {
    const feed = await $http.get('https://api.zhihu.com/topstory/recommend', { isWWW: true });
    return feed.data.map(mapRecommendItem).find((i) => i?.type === 'answer') || null;
}

test('热榜：真实条目的链接与标题区形状', { skip: skipAll }, async (t) => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    await initZhihu();
    const got = await tryGet('https://api.zhihu.com/topstory/hot-lists/total?limit=50&mobile=true');
    if (!got.ok) return t.skip(`游客态拿不到（${got.status}）`);

    const list = got.res?.data || [];
    assert.ok(list.length > 0, '热榜应有条目');
    const withTitle = list.filter((i) => i.target?.title_area?.text);
    assert.equal(withTitle.length, list.length, '每条都要有 title_area.text，否则卡片标题为空');
    const withLink = list.filter((i) => i.target?.link?.url);
    assert.ok(withLink.length > 0, '至少部分条目自带链接（跳转按它走，缺失的要有提示）');
});

test('评论列表：真实 root_comment 的 paging.totals 与条目字段', { skip: skipAll }, async (t) => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    await initZhihu();

    const answer = await firstAnswer();
    if (!answer) return t.skip('这批推荐里没有回答');

    const got = await tryGet(`https://api.zhihu.com/comment_v5/answers/${answer.id}/root_comment?limit=20&order_by=normal`);
    if (!got.ok) return t.skip(`游客态拿不到评论（${got.status}）`);

    const data = got.res.data;
    assert.ok(Number.isFinite(Number(got.res.paging?.totals)),
        `paging.totals 应是数字（评论标题用它显示条数），真实返回 ${got.res.paging?.totals}`);
    assert.ok(data.length > 0, '应有评论');
    for (const c of data.slice(0, 3)) {
        assert.ok(c.id, '评论要有 id');
        assert.equal(typeof c.author?.name ?? typeof c.member?.name, 'string', '作者名要能取到');
    }
    return { memberId: data[0].member_id };
});

test('问题下的回答列表：条目是扁平回答对象（无 target 包装）', { skip: skipAll }, async (t) => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    await initZhihu();

    const answer = await firstAnswer();
    if (!answer) return t.skip('这批推荐里没有回答');
    const detail = await tryGet(`https://api.zhihu.com/answers/v2/${answer.id}`);
    if (!detail.ok) return t.skip(`拿不到回答详情（${detail.status}）`);
    const qid = detail.res.question?.id;
    if (!qid) return t.skip('回答详情里读不到 question.id');

    const got = await tryGet(`https://api.zhihu.com/questions/${qid}/answers?limit=20&order=default`);
    if (!got.ok) return t.skip(`游客态拿不到回答列表（${got.status}）`);

    const list = got.res.data;
    assert.ok(list.length > 0, '问题下应有回答');
    // v4 的 questions/{id}/feeds 才包 target；这条端点不包，所以 QuestionDetail 按顶层字段取值是对的。
    // 桩若照卡片形状写成 target 包装，点卡片会跳 /article/answer/undefined
    assert.ok(list.every((i) => i.id), 'id 在顶层（缺了就说明形状变了）');
    assert.ok(list.slice(0, 5).every((i) => i.author?.name && typeof i.excerpt === 'string'),
        '作者与摘要同在顶层');
});

test('用户主页：profile/tab 用 url_token 取栏目与计数', { skip: skipAll }, async (t) => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    await initZhihu();

    const answer = await firstAnswer();
    if (!answer) return t.skip('这批推荐里没有回答');
    const comments = await tryGet(`https://api.zhihu.com/comment_v5/answers/${answer.id}/root_comment?limit=20&order_by=normal`);
    if (!comments.ok) return t.skip(`游客态拿不到评论（${comments.status}）`);
    // profile/tab 只认 url_token，传数字 member_id 会回 400 请求参数错误
    const urlToken = comments.res.data[0]?.author?.url_token;
    if (!urlToken) return t.skip('评论作者没有 url_token');

    const got = await tryGet(`https://api.zhihu.com/people/${urlToken}/profile/tab`);
    if (!got.ok) return t.skip(`游客态拿不到主页（${got.status}）`);

    const tabs = got.res?.tabs || [];
    assert.ok(tabs.length > 0, 'profile/tab 应给出栏目列表');
    assert.ok(tabs.every((tab) => tab.key && typeof tab.name === 'string'),
        '每个栏目要有 key 与 name（UserProfile 按这两个字段渲染）');
    assert.ok(tabs.every((tab) => Number.isFinite(tab.number)),
        'number 必须是数字，-1 表示不显示计数');
    assert.ok(tabs.some((tab) => Array.isArray(tab.sub_tab) && tab.sub_tab.length > 0),
        '真实栏目带 sub_tab 子档');
});

test('@用户：people/ats 回扁平用户对象，映射读得出 id', { skip: skipAll }, async (t) => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    const { userOf } = await import('@/mappers/zhihu-item.js');
    await initZhihu();

    // 面板打开即发空 q，有登录态时会回最近 @ 过的人；空结果不算失败，改用关键词验证形状
    const empty = await tryGet('https://api.zhihu.com/people/ats?offset=0&limit=20&scene=comment_editor&q=');
    if (!empty.ok) return t.skip(`拿不到 @ 搜索（${empty.status}）`);
    let list = empty.res.data;
    if (list.length === 0) {
        const searched = await tryGet('https://api.zhihu.com/people/ats?offset=0&limit=20&scene=comment_editor&q=%E7%9F%A5%E4%B9%8E');
        if (!searched.ok) return t.skip(`关键词搜索被挡（${searched.status}）`);
        list = searched.res.data;
    }
    assert.ok(list.length > 0, '应有候选用户');

    const users = list.slice(0, 5).map(userOf);
    for (const u of users) {
        assert.ok(u.id, '条目是扁平用户对象，id 要直接读得出（读 author 包装会全空）');
        assert.ok(u.name, '昵称要读得出');
    }
});

test('链接卡片：parse_url 以传入 url 为键回标题与图标', { skip: skipAll }, async (t) => {
    const { initZhihu } = await import('@/services/zhihu/module.js');
    await initZhihu();

    const hot = await tryGet('https://api.zhihu.com/topstory/hot-lists/total?limit=10');
    if (!hot.ok) return t.skip(`拿不到热榜（${hot.status}）`);
    const url = hot.res.data?.[0]?.target?.link?.url;
    if (!url) return t.skip('热榜条目没带链接');

    const got = await tryGet(`https://api.zhihu.com/content/publish/parse_url?url=${encodeURIComponent(url)}&scene=editor`);
    if (!got.ok) return t.skip(`拿不到链接解析（${got.status}）`);

    assert.equal(got.res.code, 0, 'code 非 0 时按原链接兜底');
    const info = got.res.data?.[url];
    assert.ok(info?.title, 'data 以传入的 url 为键，值里要有 title');
    assert.ok(info.icon_name, 'icon_name 用于卡片图标');
});
