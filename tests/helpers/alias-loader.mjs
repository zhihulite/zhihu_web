// 让 node 认得源码里的 @/ 别名（等价于 vite.config.js 的 resolve.alias）。
const SRC = new URL('../../src/', import.meta.url).href;
const F7_STUB = new URL('./f7-stub.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
    // node 侧没有可挂载的 Framework7 实例，被测代码用到的那部分 API 换成记录调用的替身
    if (specifier === 'framework7-vue') {
        return { url: F7_STUB, format: 'module', shortCircuit: true };
    }
    if (specifier.startsWith('@/')) {
        // node 按包类型会把源码 .js 当成 CommonJS 重新解析，这里直接声明为 ESM
        const resolved = await nextResolve(SRC + specifier.slice(2), context);
        return { ...resolved, format: 'module' };
    }
    return nextResolve(specifier, context);
}
