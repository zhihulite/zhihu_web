// dev/zhihu-proxy.js
// 仅开发期的反向代理：浏览器把知乎请求打到同源 `/__zproxy/<host>/<原路径>`，这里转发给真站点。
// 目的是不装油猴、不用桩也能跑真接口——签名与请求装配仍在页面里做，代理只搬运字节。
// apply:'serve' 保证构建产物不含它。
import { readFileSync } from 'node:fs';

const HOSTS = new Set([
    'api.zhihu.com',
    'www.zhihu.com',
    'zhuanlan.zhihu.com',
    'lens.zhihu.com',
    'news-at.zhihu.com',
    'daily.zhihu.com',
    'zhihu-pics-upload.zhimg.com',
]);

// 逐跳头与浏览器身份头：转发时重建，原样带上会和对端不一致
const DROPPED = new Set([
    'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te',
    'trailers', 'transfer-encoding', 'upgrade', 'host', 'content-length', 'cookie',
    // 这些 Chrome 客户端提示会如实说出"我是 localhost 的同源请求"，与 app 签名身份不符
    'origin', 'referer', 'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest',
    'sec-fetch-storage-access', 'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform',
]);

const UPSTREAM_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const readSeedCookie = (envName, file) => {
    if (process.env[envName]) return process.env[envName].trim();
    try {
        return readFileSync(file, 'utf8').trim();
    } catch {
        return '';
    }
};

const parseCookie = (line) => {
    const out = {};
    for (const part of String(line).split(';')) {
        const [k, ...rest] = part.trim().split('=');
        if (k && rest.length) out[k] = rest.join('=');
    }
    return out;
};

export function zhihuProxy({ envName = 'ZHIHU_COOKIE', cookieFile = '.devcookie' } = {}) {
    // 会话 cookie 由代理侧持有并回带：浏览器发给 localhost 的 cookie 不是知乎域的，用不上
    const jar = new Map(Object.entries(parseCookie(readSeedCookie(envName, cookieFile))));

    const applySetCookies = (cookies) => {
        for (const line of cookies) {
            const [pair] = line.split(';');
            const eq = pair.indexOf('=');
            if (eq < 0) continue;
            const name = pair.slice(0, eq).trim();
            const value = pair.slice(eq + 1).trim();
            if (value === '' || /expires=thu, 01 jan 1970/i.test(line)) jar.delete(name);
            else jar.set(name, value);
        }
    };

    const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

    const readBody = (req) => new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : null));
        req.on('error', reject);
    });

    const handler = async (req, res) => {
        // 原样取路径：这里解码会把 query 里的 %3D/%2F 提前解掉，签名与 parse_url 的 url 参数就对不上了
        const raw = req.url.replace(/^\//, '');
        const slash = raw.indexOf('/');
        const host = slash < 0 ? raw : raw.slice(0, slash);
        const rest = slash < 0 ? '' : raw.slice(slash + 1);
        if (!HOSTS.has(host)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'host not allowed', host }));
            return;
        }

        const target = `https://${host}/${rest}`;
        const method = req.method || 'GET';
        const headers = {
            'user-agent': UPSTREAM_UA,
            accept: req.headers.accept || '*/*',
            referer: 'https://www.zhihu.com/',
        };
        for (const [k, v] of Object.entries(req.headers)) {
            if (DROPPED.has(k) || v === undefined) continue;
            headers[k] = Array.isArray(v) ? v.join(', ') : v;
        }
        if (jar.size) headers.cookie = cookieHeader();
        // 页面里 fetch 抬出来的真 UA（User-Agent 在 fetch 是 forbidden header），还原后上游才与签名一致
        const devUa = req.headers['x-dev-user-agent'];
        if (typeof devUa === 'string' && devUa) {
            headers['user-agent'] = devUa;
            delete headers['x-dev-user-agent'];
        }

        const body = method === 'GET' || method === 'HEAD' ? null : await readBody(req);

        let upstream;
        try {
            upstream = await fetch(target, {
                method,
                headers,
                body,
                redirect: 'manual',
                signal: AbortSignal.timeout(60000),
            });
        } catch (e) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: String(e && e.message || e) }));
            console.log('[zproxy]', method, target, '→ 转发失败', String(e && e.message || e));
            return;
        }

        applySetCookies(typeof upstream.headers.getSetCookie === 'function'
            ? upstream.headers.getSetCookie() : []);

        const out = {};
        for (const [k, v] of upstream.headers) {
            // set-cookie 由 jar 接管；content-encoding/length 必须丢——undici 已解压，
            // 原样回传会让浏览器对明文再解一次 gzip
            if (k === 'set-cookie' || k === 'content-security-policy'
                || k === 'content-encoding' || k === 'content-length') continue;
            out[k] = v;
        }
        // 302 的 Location 指回反代，浏览器同源跟随，不会跳出 localhost
        if (out.location) {
            try {
                const loc = new URL(out.location, target);
                if (HOSTS.has(loc.host)) out.location = `/__zproxy/${loc.host}${loc.pathname}${loc.search}`;
            } catch { /* 相对跳转原样返回 */ }
        }

        const buf = Buffer.from(await upstream.arrayBuffer());
        console.log('[zproxy]', method, `/${rest.split('?')[0]}`, '→', upstream.status,
            `${buf.length}B`, `cookie=${jar.size}`);
        if (upstream.status >= 400) {
            // 非 2xx 把上游原文带出来，403 到底是风控还是签名不符，看这条就知道
            console.log('[zproxy]   body:', buf.toString('utf8').slice(0, 300).replace(/\s+/g, ' '));
        }
        res.writeHead(upstream.status, out);
        res.end(buf);
    };

    return {
        name: 'zhihu-dev-proxy',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use('/__zproxy', handler);
            // 页面侧诊断回传通道：外部浏览器连接器读不到 console 时，dev 日志仍能看到页面发生了什么
            server.middlewares.use('/__zlog', (req, res) => {
                const raw = req.url.replace(/^[/?]/, '');
                console.log('[zlog]', decodeURIComponent(raw));
                res.statusCode = 204;
                res.end();
            });
            const seeded = jar.size ? `已注入 ${jar.size} 条 cookie` : '未注入 cookie（游客链路）';
            console.log(`[zproxy] 反代已挂载 /__zproxy —— ${seeded}`);
        },
    };
}
