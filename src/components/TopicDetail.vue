<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MaterialSymbol from './MaterialSymbol.vue';
import MobileTabLayout from './MobileTabLayout.vue';
import PullToRefresh from './PullToRefresh.vue';
import FeedCard from './FeedCard.vue';

const route = useRoute();
const router = useRouter();

const topicId = computed(() => route.params.id);
const topicInfo = ref(null);
const loading = ref(false);
const activeTab = ref('detail');

const tabData = ref({
    detail: { list: [], result: null, hasMore: true, loading: false },
    discussion: { list: [], result: null, hasMore: true, loading: false },
    ideas: { list: [], result: null, hasMore: true, loading: false },
    videos: { list: [], result: null, hasMore: true, loading: false },
    questions: { list: [], result: null, hasMore: true, loading: false }
});

const tabs = [
    { id: 'detail', label: '详情' },
    { id: 'discussion', label: '讨论' },
    { id: 'ideas', label: '想法' },
    { id: 'videos', label: '视频' },
    { id: 'questions', label: '问题' }
];

const fetchTopicInfo = async () => {
    loading.value = true;
    try {
        const res = await $zhihu.get(`https://api.zhihu.com/topics/${topicId.value}`);
        const data = res.data || res;

        topicInfo.value = {
            id: data.id,
            name: data.name,
            avatar: data.avatar_url,
            excerpt: data.excerpt || data.introduction || '',
            followerCount: data.followers_count || 0,
            questionCount: data.questions_count || 0
        };
    } catch (e) {
        console.error('Failed to fetch topic info', e);
    } finally {
        loading.value = false;
    }
};

const formatContentItem = (item) => {
    const target = item.target || item;
    return {
        id: target.id,
        type: target.type || 'article',
        title: target.title || target.question?.title || '',
        excerpt: target.excerpt || target.content?.substring(0, 200) || '',
        author: target.author?.name || '匿名用户',
        avatarUrl: target.author?.avatar_url,
        imageUrl: target.thumbnail || target.image_url,
        metrics: {
            votes: target.voteup_count || 0,
            comments: target.comment_count || 0
        },
        timestamp: target.created_time ? new Date(target.created_time * 1000).toLocaleDateString() : ''
    };
};

const fetchContent = async (tabId, isRefresh = false) => {
    if (tabId === 'detail') return;

    const dataState = tabData.value[tabId];
    if (dataState.loading) return;
    if (!isRefresh && !dataState.hasMore) return;

    dataState.loading = true;

    try {
        let result;
        const urlMap = {
            discussion: `https://api.zhihu.com/topics/${topicId.value}/feeds/timeline_activity?limit=20`,
            ideas: `https://api.zhihu.com/topics/${topicId.value}/feeds/top_activity?limit=20`,
            videos: `https://api.zhihu.com/topics/${topicId.value}/feeds/top_activity?limit=20`,
            questions: `https://api.zhihu.com/topics/${topicId.value}/questions?limit=20`
        };

        if (isRefresh || !dataState.result) {
            result = await window.$http.get(urlMap[tabId]);
        } else {
            result = await dataState.result.next();
        }

        if (!result) {
            dataState.hasMore = false;
        } else {
            dataState.result = result;
            const rawList = result.data || [];
            dataState.hasMore = !!result.paging?.next;

            const mappedList = rawList.map(formatContentItem);

            if (isRefresh) {
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

const handleBack = () => {
    router.back();
};

const handleArticleClick = (item) => {
    if (item.type === 'question') {
        router.push(`/question/${item.id}`);
    } else {
        router.push(`/article/${item.type}/${item.id}`);
    }
};

const onRefresh = async () => {
    await fetchContent(activeTab.value, true);
};

const onLoadMore = async () => {
    await fetchContent(activeTab.value, false);
};

onMounted(() => {
    fetchTopicInfo();
    fetchContent('detail');
});
</script>

<template>
    <div class="topic-detail">
        <div class="top-bar glass">
            <s-icon-button @click="handleBack">
                <MaterialSymbol icon="arrow_back" />
            </s-icon-button>
            <span class="title">{{ topicInfo?.name || '话题' }}</span>
        </div>

        <s-scroll-view class="main-scroll">
            <div v-if="activeTab === 'detail'">
                <div class="topic-header" v-if="topicInfo">
                    <div class="cover-image"></div>
                    <div class="info-container">
                        <img :src="topicInfo.avatar" class="topic-avatar"
                            :onerror="`this.src='https://placehold.co/80x80/6366f1/ffffff?text=T'`" />
                        <div class="topic-info">
                            <h1 class="topic-name">{{ topicInfo.name }}</h1>
                            <p class="topic-excerpt">{{ topicInfo.excerpt }}</p>
                            <div class="stats">
                                <div class="stat-item">
                                    <span class="stat-val">{{ topicInfo.followerCount }}</span>
                                    <span class="stat-label">关注者</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-val">{{ topicInfo.questionCount }}</span>
                                    <span class="stat-label">问题</span>
                                </div>
                            </div>
                            <s-button type="filled" class="follow-btn">
                                <s-icon slot="icon">
                                    <MaterialSymbol icon="add" />
                                </s-icon>
                                关注话题
                            </s-button>
                        </div>
                    </div>
                </div>

                <div class="tabs-container">
                    <MobileTabLayout expanded :tabs="tabs" :activeId="activeTab"
                        :onChange="(id) => { activeTab = id; if (id !== 'detail' && !tabData[id].list.length) fetchContent(id); }">
                        <template #detail>
                            <div class="detail-content">
                                <s-card class="detail-card">
                                    <h3 class="detail-title">{{ topicInfo?.name }}</h3>
                                    <p class="detail-text">{{ topicInfo?.excerpt || '暂无简介' }}</p>
                                </s-card>
                            </div>
                        </template>
                    </MobileTabLayout>
                </div>
            </div>

            <PullToRefresh v-else :onRefresh="onRefresh" :onLoadMore="onLoadMore"
                :hasMore="tabData[activeTab]?.hasMore">
                <div class="topic-header" v-if="topicInfo">
                    <div class="cover-image"></div>
                    <div class="info-container">
                        <img :src="topicInfo.avatar" class="topic-avatar"
                            :onerror="`this.src='https://placehold.co/80x80/6366f1/ffffff?text=T'`" />
                        <div class="topic-info">
                            <h1 class="topic-name">{{ topicInfo.name }}</h1>
                            <p class="topic-excerpt">{{ topicInfo.excerpt }}</p>
                            <div class="stats">
                                <div class="stat-item">
                                    <span class="stat-val">{{ topicInfo.followerCount }}</span>
                                    <span class="stat-label">关注者</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-val">{{ topicInfo.questionCount }}</span>
                                    <span class="stat-label">问题</span>
                                </div>
                            </div>
                            <s-button type="filled" class="follow-btn">
                                <s-icon slot="icon">
                                    <MaterialSymbol icon="add" />
                                </s-icon>
                                关注话题
                            </s-button>
                        </div>
                    </div>
                </div>

                <div class="tabs-container">
                    <MobileTabLayout expanded :tabs="tabs" :activeId="activeTab"
                        :onChange="(id) => { activeTab = id; if (id !== 'detail' && !tabData[id].list.length) fetchContent(id); }">
                        <template v-for="tab in tabs.filter(t => t.id !== 'detail')" :key="tab.id" #[tab.id]>
                            <div class="content-list">
                                <div v-if="tabData[tab.id].loading && tabData[tab.id].list.length === 0"
                                    class="loading-state">
                                    <MaterialSymbol icon="progress_activity" :size="24" class="spin" />
                                    加载中...
                                </div>
                                <div v-else-if="tabData[tab.id].list.length === 0" class="empty-state">
                                    暂无内容
                                </div>
                                <div v-else class="card-grid">
                                    <div v-for="item in tabData[tab.id].list" :key="item.id" class="masonry-item">
                                        <FeedCard :item="item" @click="handleArticleClick(item)" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </MobileTabLayout>
                </div>
            </PullToRefresh>
        </s-scroll-view>
    </div>
</template>

<style scoped>
.topic-detail {
    height: 100vh;
    width: 100%;
    margin: auto;
    display: flex;
    flex-direction: column;
}

.top-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    height: 56px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    z-index: 10;
}

.title {
    font-weight: bold;
    font-size: 1.125rem;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.main-scroll {
    flex: 1;
    margin: auto;
    width: 100%;
    max-width: 900px;
}

.topic-header {
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
    margin-top: -40px;
    position: relative;
}

.topic-avatar {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background-color: #fff;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.topic-info {
    margin-top: 12px;
}

.topic-name {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
}

.topic-excerpt {
    margin-top: 8px;
    line-height: 1.4;
    opacity: 0.8;
}

.stats {
    display: flex;
    gap: 24px;
    margin-top: 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-val {
    font-weight: bold;
    font-size: 1.1rem;
}

.stat-label {
    font-size: 0.875rem;
    opacity: 0.7;
}

.follow-btn {
    margin-top: 16px;
    width: 100%;
}

.content-list {
    min-height: 400px;
}

.loading-state,
.empty-state {
    padding: 40px 0;
    text-align: center;
    opacity: 0.7;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.card-grid {
    columns: 2;
    column-gap: 16px;
    padding: 16px;
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 16px;
}

@media (max-width: 768px) {
    .card-grid {
        columns: 1;
    }
}

.detail-content {
    padding: 16px;
}

.detail-card {
    padding: 24px;
    max-width: none;
    min-width: 100%;
}

.detail-title {
    font-size: 1.125rem;
    font-weight: bold;
    margin: 0 0 16px 0;
}

.detail-text {
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
}
</style>
