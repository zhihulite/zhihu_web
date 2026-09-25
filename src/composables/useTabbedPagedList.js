/**
 * src/composables/useTabbedPagedList.js
 * 多 Tab 分页：每个 tab 各持一份列表与游标，懒加载。
 *
 * 与单列表共用同一套分页引擎（runPagedLoad），
 * 差异只在「每个 tab 一份 page」与 fetch/map 带 tabId 入参。
 * tabs() 每次返回当前 tab id 列表 —— tab 定义可能随登录用户变化，ensure 时补齐缺失条目。
 *
 * tabs 只含数据字段、可整体交给 usePageState 持久化；loading 按 tab id 单独记录，不持久化。
 */
import { reactive } from 'vue';
import { emptyPage, runPagedLoad, makeListMapper } from '@/composables/usePagedList.js';
import { useAlive } from '@/composables/useAlive.js';
import { useAutoFill } from '@/composables/useAutoFill.js';

export function useTabbedPagedList(options) {
    const tabs = reactive({});
    const loading = reactive({});
    const { isAlive, acquireSignal } = useAlive();

    // fillEl(tabId) 必填才启用满屏补拉：多 Tab 下猜「首个可见容器」会给后台 tab 空转拉完整页
    const autoFill = useAutoFill({
        getEl: options.fillEl,
        onLoad: (id) => load(id, false),
    });

    const ensure = () => {
        for (const id of options.tabs()) {
            if (!tabs[id]) tabs[id] = emptyPage();
            if (loading[id] === undefined) loading[id] = false;
        }
    };

    const mapperFor = makeListMapper(options);

    // 每个 tab 一个加载代号：刷新要作废在途的旧结果，否则旧页会盖在新页之上
    const epoch = {};

    const load = async (id, isRefresh) => {
        ensure();
        const tab = tabs[id];
        if (!tab) return;
        // 加载更多才排在在途请求后面；刷新代表用户意图，直接抢下这一轮
        if (!isRefresh && (loading[id] || !tab.hasMore)) return;

        loading[id] = true;
        const attempt = (epoch[id] || 0) + 1;
        epoch[id] = attempt;
        const signal = acquireSignal();
        const isCurrent = () => isAlive() && epoch[id] === attempt;
        const prevLength = tab.list.length;
        await runPagedLoad(tab, isRefresh, {
            fetch: () => options.fetch(id, signal),
            signal,
            mapList: mapperFor(id),
            onError: options.onError && ((e) => options.onError(e, id)),
            name: options.name,
            isAlive: isCurrent,
        });
        if (isCurrent()) {
            loading[id] = false;
            // 刷新为整表替换，按「换到了内容」判断；加载更多才比增量（同 usePagedList）
            const appended = isRefresh ? tab.list.length : tab.list.length - prevLength;
            if (tab.hasMore && appended > 0) autoFill.schedule(id);
        }
    };

    return {
        tabs,
        loading,
        ensure,
        refresh: (id) => load(id, true),
        loadMore: (id) => load(id, false),
        ensureLoaded: (id) => {
            ensure();
            if (tabs[id]?.lastResult) return undefined;
            return load(id, true);
        },
        // 重置同时作废在途请求：换关键词/重开弹层后，旧结果不该落进已清空的列表
        reset: (id) => {
            ensure();
            epoch[id] = (epoch[id] || 0) + 1;
            Object.assign(tabs[id], emptyPage());
        },
    };
}
