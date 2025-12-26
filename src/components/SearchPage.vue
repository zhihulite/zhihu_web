<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue';

import TabLayout from './TabLayout.vue';
import FeedCard from './FeedCard.vue';
import $http from '../api/http.js';


const props = defineProps({
    f7router: Object
});

const query = ref('');
const activeTab = ref('general');
const isSearching = ref(false);
const inputRef = ref(null);


const searchHistory = ref([]);
const hotSearches = ref([]);
const isLoadingHotSearches = ref(false);

// 按标签页独立管理搜索结果
const tabSearchResults = ref({
    general: { results: [], isEnd: false, offset: 0 },
    realtime: { results: [], isEnd: false, offset: 0 },
    people: { results: [], isEnd: false, offset: 0 },
    column: { results: [], isEnd: false, offset: 0 },
    publication: { results: [], isEnd: false, offset: 0 },
    zvideo: { results: [], isEnd: false, offset: 0 },
    pin: { results: [], isEnd: false, offset: 0 },
    topic: { results: [], isEnd: false, offset: 0 }
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
    return tab && !tab.isEnd;
});

// 获取指定标签页的搜索结果
const getTabResults = (tabId) => {
    return tabSearchResults.value[tabId] || { results: [], isEnd: false };
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
        tabSearchResults.value[tabId] = { results: [], isEnd: false, offset: 0 };
    }

    // 新搜索时重置状态
    if (newSearch) {
        tabSearchResults.value[tabId] = {
            results: [],
            isEnd: false,
            offset: 0
        };
    }

    const currentTab = tabSearchResults.value[tabId];

    // 没有更多结果或正在加载时不再请求
    if (!currentTabHasMore.value || isLoadingResults.value) {
        return;
    }

    isLoadingResults.value = true;

    try {
        // 构建搜索URL
        let searchType = tabId;
        let isRealTime = '0';

        // 实时搜索特殊处理：搜索类型设置为general，同时实时搜索状态设置为1
        if (tabId === 'realtime') {
            searchType = 'general';
            isRealTime = '1';
        }

        const offset = currentTab.offset || 0;
        const searchUrl = `https://api.zhihu.com/search_v3?gk_version=gz-gaokao&q=${encodeURIComponent(query.value)}&t=${searchType}&search_source=History&is_real_time=${isRealTime}&correction=1&advert_count=&show_all_topics=0&pin_flow=false&restricted_scene=&restricted_field=&restricted_value=&offset=${offset}&limit=20&lc_idx=0`;
        const response = await $http.get(searchUrl);

        const apiData = response.data;
        const formattedResults = [];

        if (apiData && Array.isArray(apiData)) {
            apiData.forEach(item => {
                if (item.type === 'search_result' && item.object) {
                    formattedResults.push({
                        id: item.object.id,
                        type: item.object.type,
                        title: item.highlight?.title || item.object.title || '',
                        content: item.highlight?.description || item.object.excerpt || '',
                        excerpt: item.object.excerpt || '',
                        author: item.author ? {
                            id: item.author.id,
                            name: item.author.name,
                            headline: item.author.headline,
                            avatar_url: item.author.avatar_url
                        } : null,
                        metrics: {
                            voteup_count: item.object.voteup_count || 0,
                            comment_count: item.object.comment_count || 0,
                            zfav_count: item.object.zfav_count || 0
                        },
                        url: item.object.url || ''
                    });
                }
            });
        }

        // 更新当前标签页的搜索结果
        if (newSearch) {
            currentTab.results = formattedResults;
        } else {
            currentTab.results = [...currentTab.results, ...formattedResults];
        }

        // 更新是否还有更多结果
        currentTab.isEnd = !response.paging.next;
        if (!currentTab.isEnd) {
            currentTab.offset = (currentTab.offset || 0) + 20;
        }
    } catch (error) {
        console.error('搜索失败:', error);
    } finally {
        isLoadingResults.value = false;
    }
};


// 处理搜索
const handleSearch = (text = query.value) => {
    if (!text.trim()) return;
    query.value = text;
    isSearching.value = true;
    saveSearchHistory(text);
    executeSearch(true);
};

// 处理标签页重试
const handleTabRetry = (tabId) => {
    executeSearch(true, tabId);
};

// 处理清除历史
const handleClearHistory = () => {
    searchHistory.value = [];
    localStorage.removeItem('searchHistory');
};

// 处理返回
const handleBack = () => {
    if (props.f7router) props.f7router.back();
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
    query.value = '';
    isSearching.value = false;
    inputRef.value?.focus();
};

// 处理结果项点击
const handleItemClick = (item) => {
    if (!props.f7router) return;

    if (item.id && item.type) {
        switch (item.type) {
            case 'article':
                props.f7router.navigate(`/article/${item.id}`);
                break;
            case 'question':
                props.f7router.navigate(`/question/${item.id}`);
                break;
            case 'user':
                props.f7router.navigate(`/user/${item.id}`);
                break;
            case 'topic':
                props.f7router.navigate(`/topic/${item.id}`);
                break;
            default:
                // 对于未知类型，尝试作为文章处理
                props.f7router.navigate(`/article/${item.id}`);
        }
    }
};

// 处理下拉刷新
const handleRefresh = async () => {
    if (isSearching.value) {
        await executeSearch(true);
    } else {
        await fetchHotSearches();
    }
};

// 处理加载更多
const handleLoadMore = async () => {
    if (isSearching.value && currentTabHasMore.value) {
        await executeSearch(false);
    }
};

const handlePageRefresh = async (done) => {
    if (!isSearching.value) {
        await fetchHotSearches();
    }
    done();
};

const handleTabRefresh = async (tabId, done) => {
    await executeSearch(true, tabId);
    done();
};

const handleTabLoadMore = async (tabId) => {
    const tabData = tabSearchResults.value[tabId];
    if (tabData && !tabData.isEnd) {
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
            <f7-nav-title style="width: 100%; margin-right: 16px;">
                <f7-searchbar custom-search :value="query" @input="query = $event.target.value"
                    @searchbar:search="handleSearch($event.target.value)" @searchbar:clear="handleInputClear"
                    placeholder="搜索..." :disable-button="false" clear-button></f7-searchbar>
            </f7-nav-title>
            <f7-nav-right>
                <f7-link @click="() => handleSearch()">搜索</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <!-- 搜索结果视图 -->
        <div v-show="isSearching" class="results-container">
            <TabLayout :tabs="SEARCH_TABS" :activeId="activeTab" :onChange="handleTabChange" :nested="true"
                :auto-page-content="false">
                <!-- 每个标签页的内容 -->
                <template v-for="tab in SEARCH_TABS" :key="tab.id" v-slot:[tab.id]>
                    <f7-page-content ptr @ptr:refresh="(done) => handleTabRefresh(tab.id, done)" infinite
                        @infinite="handleTabLoadMore(tab.id)">
                        <!-- 有结果：显示列表 -->
                        <div v-if="getTabResults(tab.id).results.length > 0" class="results-list">
                            <FeedCard v-for="(item, idx) in getTabResults(tab.id).results" :key="item.id || idx"
                                :item="item" @click="handleItemClick(item)" class="result-card margin-bottom" />

                            <div v-if="getTabResults(tab.id).isEnd"
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
        <div v-show="!isSearching" class="default-container padding">
            <!-- 搜索历史 -->
            <div v-if="searchHistory.length > 0" class="section margin-bottom">
                <div class="section-header display-flex justify-content-space-between align-items-center margin-bottom">
                    <span class="section-title font-weight-bold">搜索历史</span>
                    <f7-link icon-only @click="handleClearHistory" color="gray">
                        <f7-icon ios="f7:trash" md="material:delete" size="18" />
                    </f7-link>
                </div>
                <div class="history-chips display-flex flex-wrap" style="gap: 8px;">
                    <f7-chip v-for="(text, i) in searchHistory" :key="i" :text="text" @click="handleSearch(text)"
                        class="history-chip" outline />
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