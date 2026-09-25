// 评论输入侧三条链路的请求级验证：@用户搜索、URL 转链接卡片、图片上传。
// 这三条此前只在浏览器里点过，桩里连端点都没有；落到请求层后不依赖浏览器也能定论。
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resetGM, lastCallTo, callsTo, reply } from '../helpers/fake-gm.mjs';

const { tokenManager } = await import('@/services/auth.js');
const { initZhihu, getZhihuInstance } = await import('@/services/zhihu/module.js');

tokenManager.saveTokens('test-access-token', 'test-refresh', 86400, false,
    { access_token: 'test-access-token', cookie: { d_c0: 'test-dc0' } });
await initZhihu();

/** 正文默认 LAES 加密后发出，截获送进加密层的原文才能断言字段 */
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

const { useCommentRichText } = await import('@/composables/useCommentRichText.js');
const { uploadImage } = await import('@/services/upload.js');
const { userOf } = await import('@/mappers/zhihu-item.js');
const $http = (await import('@/services/http.js')).default;

/** Messagebar 的 textarea 替身：只用到 value / 光标 / 聚焦三件事 */
const fakeEditor = (value, caret = value.length) => ({
    value,
    selectionStart: caret,
    selectionEnd: caret,
    focused: false,
    selections: [],
    focus() { this.focused = true; },
    setSelectionRange(a, b) { this.selections.push([a, b]); },
});

/** EmoticonEditor 的替身：字面量写入都经这三个方法，落点由区间决定 */
const fakeEditorRef = (initial = '') => {
    const box = { value: initial };
    return {
        box,
        value: {
            insertText: (t) => { box.value += t; },
            replaceRange: (s, e, t) => { box.value = box.value.slice(0, s) + t + box.value.slice(e); },
            text: () => box.value,
        },
    };
};

test('@用户搜索：端点与查询参数按评论编辑器口径发出，结果能映射成人', async () => {
    resetGM();
    reply('people/ats', {
        data: [
            { id: 'at-1', name: '可圈可点', headline: '签名一', avatar_url: 'https://p/1.png' },
            { member: { id: 'at-2', name: '点名专家', avatar_url: 'https://p/2.png' } },
        ],
        paging: { is_end: true },
    });

    const res = await $http.get('https://api.zhihu.com/people/ats?offset=0&limit=20&scene=comment_editor&q=%E5%8F%AF');
    const call = lastCallTo('people/ats');

    assert.equal(call.method, 'GET');
    assert.match(call.url, /scene=comment_editor/);
    assert.match(call.url, /q=%E5%8F%AF/, '关键词要按 URL 编码送出');
    const people = res.data.map(userOf);
    assert.deepEqual(people.map((p) => [p.id, p.name, p.headline, p.avatarUrl]),
        [['at-1', '可圈可点', '签名一', 'https://p/1.png'], ['at-2', '点名专家', '', 'https://p/2.png']],
        '扁平用户与 member 包装都要读得出，缺签名落成空串');
});

test('选人写入 @昵称 ，重复选人按次数记账', () => {
    const content = { value: '' };
    const editor = fakeEditorRef();
    const { addMention, buildContent, mentions } = useCommentRichText(content, editor);

    addMention({ id: 42, name: '可圈可点' });
    assert.equal(content.value, '@可圈可点 ');
    addMention({ id: 42, name: '可圈可点' });
    assert.equal(content.value, '@可圈可点 @可圈可点 ');
    assert.equal(mentions.value.length, 2, '正文里两个 @ 就要有两条账');
    addMention({});
    assert.equal(mentions.value.length, 2, '缺 id/name 的入参不该记账');

    const html = buildContent();
    assert.equal((html.match(/class="member_mention"/g) || []).length, 2,
        '两个 @ 都要换成锚点，不能留一个纯文本');
    assert.match(html, /<a data-hash="42" href="\/people\/42" class="member_mention"[^>]*>@可圈可点 <\/a>/);
});

test('打字触发选人：记下的 @ 偏移被昵称顶替，不留多余的 @', () => {
    const content = { value: '' };
    const editor = fakeEditorRef('你好 @');
    content.value = editor.box.value;
    const { addMention, mentions } = useCommentRichText(content, editor);

    addMention({ id: 7, name: '知乎' }, 3);
    assert.equal(content.value, '你好 @知乎 ', '原位的 @ 由 @昵称 覆盖');
    assert.equal(mentions.value.length, 1);
});

test('URL 转链接卡片：空格触发解析，正文换成标题并记账', async () => {
    resetGM();
    const url = 'https://www.zhihu.com/question/123';
    reply('content/publish/parse_url', { code: 0, data: { [url]: { title: '一个链接标题', icon_name: 'zh' } } });

    const content = { value: '' };
    const { convertUrlAtCaret, linkCards, buildContent } = useCommentRichText(content);
    const el = fakeEditor(`看这个 ${url} `);
    content.value = el.value;

    await convertUrlAtCaret(el);
    const call = lastCallTo('parse_url');

    assert.match(call.url, /url=https%3A%2F%2Fwww\.zhihu\.com%2Fquestion%2F123/, 'url 参数要整体编码');
    assert.match(call.url, /scene=editor/);
    assert.equal(content.value, '看这个 一个链接标题 ', '正文里链接被标题替换');
    assert.deepEqual(linkCards.value.map((c) => [c.url, c.title, c.iconName]),
        [[url, '一个链接标题', 'zh']], '发送时要靠这条账还原成卡片锚点');
    assert.deepEqual(el.selections, [[10, 10]], '光标停在替换结果之后');
    assert.match(buildContent(), new RegExp(`<a href="${url.replace(/[/.]/g, '\\$&')}" data-insert-way="url"[^>]*>一个链接标题</a>`),
        '发送时把标题换回带 href 的卡片锚点');
});

test('URL 解析失败按原链接兜底，不吞掉用户输入', async () => {
    resetGM();
    reply('content/publish/parse_url', { code: 10001 });

    const url = 'https://a.com/x';
    const content = { value: '' };
    const { convertUrlAtCaret } = useCommentRichText(content);
    const el = fakeEditor(`${url} `);
    content.value = el.value;

    await convertUrlAtCaret(el);
    assert.equal(content.value, `${url} `, '非 0 code 时保持原链接');
});

test('图片上传：申请许可 → 已存在直接轮询取 src', async () => {
    resetGM();
    // 假 GM 按"先注册者优先"匹配，轮询这条更具体必须先放
    reply('images/img-9', { src: 'https://pic4.zhimg.com/v2-abc.png' });
    reply('api.zhihu.com/images', { upload_file: { state: 1, image_id: 'img-9' } });

    const file = new File([Buffer.from('fake-png-bytes')], 'a.png', { type: 'image/png' });
    let out;
    const plains = await plainBodiesOf(async () => { out = await uploadImage(file); });

    const [permit] = callsTo('api.zhihu.com/images');
    assert.equal(permit.method, 'POST');
    assert.match(plains.join(''), /"image_hash":"/, '许可申请要带图片 md5');
    assert.match(plains.join(''), /"source":"article"/);
    assert.equal(callsTo('uploading_status').length, 0, 'state=1 时不该再通知服务器');
    assert.match(lastCallTo('images/img-9').url, /images\/img-9$/, '跳过直传，直接轮询取 src');
    assert.deepEqual(out, { url: 'https://pic4.zhimg.com/v2-abc.png', isGif: false });
});

test('图片上传：走 OSS 直传时带签名头，并回报上传完成', async () => {
    resetGM();
    const seen = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
        seen.push({ url, method: init.method, headers: init.headers });
        return new Response('', { status: 200 });
    };
    try {
        reply('images/img-8/uploading_status', {});
        reply('/images/img-8', { original_hash: 'deadbeef.png' });
        reply('api.zhihu.com/images', {
            upload_file: { state: 0, image_id: 'img-8', object_key: 'v2-abc.png' },
            upload_token: { access_id: 'AID', access_key: 'KEY', access_token: 'TOKEN' },
        });

        const out = await uploadImage(new File([Buffer.from('bytes')], 'b.jpg', { type: 'image/jpeg' }));

        const put = seen.find((c) => c.method === 'PUT');
        assert.ok(put, '未存在的图要先 PUT 到 OSS');
        assert.match(put.url, /zhihu-pics-upload\.zhimg\.com\/v2-abc\.png$/);
        assert.match(put.headers.Authorization, /^OSS AID:/, 'OSS 签名要用申请到的 access_id');
        assert.ok(put.headers['x-oss-security-token']);
        assert.equal(lastCallTo('uploading_status').method, 'PUT', '直传完要通知服务器');
        assert.deepEqual(out, { url: 'https://pic4.zhimg.com/deadbeef.png', isGif: false },
            'original_hash 分支拼出图床地址');
    } finally {
        globalThis.fetch = realFetch;
    }
});

test('图片上传：超过 20MB 直接中文拒绝，不发任何请求', async () => {
    resetGM();
    const big = new File([Buffer.alloc(20 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });

    await assert.rejects(() => uploadImage(big), /图片超过 20MB/);
    assert.equal(callsTo('api.zhihu.com/images').length, 0, '超限不该先申请许可');
});
