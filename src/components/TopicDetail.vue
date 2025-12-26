<script setup>
import { ref, computed, onMounted } from 'vue';
import TabLayout from './TabLayout.vue';
import FeedCard from './FeedCard.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const topicId = computed(() => props.f7route?.params?.id);
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
        const res = await $http.get(`https://api.zhihu.com/topics/${topicId.value}`);
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
    if (props.f7router) props.f7router.back();
};

const handleArticleClick = (item) => {
    if (!props.f7router) return;
    if (item.type === 'question') {
        props.f7router.navigate(`/question/${item.id}`);
    } else {
        props.f7router.navigate(`/article/${item.type}/${item.id}`);
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
    <f7-page class="topic-detail" ptr @ptr:refresh="onRefresh" infinite-scroll @infinite="onLoadMore">
        <f7-navbar>
            <f7-nav-left>
                <f7-link icon-only @click="handleBack">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="topicInfo">{{ topicInfo.name }}</f7-nav-title>
        </f7-navbar>

        <div v-if="loading && !topicInfo" class="loading-state display-flex justify-content-center align-items-center"
            style="height: 100%;">
            <f7-preloader />
        </div>

        <div v-else class="page-content-wrapper">
            <div class="topic-header padding" v-if="topicInfo">
                <div class="display-flex align-items-start">
                    <img :src="topicInfo.avatar" class="topic-avatar width-80 height-80"
                        style="border-radius: 8px; object-fit: cover;"
                        :onerror="`this.src='https://placehold.co/80x80/6366f1/ffffff?text=T'`" />
                    <div class="margin-left flex-1">
                        <h1 class="font-size-24 font-weight-bold no-margin">{{ topicInfo.name }}</h1>
                        <div class="stats display-flex gap-2 margin-top-half text-color-gray">
                            <div class="stat-item margin-right">
                                <b class="text-color-black">{{ topicInfo.followerCount }}</b> 关注者
                            </div>
                            <div class="stat-item">
                                <b class="text-color-black">{{ topicInfo.questionCount }}</b> 问题
                            </div>
                        </div>
                    </div>
                </div>
                <p class="topic-excerpt text-color-gray margin-top">{{ topicInfo.excerpt }}</p>
                <f7-button fill class="follow-btn margin-top">关注话题</f7-button>
            </div>

            <f7-toolbar tabbar>
                <f7-link v-for="tab in tabs" :key="tab.id" :tab-link="`#tab-${tab.id}`"
                    :tab-link-active="activeTab === tab.id" @click="activeTab = tab.id">
                    {{ tab.label }}
                </f7-link>
            </f7-toolbar>

            <f7-tabs animated>
                <f7-tab v-for="tab in tabs" :key="tab.id" :id="`tab-${tab.id}`" class="page-content"
                    :tab-active="activeTab === tab.id">
                    <div v-if="tab.id === 'detail'" class="padding">
                        <f7-card>
                            <f7-card-content>
                                <h3 class="no-margin-top">{{ topicInfo?.name }}</h3>
                                <p>{{ topicInfo?.excerpt || '暂无简介' }}</p>
                            </f7-card-content>
                        </f7-card>
                    </div>
                    <div v-else class="content-list padding-bottom">
                        <div v-if="tabData[tab.id].loading && tabData[tab.id].list.length === 0"
                            class="padding text-align-center">
                            <f7-preloader />
                        </div>
                        <div v-else-if="tabData[tab.id].list.length === 0"
                            class="padding text-align-center text-color-gray">
                            暂无内容
                        </div>
                        <div v-else>
                            <FeedCard v-for="item in tabData[tab.id].list" :key="item.id" :item="item"
                                @click="handleArticleClick(item)" class="margin-bottom" />
                        </div>
                    </div>
                </f7-tab>
            </f7-tabs>
        </div>
    </f7-page>
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
