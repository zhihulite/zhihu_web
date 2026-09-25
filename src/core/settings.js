// src/core/settings.js
// 应用设置：一键一处定义。
// 在 SCHEMA 里加一行即得到默认值、读写接口与响应式访问，持久化到 localStorage。
import { reactive, watch } from 'vue';
import { KEYS, getJSON, setJSON } from '@/services/storage.js';
import { debounce } from '@/utils/timing.js';

// key → 默认值。新增设置项只需在此加一行。
const SCHEMA = {
    blockWords: '',        // 屏蔽词，逗号/换行分隔；命中标题或摘要的 feed 条目被过滤
    hotHideImage: false,   // 热榜隐藏封面
    hotHideMetrics: false, // 热榜隐藏热度
    // 页面布局（对应全局 CSS 变量，见 core/layout.js；字号仍归主题配置管理）
    pageMargin: 16,        // 卡片左右外边距 px → --app-page-margin
    cardGap: 8,            // 卡片纵向间距 px → --app-card-gap
    cardPadding: 16,       // 卡片内边距 px → --app-card-padding
    noImage: false,        // 无图模式：隐藏内容配图，保留头像/图标
    parallelWorld: false,  // 平行世界：宽视口下主页与详情双栏，改完要重启
    panelPinned: true,     // 宽视口下侧栏常驻；点左上菜单键收起后记住，刷新不再自动弹回
    // 回答页
    answerSinglePage: false, // 一次只看一条：关掉上下滑切换
    codeWrap: true,          // 代码块过长时换行显示，关闭则横向滑动查看
    floatScrollButtons: false, // 页侧悬浮的逐屏上下滚按钮
    // 推荐流
    dedupWindow: 100,      // 去重记住的已展示条数，0 为关闭
    // 搜索
    searchEngineUrl: 'https://www.bing.com/search?q=site%3Azhihu.com%20', // 站外搜索兜底模板
    closeHotSearch: false, // 关闭搜索页「全站热搜」区块
    // 推荐分区（feed-root/sections）
    hideAllSection: false,       // 隐藏「全站」分区
    sectionOrder: [],            // 分区 section_id 的偏好顺序（不在表内的按接口原序排在后面）
    hiddenSections: [],          // 被隐藏的分区 section_id
    // 更新
    autoCheckUpdate: true, // 启动时自动检查更新
    ignoredVersion: '',    // 「忽略此版本」记录的版本号
};

const load = () => {
    return { ...SCHEMA, ...getJSON(KEYS.settings, {}) };
};

// 全局单例响应式设置，任意组件 import 即共享
export const settings = reactive(load());

// 滑杆与输入框是逐字符/逐帧改值，落盘合批到 300ms，免得一次拖动写几十遍 localStorage
const persistSettings = debounce((val) => setJSON(KEYS.settings, val), 300);

watch(settings, persistSettings, { deep: true });

// 合批窗口内离开页面会丢掉最后一次改动，卸载前无条件补写
window.addEventListener('pagehide', () => setJSON(KEYS.settings, settings));

/** 把给定设置项写回默认值，未注册的 key 忽略 */
export function resetSettings(keys) {
    for (const key of keys) {
        if (key in SCHEMA) settings[key] = SCHEMA[key];
    }
}

/** 屏蔽词数组（去空、去重） */
export function blockWordList() {
    return [...new Set(
        (settings.blockWords || '')
            .split(/[,，\n]/)
            .map((w) => w.trim())
            .filter(Boolean)
    )];
}

/** 生成 feed 条目屏蔽词过滤器：命中 title/excerpt/preview 任一即过滤 */
export function makeBlockWordsFilter() {
    const words = blockWordList();
    if (words.length === 0) return null;
    return (item) => {
        const text = `${item?.title || ''} ${item?.excerpt || ''} ${item?.preview || ''}`;
        return !words.some((w) => text.includes(w));
    };
}
