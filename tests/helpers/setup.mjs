// 测试运行前的全局环境：解析 @/ 别名，并装上浏览器 API 的最小替身。
// 由 package.json 的 npm test 以 --import 加载。
import { register } from 'node:module';

register('./alias-loader.mjs', import.meta.url);

// 被测代码的逐请求日志会淹没断言输出，warn/error 保留
console.log = () => { };

const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
};
globalThis.__resetStorage = () => store.clear();

if (!globalThis.window) globalThis.window = globalThis;
globalThis.window.addEventListener = globalThis.window.addEventListener || (() => {});
globalThis.window.dispatchEvent = globalThis.window.dispatchEvent || (() => {});
globalThis.window.location = globalThis.window.location || { href: 'http://localhost/', pathname: '/' };

if (!globalThis.navigator) globalThis.navigator = {};
if (!globalThis.crypto) {
    const { webcrypto } = await import('node:crypto');
    globalThis.crypto = webcrypto;
}
if (!globalThis.btoa) {
    globalThis.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
    globalThis.atob = (s) => Buffer.from(s, 'base64').toString('binary');
}

// GM 桥有两种：默认假 GM（记录请求、返回 fixture，离线可重复）；
// LIVE=1 时换成打到 dev 反代的真桥，让真接口形状也能被断言。
if (process.env.LIVE === '1') {
    const { installProxyGM } = await import('./proxy-gm.mjs');
    installProxyGM();
} else {
    const { installFakeGM } = await import('./fake-gm.mjs');
    installFakeGM();
}
