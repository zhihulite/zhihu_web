/**
 * src/composables/usePageState.js
 * 页面状态恢复：页面被 Framework7 从 DOM 移除时保存状态与滚动位置，返回该页面时恢复。
 *
 * routeId 由修改版 Framework7 为每条路由的 options.props 注入 getter 生成，导航时求值为稳定
 * 字符串随 props 下发。本项目不声明该 prop，故它落在组件实例的 attrs 上。同一路由实例在返回栈
 * 存续期间复用同一 routeId，恢复因此能命中。
 */
import { onMounted, onBeforeUnmount, getCurrentInstance, ref, isRef, unref, nextTick } from 'vue';
import { pageCache } from '@/services/page-cache.js';

// 目标元素可能晚于 onMounted 渲染完成，缺失的键延后重试一次
const SCROLL_RETRY_DELAY = 100;

export function usePageState(options = {}) {
    const instance = getCurrentInstance();
    const routeId = options.routeId ?? instance?.attrs?.routeId ?? null;
    const enabled = options.enabled !== false && Boolean(routeId);

    const mainScrollEl = () => instance?.proxy?.$el?.querySelector?.('.page-content') || null;

    // scroll 收到页面自身的滚动容器，多滚动区的页面在此之上追加自己的键
    const resolveScrollMap = () =>
        (typeof options.scroll === 'function' ? options.scroll(mainScrollEl()) : { main: mainScrollEl() }) || {};

    const hasCache = ref(enabled && Boolean(pageCache.get(routeId)));

    const save = () => {
        if (!enabled) return;

        const data = {};
        for (const [key, value] of Object.entries(options.state || {})) {
            data[key] = unref(value);
        }

        const scrollMap = {};
        for (const [key, el] of Object.entries(resolveScrollMap())) {
            if (el) scrollMap[key] = el.scrollTop;
        }
        data._scrollMap = scrollMap;

        pageCache.save(routeId, data);
    };

    const restore = () => {
        if (!enabled) return;

        const data = pageCache.get(routeId);
        if (!data) return;

        for (const [key, value] of Object.entries(options.state || {})) {
            if (data[key] === undefined) continue;
            if (isRef(value)) value.value = data[key];
            else Object.assign(value, data[key]);
        }

        // 惰性标志不参与持久化：命中缓存即表示不再发起请求
        for (const flag of [].concat(options.loading || [])) {
            if (isRef(flag)) flag.value = false;
        }

        if (!data._scrollMap) return;

        const applyScroll = () => {
            const elements = resolveScrollMap();
            let pending = false;
            for (const [key, top] of Object.entries(data._scrollMap)) {
                const el = elements[key];
                if (!el) {
                    pending = true;
                    continue;
                }
                el.scrollTop = top;
            }
            return pending;
        };

        nextTick(() => {
            if (applyScroll()) setTimeout(applyScroll, SCROLL_RETRY_DELAY);
        });
    };

    onMounted(restore);
    onBeforeUnmount(save);

    return { hasCache };
}
