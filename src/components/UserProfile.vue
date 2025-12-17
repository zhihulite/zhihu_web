```vue
<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FeedCard from './FeedCard.vue';
import MaterialSymbol from './MaterialSymbol.vue';
import MobileTabLayout from './MobileTabLayout.vue';
import PullToRefresh from './PullToRefresh.vue';
import { homeCardRender } from '../services/homeCardRender.js';
import $http from '../api/http.js';

const route = useRoute();
const router = useRouter();

const userId = route.params.id;
const userInfo = ref(null);
const loading = ref(false);
const activeTab = ref('activities');

const tabData = reactive({});

const tabs = ref([]);

const fetchTabs = async () => {
    const urlsMap = {
        activities: `https://api.zhihu.com/moments/${userId}/activities?limit=20`,
        zvideo: `https://api.zhihu.com/people/${userId}/zvideos?offset=0&limit=20`,
        answer: `https://api.zhihu.com/people/${userId}/answers?order_by=created&offset=0&limit=20`,
        vote: `https://api.zhihu.com/moments/${userId}/vote?limit=20`,
        article: `https://api.zhihu.com/people/${userId}/articles?offset=0&limit=20`,
        column: `https://api.zhihu.com/people/${userId}/column-contributions?offset=0&limit=20`,
        pin: `https://api.zhihu.com/v2/pins/${userId}/moments`,
        question: `https://api.zhihu.com/people/${userId}/questions?offset=0&limit=20`
    };

    try {
        const res = await $zhihu.get(`https://api.zhihu.com/people/${userId}/profile/tab`);
        const data = res.data || res;
        const rawTabs = data.tabs_v3 || [];
        const processedTabs = [];

        const addTab = (tab) => {
            if (tab.name === '全部' || tab.key === 'all') return;
            let title = tab.name;
            if (tab.number > 0) title += ` ${tab.number}`;
            processedTabs.push({ key: tab.key, title, url: tab.url });
        };

        rawTabs.forEach(tab => {
            if (tab.sub_tab) tab.sub_tab.forEach(addTab);
            else addTab(tab);
        });

        const finalTabs = [];
        let answerIndex = -1;

        const getKeyFromUrl = (url) => {
            const map = {
                '/activities': 'activities',
                '/answers': 'answer',
                '/articles': 'article',
                '/zvideos': 'zvideo',
                '/questions': 'question',
                '/vote': 'vote',
                '/pins': 'pin',
                '/column': 'column'
            };
            for (const [path, key] of Object.entries(map)) {
                if (url && url.includes(path)) return key;
            }
            return 'unknown';
        };

        processedTabs.forEach((tab) => {
            const id = getKeyFromUrl(tab.url);
            let mapKey = tab.key;
            if (mapKey === 'share') return;
            const url = urlsMap[mapKey] || tab.url;

            if (url) {
                const tabId = mapKey || id;
                finalTabs.push({ id: tabId, label: tab.title, url, key: mapKey });

                if (!tabData[tabId]) {
                    tabData[tabId] = { list: [], page: 1, hasMore: true, loading: false, url };
                }
            }
        });

        const actIndex = finalTabs.findIndex(t => t.id === 'activities');
        if (actIndex > 0) {
            const actTab = finalTabs.splice(actIndex, 1)[0];
            finalTabs.unshift(actTab);
        } else if (actIndex === -1) {
            const actUrl = urlsMap.activities;
            finalTabs.unshift({ id: 'activities', label: '动态', url: actUrl });
            if (!tabData['activities']) {
                tabData['activities'] = { list: [], page: 1, hasMore: true, loading: false, url: actUrl };
            }
        }

        tabs.value = finalTabs;
        if (finalTabs.length > 0) {
            activeTab.value = finalTabs[0].id;
        }

    } catch (e) {
        console.error('Fetch tabs failed', e);
        const fallback = [
            { id: 'activities', label: '动态', url: urlsMap.activities },
        ];
        fallback.forEach(t => {
            if (!tabData[t.id]) tabData[t.id] = { list: [], page: 1, hasMore: true, loading: false, url: t.url };
        });
        tabs.value = fallback;
        activeTab.value = 'activities';
    }
};

const fetchUserInfo = async () => {
    loading.value = true;
    try {
        const res = await $zhihu.get(`https://api.zhihu.com/people/${userId}`);
        const data = res.data || res;
        userInfo.value = data;
    } catch (e) {
        console.error('Failed to fetch user info', e);
    } finally {
        loading.value = false;
    }
};

const fetchContent = async (tabId, isRefresh = false) => {
    const dataState = tabData[tabId];
    if (!dataState || dataState.loading) return;

    const isFirstLoad = !dataState.lastResult;

    if (!isRefresh && !dataState.hasMore && !isFirstLoad) return;


    dataState.loading = true;

    try {
        let result;

        if (isRefresh || isFirstLoad) {
            let url = dataState.url;

            result = await $http.get(url);
        } else {
            if (dataState.lastResult) {
                result = await dataState.lastResult.next();
            }
        }

        if (!result) {
            dataState.hasMore = false;
        } else {
            dataState.lastResult = result;

            const rawList = result.data || [];

            dataState.hasMore = !!result.paging?.next;

            const mappedList = rawList.map(item => {
                let target = item.target || item;
                if (target.column) target = target.column;

                let type = target.type || item.type || 'article';
                if (type === 'moments_pin') type = 'pin';

                const title = homeCardRender.formatTitle(item) || target.title || target.name || target.content?.[0]?.title || '无标题';

                return {
                    ...item,
                    title: title,
                    excerpt: target.excerpt || target.excerpt_new || target.intro || target.description || '',
                    metrics: {
                        likes: target.voteup_count || target.like_count || 0,
                        comments: target.comment_count || target.items_count || 0
                    },
                    author: target.author || userInfo.value,
                    type: type,
                    id: target.id
                };
            });

            if (isRefresh || isFirstLoad) {
                dataState.list = mappedList;
            } else {
                const newItems = mappedList.filter(n => !dataState.list.some(o => o.id === n.id));
                dataState.list = [...dataState.list, ...newItems];
            }
        }

    } catch (e) {
        console.error(`Failed to fetch content for ${tabId}`, e);
        dataState.hasMore = false;
    } finally {
        dataState.loading = false;
    }
};

onMounted(() => {
    fetchUserInfo();
    fetchTabs().then(() => {
        if (activeTab.value) fetchContent(activeTab.value);
    });
});

watch(activeTab, (newId) => {
    if (newId) fetchContent(newId);
});

const onRefresh = async () => {
    if (activeTab.value) {
        await fetchContent(activeTab.value, true);
    }
};

const onLoadMore = () => {
    if (activeTab.value) {
        const dataState = tabData[activeTab.value];
        if (dataState && dataState.hasMore) {
            fetchContent(activeTab.value, false);
        }
    }
};


const handleBack = () => {
    router.back();
};

const handleItemClick = (item) => {
    const id = item.target?.id || item.id;
    const type = item.target?.type || item.type || 'article';

    if (type === 'question') {
        router.push(`/question/${id}`);
    } else {
        router.push(`/article/${type}/${id}`);
    }
};

</script>

<template>
    <div class="user-profile">
        <div class="top-bar glass">
            <s-icon-button @click="handleBack">
                <MaterialSymbol icon="arrow_back" />
            </s-icon-button>
            <div class="top-title" v-if="userInfo">{{ userInfo.name }}</div>
            <s-icon-button>
                <MaterialSymbol icon="more_vert" />
            </s-icon-button>
        </div>

        <s-scroll-view class="main-scroll">
            <PullToRefresh :onRefresh="onRefresh" :onLoadMore="onLoadMore" :hasMore="tabData[activeTab]?.hasMore">
                <div class="profile-header" v-if="userInfo">
                    <div class="cover-image"></div>
                    <div class="info-container">
                        <div class="avatar-row">
                            <img :src="userInfo.avatar_url" class="avatar" />
                            <s-button class="follow-btn" type="filled">关注</s-button>
                        </div>
                        <div class="name-row">
                            <h1 class="name">{{ userInfo.name }}</h1>
                            <div class="gender-badge" v-if="userInfo.gender !== -1">
                                <MaterialSymbol :icon="userInfo.gender === 1 ? 'male' : 'female'" :size="16" />
                            </div>
                        </div>
                        <div class="headline" v-if="userInfo.headline">{{ userInfo.headline }}</div>

                        <div class="stats-row">
                            <div class="stat-item">
                                <span class="stat-val">{{ userInfo.following_count || 0 }}</span>
                                <span class="stat-label">关注</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-val">{{ userInfo.follower_count || 0 }}</span>
                                <span class="stat-label">粉丝</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-val">{{ userInfo.voteup_count || 0 }}</span>
                                <span class="stat-label">获赞</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tabs-container">
                    <MobileTabLayout expanded v-if="tabs.length > 0" :tabs="tabs" :activeId="activeTab"
                        :onChange="(id) => activeTab = id">
                        <template v-for="tab in tabs" :key="tab.id" #[tab.id]>
                            <div class="content-list">
                                <div v-if="tabData[tab.id]?.loading && (!tabData[tab.id]?.list || tabData[tab.id].list.length === 0)"
                                    class="loading-state">
                                    <s-circular-progress indeterminate="true"></s-circular-progress>
                                </div>
                                <template v-else>
                                    <div v-if="tabData[tab.id]?.list.length === 0" class="empty-state">
                                        暂无内容
                                    </div>
                                    <FeedCard v-for="(item, index) in tabData[tab.id]?.list" :key="index" :item="item"
                                        @click="handleItemClick(item)" />
                                </template>
                            </div>
                        </template>
                    </MobileTabLayout>
                </div>
            </PullToRefresh>
        </s-scroll-view>
    </div>
</template>

<style scoped>
.user-profile {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.top-bar {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    z-index: 50;
    position: sticky;
    top: 0;
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.top-title {
    font-weight: bold;
    font-size: 1.1rem;
}

.main-scroll {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.profile-header {
    position: relative;
    padding-bottom: 16px;
    flex-shrink: 0;
}

.tabs-container {
    flex: 1;
    position: relative;
    min-height: 500px;
}

.cover-image {
    height: 120px;
}

.info-container {
    padding: 0 16px;
    margin-top: -32px;
    position: relative;
}

.avatar-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #fff;
    object-fit: cover;
}

.follow-btn {
    margin-bottom: 8px;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
}

.name {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
}


.headline {
    margin-top: 8px;
    font-size: 0.95rem;
    line-height: 1.4;
}

.stats-row {
    display: flex;
    gap: 24px;
    margin-top: 16px;
}

.stat-item {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.stat-val {
    font-weight: bold;
    font-size: 1.1rem;
}

.stat-label {
    font-size: 0.8rem;
}

.content-list {
    padding: 16px;
    min-height: 400px;
}

.loading-state {
    display: flex;
    justify-content: center;
    padding: 32px;
}

.load-more {
    display: flex;
    justify-content: center;
    padding: 16px;
}

.end-text {
    font-size: 0.8rem;
}

.empty-state {
    padding: 32px;
    text-align: center;
}
</style>
