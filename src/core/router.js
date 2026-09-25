/**
 * src/core/router.js
 * 路由基础设施：返回栈缓存回收。
 */
import { f7 } from 'framework7-vue';
import { pageCache } from '@/services/page-cache.js';

// propsHistory 与 history 逐项对应，条目在 back 时一并弹出，
// 因此栈上各条目的 routeId 就是仍可返回的页面集合
const backStackRouteIds = (router) =>
    (router.propsHistory || []).map((props) => props?.routeId).filter(Boolean);

export function installPageCachePruner() {
    const router = f7?.views?.main?.router;
    if (!router) return;

    const prune = () => pageCache.prune(backStackRouteIds(router));
    router.on('routeChange', prune);
    prune();
}
