<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue';

import TabLayout from './TabLayout.vue';
import FeedCard from './FeedCard.vue';
import $http from '../api/http.js';
import { parseZhihuUrl, handleZhihuUrl } from '../utils/zhihu_url.js';


const props = defineProps({
    f7router: Object
});

const query = ref('');
const activeTab = ref('general');
const isSearching = ref(false);
const inputRef = ref(null);

// 搜索建议相关
const searchSuggestions = ref([]);
const showSuggestions = ref(false);
const isLoadingSuggestions = ref(false);

// 输入防抖计时器
let debounceTimer = null;
const DEBOUNCE_DELAY = 300; // 防抖延迟时间，单位ms


const searchHistory = ref([]);
const hotSearches = ref([]);
const isLoadingHotSearches = ref(false);

// 按标签页独立管理搜索结果
const tabSearchResults = ref({
    general: { results: [], hasMore: true, lastResult: null },
    realtime: { results: [], hasMore: true, lastResult: null },
    people: { results: [], hasMore: true, lastResult: null },
    column: { results: [], hasMore: true, lastResult: null },
    publication: { results: [], hasMore: true, lastResult: null },
    zvideo: { results: [], hasMore: true, lastResult: null },
    pin: { results: [], hasMore: true, lastResult: null },
    topic: { results: [], hasMore: true, lastResult: null }
});

const isLoadingResults = ref(false);

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

// 获取当前标签页是否还有更多结果
const currentTabHasMore = computed(() => {
    const tab = tabSearchResults.value[activeTab.value];
    return tab && tab.hasMore;
});

// 获取指定标签页的搜索结果
const getTabResults = (tabId) => {
    return tabSearchResults.value[tabId] || { results: [], hasMore: true, lastResult: null };
};

// 组件挂载
onMounted(() => {
    nextTick(() => inputRef.value?.focus());
    fetchHotSearches();
    loadSearchHistory();
});

// 加载搜索历史
const loadSearchHistory = () => {
    try {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            searchHistory.value = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('加载搜索历史失败:', error);
    }
};

// 保存搜索历史
const saveSearchHistory = (text) => {
    try {
        if (text.trim()) {
            // 如果已经存在相同的查询，先删除它
            const index = searchHistory.value.indexOf(text);
            if (index > -1) {
                searchHistory.value.splice(index, 1);
            }
            // 将新查询添加到历史记录的开头
            searchHistory.value.unshift(text);
            // 限制历史记录数量
            if (searchHistory.value.length > 10) {
                searchHistory.value = searchHistory.value.slice(0, 10);
            }
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
        }
    } catch (error) {
        console.error('保存搜索历史失败:', error);
    }
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

// 执行搜索
const executeSearch = async (newSearch = false, tabId = activeTab.value) => {
    if (!query.value.trim()) return;

    // 初始化标签页结果对象
    if (!tabSearchResults.value[tabId]) {
        tabSearchResults.value[tabId] = { results: [], hasMore: true, lastResult: null };
    }

    // 新搜索时重置状态
    if (newSearch) {
        tabSearchResults.value[tabId] = {
            results: [],
            hasMore: true,
            lastResult: null
        };
    }

    const currentTab = tabSearchResults.value[tabId];

    // 没有更多结果或正在加载时不再请求
    if (!currentTabHasMore.value || isLoadingResults.value) {
        return;
    }

    isLoadingResults.value = true;

    try {
        let res;

        if (currentTab.lastResult) {
            res = await currentTab.lastResult.next();
        } else {
            let searchType = tabId;
            let isRealTime = '0';

            if (tabId === 'realtime') {
                searchType = 'general';
                isRealTime = '1';
            }

            const searchUrl = `https://api.zhihu.com/search_v3?gk_version=gz-gaokao&q=${encodeURIComponent(query.value)}&t=${searchType}&search_source=History&is_real_time=${isRealTime}&correction=1&advert_count=&show_all_topics=0&pin_flow=false&restricted_scene=&restricted_field=&restricted_value=&limit=20&lc_idx=0`;
            res = await $http.get(searchUrl);
        }

        const apiData = res.data;
        const formattedResults = [];

        apiData.forEach(item => {
            const { object, type: itemType } = item;

            if (itemType === 'knowledge_ad') {
                const { url = '', body = {}, footer = null } = object;
                const title = body.title || '';
                const excerpt = body.description || '';

                formattedResults.push({
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
                });
                return;
            }

            if (!object?.author && !object?.avatar_url) return;

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

            let finalType = objectType;
            let finalId = objectId;

            if (objectType === 'zvideo' && zvideoId) {
                finalId = zvideoId;
            }

            formattedResults.push({
                id: finalId,
                type: finalType,
                title: highlightTitle || title,
                content: highlightDesc || excerpt,
                excerpt: highlightDesc || excerpt,
                authorName,
                noAuthorPrefix: authorName === '',
                avatarUrl,
                footer: null,
                metrics: { likes, comments },
                url
            });
        });

        // 更新当前标签页的搜索结果
        if (newSearch) {
            currentTab.results = formattedResults;
        } else {
            currentTab.results = [...currentTab.results, ...formattedResults];
        }

        // 保存lastResult和更新是否还有更多结果
        currentTab.lastResult = res;
        currentTab.hasMore = !!res.paging?.is_end;
    } catch (error) {
        console.error('搜索失败:', error);
    } finally {
        isLoadingResults.value = false;
    }
};


// 处理搜索
const handleSearch = async (text = query.value) => {
    if (!text.trim()) return;

    // 隐藏搜索建议
    showSuggestions.value = false;
    searchSuggestions.value = [];

    // 检查输入是否是知乎URL
    const urlResult = await parseZhihuUrl(text);
    if (urlResult.type !== 'error' && urlResult.type !== 'browser') {
        // 是知乎URL，清空输入框并处理
        query.value = '';
        await handleZhihuUrl(props.f7router, text);
        return;
    }

    // 普通搜索
    query.value = text;
    isSearching.value = true;
    saveSearchHistory(text);
    executeSearch(true);
};

// 处理清除历史
const handleClearHistory = () => {
    searchHistory.value = [];
    localStorage.removeItem('searchHistory');
};

// 处理单个历史记录删除
const deleteHistoryItem = (index) => {
    searchHistory.value.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
};

// 处理返回
const handleBack = () => {
    if (props.f7router) props.f7router.back();
};

// 获取搜索建议
const fetchSearchSuggestions = async (value) => {
    if (!value.trim()) {
        searchSuggestions.value = [];
        showSuggestions.value = false;
        return;
    }

    isLoadingSuggestions.value = true;
    try {
        const suggestUrl = `https://www.zhihu.com/api/v4/search/suggest?q=${encodeURIComponent(value)}`;
        const res = await $http.get(suggestUrl);
        if (res && res.suggest && res.suggest) {
            searchSuggestions.value = res.suggest;
            showSuggestions.value = true;
        } else {
            searchSuggestions.value = [];
        }
    } catch (error) {
        console.error('获取搜索建议失败:', error);
        searchSuggestions.value = [];
    } finally {
        isLoadingSuggestions.value = false;
    }
};

// 输入防抖处理函数 - 用于搜索建议
const debouncedSuggestions = (value) => {
    // 清除之前的计时器
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    // 设置新的计时器
    debounceTimer = setTimeout(() => {
        fetchSearchSuggestions(value);
    }, DEBOUNCE_DELAY);
};

// 处理标签页切换
const handleTabChange = (tabId) => {
    if (activeTab.value !== tabId) {
        activeTab.value = tabId;
        // 如果切换到的标签页还没有搜索结果，执行搜索
        if (isSearching.value && (!tabSearchResults.value[tabId] || tabSearchResults.value[tabId].results.length === 0)) {
            executeSearch(true, tabId);
        }
    }
};

// 处理输入框清除
const handleInputClear = () => {
    // 清除防抖计时器
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    query.value = '';
    isSearching.value = false;
    inputRef.value?.focus();
    // 清空搜索建议
    searchSuggestions.value = [];
    showSuggestions.value = false;
};

const handleTabRefresh = async (tabId, done) => {
    await executeSearch(true, tabId);
    done();
};

const handleTabLoadMore = async (tabId) => {
    const tabData = tabSearchResults.value[tabId];
    if (tabData && tabData.hasMore) {
        await executeSearch(false, tabId);
    }
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
            <f7-searchbar custom-search v-model:value="query" @searchbar:search="debouncedSuggestions($event.value)"
                @searchbar:clear="handleInputClear" placeholder="搜索..." :disable-button="false"
                clear-button></f7-searchbar>
            <f7-nav-right>
                <f7-link @click="() => handleSearch()">搜索</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <!-- 搜索建议列表 -->
        <div v-if="showSuggestions && searchSuggestions.length > 0" class="search-suggestions-container">
            <div class="search-suggestions">
                <f7-list>
                    <f7-list-item v-for="(suggestion, index) in searchSuggestions" :key="index" link
                        @click="() => handleSearch(suggestion.query)" :title="suggestion.query" class="suggestion-item">
                    </f7-list-item>
                </f7-list>
            </div>
        </div>

        <!-- 搜索结果视图 -->
        <div v-if="isSearching && !showSuggestions" class="results-container">
            <TabLayout :tabs="SEARCH_TABS" :onChange="handleTabChange" :scrollable="true" :fixed="false"
                :auto-page-content="false">
                <!-- 每个标签页的内容 -->
                <template v-for="tab in SEARCH_TABS" :key="tab.id" #[tab.id]>
                    <f7-page-content ptr @ptr:refresh="(done) => handleTabRefresh(tab.id, done)" infinite
                        @infinite="handleTabLoadMore(tab.id)">
                        <!-- 有结果：显示列表 -->
                        <div v-if="getTabResults(tab.id).results.length > 0" class="results-list">
                            <FeedCard v-for="(item, idx) in getTabResults(tab.id).results" :key="item.id || idx"
                                :item="item" @click="$handleCardClick(f7router, item)"
                                class="result-card margin-bottom" />

                            <div v-if="getTabResults(tab.id).hasMore"
                                class="end-message text-color-gray text-align-center padding">
                                已加载全部搜索结果
                            </div>
                        </div>

                        <!-- 无结果且加载完成：显示空状态 -->
                        <div v-else-if="!isLoadingResults"
                            class="empty-state display-flex flex-direction-column align-items-center justify-content-center padding-vertical">
                            <f7-icon ios="f7:multiply_circle" md="material:search_off" size="32" />
                            <span class="empty-text margin-top">未找到与"{{ query }}"相关的内容</span>
                            <span class="empty-hint text-color-gray margin-top-half">尝试其他关键词，或检查拼写</span>
                        </div>
                    </f7-page-content>
                </template>
            </TabLayout>
        </div>

        <!-- 默认视图：历史和热搜 -->
        <div v-else-if="!isSearching && !showSuggestions" class="default-container padding">
            <!-- 搜索历史 -->
            <div v-if="searchHistory.length > 0" class="section margin-bottom">
                <div class="section-header display-flex justify-content-space-between align-items-center margin-bottom">
                    <span class="section-title font-weight-bold">搜索历史</span>
                    <f7-link icon-only @click="handleClearHistory" color="gray">
                        <f7-icon ios="f7:trash" md="material:delete" size="18" />
                    </f7-link>
                </div>
                <div class="history-chips display-flex flex-wrap" style="gap: 8px;">
                    <f7-chip v-for="(text, i) in searchHistory" :key="i" :text="text" @click="(e) => { if (!e.target.closest('.chip-delete')) handleSearch(text); }"
                        class="history-chip" outline deleteable @delete="deleteHistoryItem(i)" />
                </div>
            </div>

            <!-- 热搜列表 -->
            <div class="section">
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
.search-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.search-header {
    display: flex;
    align-items: center;
    padding: 8px;
    gap: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.search-input {
    flex: 1;
}

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
    color: #999;
}

.retry-button {
    margin-top: 16px;
}

.end-message {
    text-align: center;
    font-size: 14px;
    color: #999;
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
    color: #333;
    margin-bottom: 16px;
    display: block;
}

.history-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.trending-item {
    display: flex;
    align-items: center;
    padding: 12px 8px;
    border-radius: 12px;
    cursor: pointer;
    margin-bottom: 4px;
}

.trending-item:hover {
    background-color: #f5f5f5;
}

.trending-rank {
    width: 24px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    color: #666;
}

.top-rank {
    color: #ff4d4f;
}

.trending-title {
    flex: 1;
    margin-left: 12px;
    font-weight: 500;
    color: #333;
}

.trending-hot {
    font-size: 12px;
    color: #999;
}

/* 搜索结果统计样式 */
.results-count {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>