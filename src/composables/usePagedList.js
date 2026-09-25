/**
 * src/composables/usePagedList.js
 * 单列表分页：首屏加载、加载更多、下拉刷新与三态维护。
 *
 * 一个 composable 驱动一个列表页，以 fetch / map 函数参数定制行为。
 * 分页引擎（runPagedLoad）只写一份，useTabbedPagedList 复用它，单列表是 key 唯一的退化。
 *
 * page 只含数据字段、不含方法，可整体交给 usePageState 持久化；loading 是惰性标志，不持久化。
 */
import { reactive, ref } from 'vue';
import { f7 } from 'framework7-vue';
import { useAlive } from '@/composables/useAlive.js';
import { useAutoFill } from '@/composables/useAutoFill.js';

export function emptyPage() {
    return { list: [], hasMore: true, lastResult: null };
}

/**
 * 执行一次加载并把结果写入 page；分页游标沿用 page.lastResult。
 * 三态锁由调用方在外层持有 —— 单列表用 ref、多 Tab 用按 id 索引的 reactive，载体不同。
 * @param {object} page emptyPage() 形状的响应式对象
 * @param {boolean} isRefresh 是否重取首页
 * @param {object} spec
 * @param {() => Promise<any>} spec.fetch 取首页
 * @param {(raw:any[], res:any) => any[]} spec.mapList 原始数组 → 视图项数组
 * @param {(e:Error) => void} [spec.onError]
 * @param {string} [spec.name] 出错日志用的列表名
 * @param {() => boolean} [spec.isAlive] 存活守卫：返回 false 时丢弃本次结果，不写 page
 */
export async function runPagedLoad(page, isRefresh, { fetch, mapList, onError, name, isAlive, signal }) {
    try {
        // 续取沿用 page.lastResult 里的游标，但 signal 是一次性的，必须换成本次加载自己的
        const res = isRefresh || !page.lastResult
            ? await fetch()
            : await page.lastResult.next(signal ? { signal } : undefined);
        // 请求返回时组件可能已卸载/翻页，丢弃过期结果
        if (isAlive && !isAlive()) return;
        if (!res) {
            page.hasMore = false;
            return;
        }
        const raw = Array.isArray(res) ? res : res?.data || [];
        const next = mapList(raw, res);
        page.list = isRefresh ? next : page.list.concat(next);
        page.lastResult = res;
        page.hasMore = res.hasMore ?? false;
    } catch (e) {
        if (isAlive && !isAlive()) return;
        // 主动取消（切页/刷新作废）不是失败，不该弹提示
        if (e?.name === 'AbortError') return;
        if (onError) onError(e);
        else {
            // 页面没自带提示时也要说清为什么停住：静默失败看起来像"没有更多了"
            console.error(`${name || '列表'}加载失败`, e);
            if (!e?.notified) f7.toast.show({ text: e?.message || '加载失败', closeTimeout: 2500 });
        }
    }
}

/**
 * 由 options（map/mapList/filter）装配出 mapList：映射 → 去空 → 过滤。
 * filter 支持传函数或返回函数的 getter（如 computed），屏蔽词等动态设置在下次加载即生效。
 * tabId 供 useTabbedPagedList 透传给按 tab 定制的 map/mapList。
 */
export function makeListMapper(options) {
    return (tabId) => {
        const base = options.mapList
            ? (raw, res) => options.mapList(raw, tabId, res)
            : options.map ? (raw) => raw.map((item) => options.map(item, tabId)) : (raw) => raw;
        return (raw, res) => {
            const mapped = base(raw, res).filter((x) => x != null);
            const fn = typeof options.filter === 'function' ? options.filter : options.filter?.value;
            return fn ? mapped.filter(fn) : mapped;
        };
    };
}

export function usePagedList(options) {
    const page = reactive(emptyPage());
    const loading = ref(false);
    const { isAlive, acquireSignal } = useAlive();

    const mapList = makeListMapper(options)();

    // fillEl 省略时按「组件内首个可见 .page-content」判定，单列表页无需额外装配
    const autoFill = useAutoFill({
        getEl: options.fillEl,
        onLoad: () => load(false),
    });

    // 加载代号：刷新要作废在途的旧结果，否则旧页会盖在新页之上
    let attempt = 0;

    const load = async (isRefresh) => {
        // 加载更多才排在在途请求后面；刷新代表用户意图，直接抢下这一轮
        if (!isRefresh && (loading.value || !page.hasMore)) return;

        loading.value = true;
        const myAttempt = ++attempt;
        const isCurrent = () => isAlive() && attempt === myAttempt;
        const signal = acquireSignal();
        const prevLength = page.list.length;
        await runPagedLoad(page, isRefresh, { fetch: () => options.fetch(signal), signal, mapList, onError: options.onError, name: options.name, isAlive: isCurrent });
        if (isCurrent()) {
            loading.value = false;
            // 只在确有新增时补拉：空页或整页被屏蔽词过滤时不循环请求。
            // 刷新是整表替换，故按「换到了内容」判断，不比长度增量
            const appended = isRefresh ? page.list.length : page.list.length - prevLength;
            if (page.hasMore && appended > 0) autoFill.schedule();
        }
    };

    return {
        page,
        loading,
        refresh: () => load(true),
        loadMore: () => load(false),
        ensureLoaded: () => (page.lastResult ? undefined : load(true)),
        // 重置同时作废在途请求，旧结果不再落进已清空的列表
        reset: () => {
            attempt++;
            Object.assign(page, emptyPage());
        },
    };
}
