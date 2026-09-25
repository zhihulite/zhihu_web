// 以新模块身份再加载一次 scroll-store：模块内的条目缓存在首次读取时做过期清理，
// 换个查询参数就能重跑那段初始化。
const mod = await import(`@/services/scroll-store.js?v=${Date.now()}`);

export const getScrollPosition = (url) => mod.getScrollPosition(url);
export const setScrollPosition = (url, position) => mod.setScrollPosition(url, position);
