// src/core/home-tabs.js
// 主页栏目配置的唯一来源：响应式 store + 持久化，设置页写、主页订阅。
// 旧版在 HomeView/SettingsView 各写一份 localStorage 读写并用 window CustomEvent 通知，此处收敛为单点。
import { reactive, watch } from 'vue';
import { KEYS, getJSON, setJSON } from '@/services/storage.js';

export const HOME_TAB_IDS = ['recommend', 'following', 'hot', 'thoughts'];
const isKnown = (id) => HOME_TAB_IDS.includes(id);

function normalizeTabs(rawTabs) {
    const map = new Map(rawTabs.filter((t) => isKnown(t.id)).map((t) => [t.id, t.enabled !== false]));
    // 配置里缺的栏目补在末尾，默认启用
    HOME_TAB_IDS.forEach((id) => { if (!map.has(id)) map.set(id, true); });
    return [...map.entries()].map(([id, enabled]) => ({ id, enabled }));
}

/** 主页栏目只能落在启用的栏目上，否则回落到"未指定"由主页取首个 */
function pickDefault(tabs, def) {
    return tabs.some((t) => t.id === def && t.enabled) ? def : '';
}

function load() {
    const cfg = getJSON(KEYS.homeTabs, null);
    if (!cfg || !Array.isArray(cfg.tabs)) {
        return { tabs: HOME_TAB_IDS.map((id) => ({ id, enabled: true })), default: '', defaultFollowing: '' };
    }
    const tabs = normalizeTabs(cfg.tabs);
    return {
        tabs,
        default: pickDefault(tabs, cfg.default),
        defaultFollowing: cfg.defaultFollowing || '',
    };
}

export const homeTabs = reactive(load());

watch(homeTabs, (val) => {
    setJSON(KEYS.homeTabs, {
        tabs: val.tabs.map((t) => ({ id: t.id, enabled: t.enabled })),
        default: val.default,
        defaultFollowing: val.defaultFollowing,
    });
}, { deep: true });

/** 设置页保存：归一化后整体替换，触发 watch 落盘并让主页 watch 生效 */
export function saveHomeTabs({ tabs, default: def, defaultFollowing }) {
    const next = normalizeTabs(tabs.map((t) => ({ id: t.id, enabled: !!t.enabled })));
    homeTabs.tabs = next;
    homeTabs.default = pickDefault(next, def);
    homeTabs.defaultFollowing = defaultFollowing || '';
}
