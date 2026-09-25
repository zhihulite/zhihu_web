<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { f7 } from 'framework7-vue';

import TabLayout from '@/components/TabLayout.vue';
import FeedCard from '@/components/FeedCard.vue';
import $http from '@/services/http.js';
import { parseZhihuUrl } from '@/utils/url.js';
import { handleZhihuUrl, openLink } from '@/core/navigation.js';
import { settings } from '@/core/settings.js';
import { usePageState } from '@/composables/usePageState.js';
import { useTabbedPagedList } from '@/composables/useTabbedPagedList.js';
import { KEYS, getJSON, setJSON, removeKeys } from '@/services/storage.js';

const props = defineProps({
    f7router: Object
});

const query = ref('');
const activeTab = ref('general');
const isSearching = ref(false);
const searchbarRef = ref(null);

const searchHistory = ref([]);
const hotSearches = ref([]);
const isLoadingHotSearches = ref(false);

// 搜索标签定义
const SEARCH_TABS = [
    { id: 'general', label: '综合' },
    { id: 'realtime', label: '实时' },
    { id: 'people', label: '用户' },
    { id: 'column', label: '专栏' },
    { id: 'publication', label: '盐选内容' },
    { id: 'zvideo', label: '视频' },
    { id: 'pin', label: '想法' },
    { id: 'topic', label: '话题' }
];

const tabRefs = ref({});

const searchUrlFor = (tabId) => {
    const isRealTime = tabId === 'realtime';
    const type = isRealTime ? 'general' : tabId;
    const p = new URLSearchParams({
        gk_version: 'gz-gaokao',
        q: query.value,
        t: type,
        search_source: 'History',
        is_real_time: isRealTime ? '1' : '0',
        correction: '1',
        advert_count: '',
        show_all_topics: '0',
        pin_flow: 'false',
        restricted_scene: '',
        restricted_field: '',
        restricted_value: '',
        limit: '20',
        lc_idx: '0',
    });
    return `https://api.zhihu.com/search_v3?${p.toString()}`;
};

// 搜索原始项 → 卡片视图模型；无作者信息或非目标类型返回 null 交给引擎过滤
const mapSearchItem = (item) => {
    const { object, type: itemType } = item;

    if (itemType === 'knowledge_ad') {
        const { url = '', body = {}, footer = null } = object;
        const title = body.title || '';
        const excerpt = body.description || '';
        return {
            id: url,
            type: 'browser',
            title,
            content: excerpt,
            excerpt,
            authorName: '',
            noAuthorPrefix: true,
            avatarUrl: '',
            footer,
            metrics: { likes: 0, comments: 0 },
            url
        };
    }

    if (!object?.author && !object?.avatar_url) return null;

    const {
        id: objectId,
        type: objectType,
        title = '',
        excerpt = '',
        url = '',
        voteup_count: likes = 0,
        comment_count: comments = 0,
        author,
        zvideo_id: zvideoId
    } = object;

    const authorName = author?.name || '';
    const avatarUrl = author?.avatar_url || object.avatar_url || '';
    const highlightTitle = item.highlight?.title || '';
    const highlightDesc = item.highlight?.description || '';

    return {
        id: objectType === 'zvideo' && zvideoId ? zvideoId : objectId,
        type: objectType,
        title: highlightTitle || title,
        content: highlightDesc || excerpt,
        excerpt: highlightDesc || excerpt,
        authorName,
        noAuthorPrefix: authorName === '',
        avatarUrl,
        footer: null,
        metrics: { likes, comments },
        url
    };
};

// 分页走统一引擎（useTabbedPagedList），替代旧的手写 executeSearch 复刻
const {
    tabs: tabResults,
    loading: resultsLoading,
    refresh: refreshTab,
    loadMore: loadMoreTab,
    reset: resetTab,
} = useTabbedPagedList({
    name: '搜索',
    tabs: () => SEARCH_TABS.map((t) => t.id),
    fillEl: (tabId) => tabRefs.value[tabId]?.$el,
    fetch: (tabId, signal) => $http.get(searchUrlFor(tabId), { signal }),
    map: mapSearchItem,
    onError: () => f7.toast.create({ text: '搜索失败' }).open(),
});

const { hasCache } = usePageState({
    state: {
        query,
        activeTab,
        isSearching,
        tabResults
    },
    scroll: (main) => {
        const map = { main };
        // 每个 tab 各自持有 f7-page-content，它就是可滚动元素本身
        Object.entries(tabRefs.value).forEach(([id, el]) => {
            if (el) map[id] = el.$el;
        });
        return map;
    }
});

// 搜索建议：F7 Autocomplete 下拉模式挂在 searchbar 输入框上
const suggestionSource = (q, render) => {
    const term = q.trim();
    if (!term) {
        render([]);
        return;
    }
    $http.get(`https://www.zhihu.com/api/v4/search/suggest?q=${encodeURIComponent(term)}`)
        .then((res) => render((res?.suggest || []).map((s, i) => ({ id: `s${i}`, text: s.query || String(s) }))))
        .catch(() => render([]));
};

let suggestions = null;

onMounted(() => {
    const inputEl = searchbarRef.value?.$el?.querySelector('input');
    if (inputEl) {
        suggestions = f7.autocomplete.create({
            inputEl,
            dropdown: true,
            source: suggestionSource,
            on: {
                change: (ac, value) => {
                    const picked = Array.isArray(value) ? value[0] : value;
                    const text = typeof picked === 'string' ? picked : picked?.text;
                    if (text) handleSearch(text);
                },
            },
        });
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && query.value.trim()) handleSearch();
        });
    }
    if (!hasCache.value) {
        nextTick(() => inputEl?.focus());
        fetchHotSearches();
        loadSearchHistory();
    }
});

onUnmounted(() => suggestions?.destroy?.());

// 加载搜索历史
const loadSearchHistory = () => {
    searchHistory.value = getJSON(KEYS.searchHistory, []);
};

// 保存搜索历史：新查询置顶，去重并限制条数
const saveSearchHistory = (text) => {
    if (!text.trim()) return;
    const index = searchHistory.value.indexOf(text);
    if (index > -1) {
        searchHistory.value.splice(index, 1);
    }
    searchHistory.value.unshift(text);
    if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10);
    }
    setJSON(KEYS.searchHistory, searchHistory.value);
};

// 获取热搜数据
const fetchHotSearches = async () => {
    isLoadingHotSearches.value = true;
    try {
        const data = await $http.get('https://api.zhihu.com/search/hot_search')

        if (data && data.hot_search_queries) {
            hotSearches.value = data.hot_search_queries.map((item, index) => ({
                rank: index + 1,
                title: item.query || item.real_query || '未知话题',
                hot: item.hot_show || `${Math.floor(item.hot / 10000)}万`
            }))
        }
    } catch (error) {
        console.error('获取热搜数据失败:', error);
        hotSearches.value = [
            { rank: 1, title: '热搜加载失败', hot: '0' }
        ];
    } finally {
        isLoadingHotSearches.value = false;
    }
};



// 处理搜索
const handleSearch = async (text = query.value) => {
    if (!text.trim()) return;

    // 检查输入是否是知乎URL
    const urlResult = await parseZhihuUrl(text);
    if (urlResult.type !== 'error' && urlResult.type !== 'browser') {
        // 是知乎URL，清空输入框并处理
        query.value = '';
        await handleZhihuUrl(props.f7router, text);
        return;
    }

    // 外部链接直接浏览器打开
    if (urlResult.type === 'browser' && urlResult.id) {
        openLink(urlResult.id);
        return;
    }

    // 普通搜索
    query.value = text;
    isSearching.value = true;
    saveSearchHistory(text);
    // 新查询重置全部 tab：当前 tab 立即取，其余切到时懒加载
    SEARCH_TABS.forEach((t) => resetTab(t.id));
    refreshTab(activeTab.value);
};

// 站内搜索兜底：用配置的搜索引擎模板跳到站外
const handleExternalSearch = () => {
    if (!query.value.trim()) return;
    openLink(`${settings.searchEngineUrl}${encodeURIComponent(query.value)}`);
};

const searchEngineName = computed(() => {
    try {
        return new URL(settings.searchEngineUrl).hostname.replace(/^www\./, '');
    } catch {
        return '搜索引擎';
    }
});

// 处理清除历史
const handleClearHistory = () => {
    searchHistory.value = [];
    removeKeys(KEYS.searchHistory);
};

// 处理单个历史记录删除
const deleteHistoryItem = (index) => {
    searchHistory.value.splice(index, 1);
    setJSON(KEYS.searchHistory, searchHistory.value);
};

// 处理返回
const handleBack = () => {
    if (props.f7router) props.f7router.back();
};

// 处理标签页切换
const handleTabChange = (tabId) => {
    if (activeTab.value === tabId) return;
    activeTab.value = tabId;
    // 切到的标签页还没结果则懒加载取首页
    if (isSearching.value && !(tabResults[tabId]?.list.length > 0)) {
        refreshTab(tabId);
    }
};

// 处理输入框清除
const handleInputClear = () => {
    query.value = '';
    isSearching.value = false;
    searchbarRef.value?.$el?.querySelector('input')?.focus();
};

const handleTabRefresh = async (tabId, done) => {
    await refreshTab(tabId);
    done();
};

const handleTabLoadMore = (tabId) => {
    loadMoreTab(tabId);
};
</script>

<template>
    <f7-page class="search-page">
        <f7-navbar>
            <f7-nav-left>
                <f7-link icon-only @click="handleBack">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-searchbar ref="searchbarRef" custom-search v-model:value="query"
                @searchbar:clear="handleInputClear" placeholder="搜索..." :disable-button="false"
                clear-button></f7-searchbar>
            <f7-nav-right>
                <f7-link @click="() => handleSearch()">搜索</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <!-- 搜索结果视图 -->
        <div v-if="isSearching" class="results-container">
            <TabLayout :tabs="SEARCH_TABS" :onChange="handleTabChange" :scrollable="true" :fixed="false"
                :auto-page-content="false">
                <!-- 每个标签页的内容 -->
                <template v-for="tab in SEARCH_TABS" :key="tab.id" #[tab.id]>
                    <f7-page-content :ref="el => tabRefs[tab.id] = el" ptr @ptr:refresh="(done) => handleTabRefresh(tab.id, done)" infinite
                        @infinite="handleTabLoadMore(tab.id)">
                        <!-- 有结果：显示列表 -->
                        <div v-if="tabResults[tab.id]?.list.length > 0" class="results-list">
                            <FeedCard v-for="(item, idx) in tabResults[tab.id].list" :key="item.id || idx"
                                :item="item" @click="$handleCardClick(f7router, item)"
                                class="result-card margin-bottom" />

                            <div v-if="!tabResults[tab.id]?.hasMore"
                                class="end-message text-color-gray text-align-center padding">
                                已加载全部搜索结果
                            </div>
                        </div>

                        <!-- 无结果且加载完成：显示空状态 -->
                        <div v-else-if="!resultsLoading[tab.id]"
                            class="empty-state display-flex flex-direction-column align-items-center justify-content-center padding-vertical">
                            <f7-icon ios="f7:multiply_circle" md="material:search_off" size="32" />
                            <span class="empty-text margin-top">未找到与"{{ query }}"相关的内容</span>
                            <span class="empty-hint text-color-gray margin-top-half">尝试其他关键词，或检查拼写</span>
                            <f7-button class="margin-top" outline round small @click="handleExternalSearch">
                                用 {{ searchEngineName }} 站外搜索
                            </f7-button>
                        </div>
                    </f7-page-content>
                </template>
            </TabLayout>
        </div>

        <!-- 默认视图：历史和热搜 -->
        <div v-else-if="!isSearching" class="default-container padding">
            <!-- 搜索历史 -->
            <div v-if="searchHistory.length > 0" class="section margin-bottom">
                <div class="section-header display-flex justify-content-space-between align-items-center margin-bottom">
                    <span class="section-title font-weight-bold">搜索历史</span>
                    <f7-link icon-only @click="handleClearHistory" color="gray">
                        <f7-icon ios="f7:trash" md="material:delete" size="18" />
                    </f7-link>
                </div>
                <div class="history-chips display-flex flex-wrap" style="gap: 8px;">
                    <f7-chip v-for="(text, i) in searchHistory" :key="text" :text="text" @click="(e) => { if (!e.target.closest('.chip-delete')) handleSearch(text); }"
                        class="history-chip" outline deleteable @delete="deleteHistoryItem(i)" />
                </div>
            </div>

            <!-- 热搜列表 -->
            <div class="section" v-if="!settings.closeHotSearch">
                <div class="section-header display-flex justify-content-space-between align-items-center margin-bottom">
                    <span class="section-title font-weight-bold">全站热搜</span>
                    <f7-link icon-only @click="fetchHotSearches" :class="{ 'spinning': isLoadingHotSearches }">
                        <f7-icon ios="f7:arrow_clockwise" md="material:refresh" size="18" />
                    </f7-link>
                </div>
                <div class="list no-hairlines-md">
                    <f7-list>
                        <f7-list-item v-for="(item, index) in hotSearches" :key="index" link
                            @click="handleSearch(item.title)">
                            <div slot="media" class="trending-rank" :class="{ 'text-color-red': index < 3 }">{{
                                item.rank }}
                            </div>
                            <div slot="title">{{ item.title }}</div>
                            <div slot="after" class="text-color-gray text-size-12">{{ item.hot }}</div>
                        </f7-list-item>
                    </f7-list>
                </div>
            </div>
        </div>
    </f7-page>
</template>

<style scoped>

.results-container,
.default-container {
    flex: 1;
    height: calc(100% - 64px);
}


.results-list {
    padding-bottom: 80px;
}

.results-list>* {
    margin-bottom: 16px;
}

.empty-hint {
    margin-top: 8px;
    font-size: 14px;
    color: var(--app-sub-text);
}

.end-message {
    text-align: center;
    font-size: 14px;
    color: var(--app-sub-text);
    padding: 16px 0;
}

.section {
    padding: 16px;
    margin-bottom: 24px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-title {
    font-weight: bold;
    font-size: 16px;
    color: var(--f7-text-color);
    margin-bottom: 16px;
    display: block;
}

.history-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.trending-rank {
    width: 24px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    color: var(--app-sub-text);
}
</style>