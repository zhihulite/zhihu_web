// 测试侧的 GM 桥：把 GM_xmlhttpRequest 接到 dev 反代（dev/zhihu-proxy.js）。
// 与浏览器里的 __dev/gm-proxy.js 同一套语义，区别只是这里在 Node 里跑，
// 于是"真实响应形状"这类只有真接口能答的问题也能被用例覆盖。
// 需要 npm run dev 起着，且用 LIVE=1 显式开启（见 tests/helpers/setup.mjs）。

const BASE = process.env.ZPROXY_BASE || 'http://localhost:5173/__zproxy';

/** GM 的 responseHeaders 是 "k: v" 逐行字符串，请求栈按这个格式解析 */
const headersToLineString = (headers) => {
    const lines = [];
    headers.forEach((value, key) => lines.push(`${key}: ${value}`));
    return lines.join('\n');
};

export function installProxyGM() {
    globalThis.GM_xmlhttpRequest = (opts) => {
        const ctrl = new AbortController();
        let settled = false;
        let timer = null;

        const url = String(opts.url).replace(/^https?:\/\/([^/?#]+)/, (all, host) =>
            `${BASE}/${host}`);
        const headers = { ...(opts.headers || {}) };
        // Node 侧可以直接送 UA（浏览器里是 forbidden header 才需要抬成自定义头）

        if (opts.timeout) {
            timer = setTimeout(() => {
                settled = true;
                ctrl.abort();
                opts.ontimeout?.();
            }, opts.timeout);
        }

        fetch(url, {
            method: opts.method || 'GET',
            headers,
            body: opts.data == null ? undefined : opts.data,
            signal: ctrl.signal,
        }).then(async (res) => {
            const text = await res.text().catch(() => '');
            if (timer) clearTimeout(timer);
            if (settled) return;
            settled = true;
            opts.onload?.({ status: res.status, responseText: text, responseHeaders: headersToLineString(res.headers) });
        }).catch((e) => {
            if (timer) clearTimeout(timer);
            if (settled) return;
            settled = true;
            opts.onerror?.(e);
        });

        return {
            abort() {
                settled = true;
                if (timer) clearTimeout(timer);
                ctrl.abort();
            },
        };
    };
}

/** 反代是否可达：live 用例据此决定跑还是跳过 */
export async function proxyReachable() {
    try {
        const res = await fetch(`${BASE}/news-at.zhihu.com/api/4/news/latest`, { signal: AbortSignal.timeout(4000) });
        return res.status === 200;
    } catch {
        return false;
    }
}
