<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { f7 } from 'framework7-vue';
import TabLayout from '@/components/TabLayout.vue';
import FeedCard from '@/components/FeedCard.vue';
import $http from '@/services/http.js';
import { HistoryService } from '@/services/history.js';
import { usePageState } from '@/composables/usePageState.js';
import { useResource } from '@/composables/useResource.js';
import { useTabbedPagedList } from '@/composables/useTabbedPagedList.js';
import { useFollowToggle } from '@/composables/useFollowToggle.js';
import { useContentMenu } from '@/composables/useContentMenu.js';
import { unwrap, normalizeType, authorOf, excerptOf, voteupOf, commentCountOf } from '@/mappers/zhihu-item.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const topicId = computed(() => props.f7route?.params?.id);

const TOPIC_INCLUDE = "meta%2Cmeta.casts%2Cmeta.medias%2Cmeta.playlist%2Cmeta.awards%2Cmeta.pubinfo%2Cmeta.parameters%2Cvote%2Crank_list_info%2Cmeta.review_question%2Crelated_topics%2Crelated_topics.vote%2Cmeta.game_medias%2Cmeta.game_parameters%2Cmeta.team_parameters%2Cmeta.sports_parameters%2Cclub%2Ctimeline%2Cuniversity%2Cheader_video%2Cactivity%2Cpin_template";

// 话题资料：单资源生命周期交给 useResource
const { data: topicInfo, loading, reload: fetchTopicInfo } = useResource(
    (signal) => $http.get(`https://api.zhihu.com/v5.1/topics/${topicId.value}?include=${TOPIC_INCLUDE}`, { signal }),
    {
        transform: (res) => {
            const data = res.data || res;
            const info = {
                id: data.id,
                name: data.name,
                avatar: data.avatar_url,
                excerpt: data.excerpt || '',
                introduction: data.introduction || '',
                followerCount: data.followers_count || 0,
                questionCount: data.questions_count || 0,
                headerImage: data.header_video?.thumbnail || '',
                isFollowing: data.is_following || false
            };

            HistoryService.addRecord({
                id: info.id,
                type: 'topic',
                title: info.name,
                preview: info.excerpt
            });

            return info;
        },
    }
);
const activeTab = ref('detail');

const { loading: isFollowLoading, toggle: toggleFollow } = useFollowToggle({
    url: () => `https://api.zhihu.com/topics/${topicId.value}/followers`,
    isFollowing: () => topicInfo.value?.isFollowing || false,
    setFollowing: (v) => { if (topicInfo.value) topicInfo.value.isFollowing = v; },
    deleteWithUserId: true,
    encryptHead: true,
    postBody: '',
    followerCount: () => topicInfo.value?.followerCount || 0,
    setFollowerCount: (n) => { if (topicInfo.value) topicInfo.value.followerCount = n; },
});

const tabs = [
    { id: 'detail', label: '详情' },
    { id: 'essence', label: '讨论' },
    { id: 'pins', label: '想法' },
    { id: 'videos', label: '视频' },
    { id: 'questions', label: '问题' }
];

const CONTENT_TABS = ['essence', 'pins', 'videos', 'questions'];
const sortByTab = reactive({ essence: 'essence', pins: 'new', videos: 'new', questions: 'new' });

const { tabs: tabData, loading: tabLoading, ensure, refresh, loadMore, ensureLoaded, reset } = useTabbedPagedList({
    name: '话题内容',
    tabs: () => CONTENT_TABS,
    fillEl: (tabId) => scrollElements[tabId],
    fetch: (tabId, signal) => $http.get(getDynamicUrl(tabId, sortByTab[tabId]), { signal }),
    map: (item) => formatContentItem(item),
});

ensure();

const scrollElements = {};
const setScrollRef = (elRef, id) => {
    if (elRef) scrollElements[id] = elRef.$el;
};

const { hasCache } = usePageState({
    state: {
        topicInfo,
        activeTab,
        sortByTab,
        tabData
    },
    loading: [loading, isFollowLoading],
    scroll: (main) => ({ main, ...scrollElements })
});

const urlTypes = {
    essence: {
        essence: 'essence',
        new: 'timeline_activity',
        hot: 'top_activity'
    },
    pins: {
        new: 'pin-new',
        hot: 'pin-hot'
    },
    videos: {
        new: 'new_zvideo',
        hot: 'top_zvideo'
    },
    questions: {
        new: 'new_question',
        hot: 'top_question'
    }
};

const getDynamicUrl = (tabId, sortType) => {
    const id = topicId.value;
    const base = `https://api.zhihu.com/v5.1/topics/${id}/feeds`;
    let typePath = urlTypes[tabId]?.[sortType] || urlTypes[tabId]?.new || 'essence';
    return `${base}/${typePath}/v2`;
};

const formatContentItem = (item) => {
    const targetItem = unwrap(item);
    const authorName = authorOf(targetItem).name === '匿名用户' ? '' : authorOf(targetItem).name;
    const rawExcerpt = excerptOf(targetItem);
    const type = normalizeType(targetItem.type);
    const id = targetItem.id;

    const likes = voteupOf(targetItem) || targetItem.like_count || 0;
    const comments = commentCountOf(targetItem);

    let excerpt = authorName ? `${authorName} : ${rawExcerpt}` : rawExcerpt;
    let title = targetItem.title || '';
    let footer = '';
    let metrics = { likes, comments };

    switch (type) {
        case 'answer':
            title = targetItem.question?.title || title;
            break;

        case 'question':
            title = targetItem.title;
            footer = `${targetItem.answer_count || 0}个回答 · ${targetItem.follower_count || 0}人关注`;
            excerpt = '';
            metrics = null;
            break;

        case 'zvideo':
            if (!rawExcerpt) {
                excerpt = authorName ? `${authorName} : [视频]` : '[视频]';
            }
            break;

        case 'pin':
            title = title || '一个想法';
            // pin 的 content 是分段数组，直接当文本用会渲染成 [object Object]
            if (targetItem.content?.length > 0) {
                excerpt = targetItem.content[0].content || excerpt;
            }
            break;
    }

    return {
        id,
        type,
        title,
        excerpt,
        footer,
        noAuthorPrefix: true,
        metrics,
    };
};

const handleBack = () => {
    if (props.f7router) props.f7router.back();
};

const onRefresh = async (tabId, done) => {
    await refresh(tabId || activeTab.value);
    if (done) done();
};

const onLoadMore = (tabId) => {
    loadMore(tabId || activeTab.value);
};

onMounted(() => {
    if (!hasCache.value) {
        fetchTopicInfo();
    }
});

watch(activeTab, (newTab) => {
    if (newTab !== 'detail') ensureLoaded(newTab);
});

// Popover Sort logic
const currentSortOptions = computed(() => {
    const tab = activeTab.value;
    if (tab === 'detail') return [];

    const options = [
        { key: 'essence', iconIos: 'f7:chart_bar_fill', iconMd: 'material:insert_chart', text: '按精华排序', show: tab === 'essence' },
        { key: 'new', iconIos: 'f7:text_alignleft', iconMd: 'material:format_align_left', text: '按时间顺序', show: true },
        { key: 'hot', iconIos: 'f7:text_justify', iconMd: 'material:notes', text: '按热度顺序', show: true },
    ];

    return options.filter(o => o.show);
});

const handleSortChange = (key) => {
    const tabId = activeTab.value;
    if (!(tabId in sortByTab)) return;
    sortByTab[tabId] = key;
    reset(tabId);
    refresh(tabId);
};

const { copyLink: copyTopicLink, share: shareTopic, report: reportTopic } = useContentMenu({
    url: () => `https://www.zhihu.com/topic/${topicId.value}`,
    title: () => topicInfo.value?.name,
    reportType: 'topic',
    reportId: topicId.value,
});

const refreshTopic = async () => {
    await fetchTopicInfo();
    if (activeTab.value !== 'detail') await refresh(activeTab.value);
};
</script>

<template>
    <f7-page class="topic-detail">
        <f7-navbar class="profile-navbar">
            <f7-nav-left>
                <f7-link icon-only @click="handleBack">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="topicInfo" class="navbar-title">{{ topicInfo.name }}</f7-nav-title>
            <f7-nav-right>
                <f7-link icon-only popover-open=".sort-popover">
                    <f7-icon ios="f7:ellipsis_vertical" md="material:more_vert" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <div class="profile-main-content">
            <div class="profile-header-section">
                <div class="profile-header" v-if="topicInfo">
                    <div class="cover-image"
                        :style="{ backgroundImage: topicInfo.headerImage ? `url(${topicInfo.headerImage})` : '' }">
                    </div>
                    <div class="info-container">
                        <div class="avatar-row">
                            <img :src="topicInfo.avatar" class="avatar" />
                            <f7-button class="follow-btn" :fill="!(topicInfo.isFollowing)" outline
                                :color="topicInfo.isFollowing ? 'gray' : undefined" small :loading="isFollowLoading"
                                @click="toggleFollow">
                                {{ topicInfo.isFollowing ? '已关注' : '关注话题' }}
                            </f7-button>
                        </div>
                        <div class="name-row">
                            <h1 class="name">{{ topicInfo.name }}</h1>
                        </div>
                        <div class="headline" v-if="topicInfo.excerpt">{{ topicInfo.excerpt }}</div>

                        <div class="stats-row">
                            <div class="stat-item">
                                <span class="stat-val">{{ topicInfo.followerCount }}</span>
                                <span class="stat-label">关注者</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-val">{{ topicInfo.questionCount }}</span>
                                <span class="stat-label">问题</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tabs-section">
                <TabLayout v-if="topicInfo" :tabs="tabs" :onChange="(id) => activeTab = id"
                    :auto-page-content="false" :fixed="false" :initialActiveId="activeTab">
                    <template v-for="tab in tabs" :key="tab.id" #[tab.id]>
                        <div v-if="tab.id === 'detail'" class="tab-static-container">
                            <div class="padding">
                                <f7-card v-if="topicInfo">
                                    <f7-card-content>
                                        <h3 class="no-margin-top">{{ topicInfo.name }}</h3>
                                        <div class="detail-text">{{ topicInfo.introduction || topicInfo.excerpt ||
                                            '暂无详细介绍' }}</div>
                                    </f7-card-content>
                                </f7-card>
                            </div>
                        </div>

                        <f7-page-content v-else ptr @ptr:refresh="(done) => onRefresh(tab.id, done)" infinite
                            :infinite-preloader="tabData[tab.id].hasMore" @infinite="onLoadMore(tab.id)"
                            class="tab-scroll-content" :ref="(el) => setScrollRef(el, tab.id)">
                            <div class="content-list">
                                <EmptyState v-if="!tabLoading[tab.id] && tabData[tab.id].list.length === 0"
                                    text="暂无内容" />
                                <div v-else>
                                    <FeedCard v-for="(item, idx) in tabData[tab.id].list" :key="item.id + '-' + idx"
                                        :item="item" @click="$handleCardClick(f7router, item)" />
                                </div>

                                <LoadMoreFooter :has-more="tabData[tab.id].hasMore" :length="tabData[tab.id].list.length"
                                    text="已加载全部内容" />
                            </div>
                        </f7-page-content>
                    </template>
                </TabLayout>
            </div>
        </div>

        <!-- Sort Popover -->
        <f7-popover class="sort-popover">
            <f7-list>
                <f7-list-item v-for="opt in currentSortOptions" :key="opt.key" :title="opt.text" link popover-close
                    @click="handleSortChange(opt.key)">
                    <template #media>
                        <f7-icon :ios="opt.iconIos" :md="opt.iconMd" />
                    </template>
                </f7-list-item>
                <f7-list-item title="刷新" link popover-close @click="refreshTopic" />
                <f7-list-item title="分享" link popover-close @click="shareTopic" />
                <f7-list-item title="复制链接" link popover-close @click="copyTopicLink" />
                <f7-list-item title="举报" link popover-close @click="reportTopic" />
            </f7-list>
        </f7-popover>
    </f7-page>

</template>

<style scoped>
.topic-detail {
    height: 100%;
}

.profile-main-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.profile-header-section {
    flex-shrink: 0;
}

.tabs-section {
    height: calc(100dvh - var(--f7-navbar-height) - var(--f7-safe-area-top) - var(--f7-toolbar-height));
    flex: 1;
    display: flex;
    flex-direction: column;
}

.tab-scroll-content {
    height: 100%;
}

.tab-static-container {
    height: 100%;
    overflow: auto;
}

.profile-navbar {
    z-index: 100;
}

.cover-image {
    height: 120px;
    background-color: var(--app-placeholder-bg);
    background-size: cover;
    background-position: center;
}

.info-container {
    padding: 0 16px 16px;
    margin-top: -32px;
}

.avatar-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    border: 4px solid var(--f7-page-bg-color);
    object-fit: cover;
    background: var(--app-placeholder-bg);
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
    color: var(--f7-text-color);
    line-height: 1.5;
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
}

.stat-label {
    font-size: 0.8rem;
    color: var(--app-sub-text);
}

.content-list {
    padding: 0;
}

.detail-text {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--f7-text-color);
}
</style>
