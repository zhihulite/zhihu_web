// GM_xmlhttpRequest 的替身：把每次请求原样记下来，按注册的路由返回响应。
// 有了它就能断言「请求到底发没发、方法/地址/参数对不对」，而不必真连知乎。
export const fakeGM = {
    calls: [],
    routes: [],
    fallback: { status: 200, body: {} },
};

export function installFakeGM() {
    globalThis.GM_xmlhttpRequest = (opts) => {
        const call = {
            method: (opts.method || 'GET').toUpperCase(),
            url: opts.url,
            headers: { ...(opts.headers || {}) },
            body: opts.data ?? null,
            anonymous: opts.anonymous ?? false,
            cookie: opts.cookie ?? null,
        };
        fakeGM.calls.push(call);

        const route = fakeGM.routes.find((r) => r.test(call)) || null;
        const res = route ? route.respond(call) : fakeGM.fallback;
        const body = typeof res.body === 'string' ? res.body : JSON.stringify(res.body ?? {});

        const timer = setTimeout(() => {
            opts.onload?.({
                status: res.status ?? 200,
                responseText: body,
                responseHeaders: res.headers ?? 'content-type: application/json\r\n',
            });
        }, 0);
        return { abort: () => clearTimeout(timer) };
    };
}

export function resetGM() {
    fakeGM.calls.length = 0;
    fakeGM.routes.length = 0;
    fakeGM.fallback = { status: 200, body: {} };
}

/** 注册一条响应：url 含子串即命中，body 可为对象或返回响应的函数 */
export function reply(urlPart, body, extra = {}) {
    fakeGM.routes.push({
        test: (call) => call.url.includes(urlPart),
        respond: () => (typeof body === 'function' ? body() : { body, ...extra }),
    });
}

export function callsTo(urlPart) {
    return fakeGM.calls.filter((c) => c.url.includes(urlPart));
}

export function lastCallTo(urlPart) {
    const list = callsTo(urlPart);
    return list[list.length - 1];
}
