// dev 反代的行为锁定：白名单、路径不被解码、UA 还原、cookie jar、响应头剥离、跳转改写。
// 这几条错了都不会报错，只是"请求悄悄不通"，所以必须有用例兜着。
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { zhihuProxy } from '../../dev/zhihu-proxy.js';

/** 取插件挂上去的两个中间件 */
function mount() {
    const routes = {};
    const plugin = zhihuProxy({ envName: 'ZHIHU_COOKIE_UNSET_FOR_TESTS', cookieFile: './__no_such_cookie_file' });
    plugin.configureServer({ middlewares: { use: (path, handler) => { routes[path] = handler; } } });
    return routes;
}

const fakeReq = ({ method = 'GET', url, headers = {}, body = null }) => ({
    method,
    url,
    headers,
    on(ev, cb) {
        if (ev === 'data' && body) cb(Buffer.from(body));
        if (ev === 'end') cb();
        return this;
    },
});

function fakeRes() {
    const out = { statusCode: 0, headers: null, body: null, done: null };
    out.writeHead = (status, headers) => { out.statusCode = status; out.headers = headers; };
    out.end = (buf) => { out.body = buf; out.done?.(); };
    out.finished = new Promise((resolve) => { out.done = resolve; });
    return out;
}

const upstream = (init = {}) => {
    const headers = new Headers(init.headers ?? { 'content-type': 'application/json' });
    // 插件读的是 headers.getSetCookie()（undici 的扩展），桩要挂在 headers 上
    if (init.getSetCookie) headers.getSetCookie = init.getSetCookie;
    return {
        status: init.status ?? 200,
        headers,
        arrayBuffer: async () => Buffer.from(
            typeof init.body === 'string' ? init.body : JSON.stringify(init.body ?? {})),
    };
};

async function run(routes, req, fetchStub) {
    const realFetch = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url, init) => {
        calls.push({ url, ...init });
        return typeof fetchStub === 'function' ? fetchStub(url, init) : fetchStub;
    };
    try {
        const res = fakeRes();
        await routes['/__zproxy'](req, res);
        await res.finished;
        return { res, calls };
    } finally {
        globalThis.fetch = realFetch;
    }
}

test('反代只放行白名单主机，其余直接拒', async () => {
    const routes = mount();
    const { res, calls } = await run(routes, fakeReq({ url: '/evil.example.com/x' }), upstream());

    assert.equal(res.statusCode, 400);
    assert.equal(calls.length, 0, '不该把请求转出去');
});

test('路径与 query 原样转发，不做二次解码', async () => {
    const routes = mount();
    const raw = '/api.zhihu.com/content/publish/parse_url?url=https%3A%2F%2Fwww.zhihu.com%2Fquestion%2F123%3Ft%3D1&scene=editor';
    const { calls } = await run(routes, fakeReq({ url: raw }), upstream({ body: {} }));

    assert.equal(calls[0].url, `https://api.zhihu.com${raw.slice('/api.zhihu.com'.length)}`,
        '%3A/%2F 必须保持编码，否则签名与 url 参数都对不上');
});

test('fetch 抬上来的真 UA 还原成 user-agent，浏览器身份头不外传', async () => {
    const routes = mount();
    const { calls } = await run(routes, fakeReq({
        url: '/api.zhihu.com/me',
        headers: {
            'x-dev-user-agent': 'com.zhihu.android/Futureve/10.0 Mozilla/5.0',
            'content-type': 'application/json',
            origin: 'http://localhost:5173',
            referer: 'http://localhost:5173/',
            cookie: 'd_c0=浏览器那份不该带上',
            'sec-fetch-site': 'same-origin',
            'sec-ch-ua-platform': '"Windows"',
        },
    }), upstream({ body: {} }));

    const sent = calls[0].headers;
    assert.equal(sent['user-agent'], 'com.zhihu.android/Futureve/10.0 Mozilla/5.0');
    assert.equal(sent['x-dev-user-agent'], undefined, '自定义头不该漏给上游');
    assert.equal(sent.origin, undefined);
    assert.equal(sent.cookie, undefined, 'cookie 由代理侧 jar 决定');
    assert.equal(sent['sec-fetch-site'], undefined);
    assert.equal(sent['sec-ch-ua-platform'], undefined);
    assert.equal(sent.referer, 'https://www.zhihu.com/');
    assert.equal(sent['content-type'], 'application/json', '业务头要保留');
});

test('上游 Set-Cookie 进 jar 并在下一个请求带回；响应头剥掉编码与长度', async () => {
    // 两次请求要共用同一个插件实例，jar 才延续（mount 每次都会新建一份）
    const routes = mount();
    const first = await run(routes, fakeReq({ url: '/api.zhihu.com/a' }), upstream({
        body: {},
        headers: { 'content-type': 'application/json', 'content-encoding': 'gzip', 'content-length': '999' },
        getSetCookie: () => ['d_c0=abc; Path=/; Max-Age=2592000', 'x-zse-96st=; Expires=Thu, 01 Jan 1970 00:00:00 GMT'],
    }));

    assert.equal(first.res.headers['content-encoding'], undefined, 'undici 已解压，回传编码头会让浏览器再解一次');
    assert.equal(first.res.headers['content-length'], undefined);
    assert.equal(first.res.headers['set-cookie'], undefined);

    const second = await run(routes, fakeReq({ url: '/api.zhihu.com/b' }), upstream({ body: {} }));
    assert.equal(second.calls[0].headers.cookie, 'd_c0=abc', '过期即删，其余留并回带');
});

test('302 的 Location 命中白名单时改写回反代，否则原样', async () => {
    const routes = mount();
    const hit = await run(routes, fakeReq({ url: '/www.zhihu.com/a' }), upstream({
        status: 302,
        headers: { location: 'https://www.zhihu.com/signin?next=%2F', 'content-type': 'text/html' },
        body: '',
    }));
    assert.equal(hit.res.statusCode, 302);
    assert.equal(hit.res.headers.location, '/__zproxy/www.zhihu.com/signin?next=%2F');

    const miss = await run(routes, fakeReq({ url: '/www.zhihu.com/a' }), upstream({
        status: 302,
        headers: { location: 'https://other.example.com/x', 'content-type': 'text/html' },
        body: '',
    }));
    assert.equal(miss.res.headers.location, 'https://other.example.com/x');
});

test('POST 原样送出请求体；上游抛错回 502', async () => {
    const routes = mount();
    const posted = await run(routes, fakeReq({
        method: 'POST', url: '/api.zhihu.com/images', body: '{"image_hash":"h"}',
    }), upstream({ body: {} }));
    assert.equal(posted.calls[0].method, 'POST');
    assert.equal(posted.calls[0].body.toString(), '{"image_hash":"h"}');

    const broken = await run(routes, fakeReq({ url: '/api.zhihu.com/x' }), () => {
        throw new Error('upstream down');
    });
    assert.equal(broken.res.statusCode, 502);
    assert.match(broken.res.body.toString(), /upstream down/);
});

test('/__zlog 把页面诊断原样打出来并回 204', async () => {
    const routes = mount();
    const seen = [];
    const realLog = console.log;
    console.log = (...a) => seen.push(a.join(' '));
    try {
        const res = fakeRes();
        routes['/__zlog'](fakeReq({ url: '?send GET /__zproxy/api.zhihu.com/me' }), res);
        await res.finished;
        assert.equal(res.statusCode, 204);
    } finally {
        console.log = realLog;
    }
    assert.match(seen.join('\n'), /\[zlog\] send GET \/__zproxy\/api\.zhihu\.com\/me/);
});
