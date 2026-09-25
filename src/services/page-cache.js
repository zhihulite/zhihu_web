/**
 * src/services/page-cache.js
 * 页面状态缓存：以路由实例的 routeId 为键，保存页面卸载时的状态与滚动位置。
 *
 * 缓存保存的是响应式对象的引用而非序列化副本，lastResult 一类带方法的取值原样保留。
 * 存活范围由返回栈决定，见 core/router.js 的 prune 调用。
 */

const cache = new Map();

export const pageCache = {
    save(routeId, patch) {
        if (!routeId) return;
        cache.set(routeId, { ...cache.get(routeId), ...patch });
    },

    get(routeId) {
        if (!routeId) return undefined;
        return cache.get(routeId);
    },

    prune(liveRouteIds) {
        const live = new Set(liveRouteIds);
        cache.forEach((_, routeId) => {
            if (!live.has(routeId)) cache.delete(routeId);
        });
    },
};
