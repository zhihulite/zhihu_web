<script setup>
import { ref, computed, onMounted, reactive, watch, nextTick } from 'vue';
import { f7 } from 'framework7-vue';
import TabLayout from './TabLayout.vue';
import FeedCard from './FeedCard.vue';
import $http from '../api/http.js';
import { HistoryService } from '../services/historyService.js';
import { useUser } from '../composables/userManager.js';
import { useHistory } from '../composables/useHistory.js';

const { currentUser } = useUser();

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});

const { register, restoreState } = useHistory(props, 'topic_detail');
const hasHistory = !!restoreState();

const topicId = computed(() => props.f7route?.params?.id);
const topicInfo = ref(null);
const loading = ref(false);
const activeTab = ref('detail');

const isFollowLoading = ref(false);

const tabs = [
    { id: 'detail', label: '详情' },
    { id: 'essence', label: '讨论' },
    { id: 'pins', label: '想法' },
    { id: 'videos', label: '视频' },
    { id: 'questions', label: '问题' }
];

const tabData = reactive({
    detail: { list: [], hasMore: false, loading: false },
    essence: { list: [], hasMore: true, loading: false, url: '', sort: 'essence' },
    pins: { list: [], hasMore: true, loading: false, url: '', sort: 'new' },
    videos: { list: [], hasMore: true, loading: false, url: '', sort: 'new' },
    questions: { list: [], hasMore: true, loading: false, url: '', sort: 'new' }
});

const scrollElements = {};
const setScrollRef = (elRef, id) => {
    if (elRef) scrollElements[id] = elRef.$el;
};

const pageRef = ref(null);

register({
    state: {
        topicInfo,
        loading,
        activeTab,
        isFollowLoading,
        tabData
    },
    scroll: () => ({
        main: pageRef.value?.$el?.querySelector('.page-content'),
        ...scrollElements
    })
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

const fetchTopicInfo = async () => {
    loading.value = true;
    try {
        const include = "meta%2Cmeta.casts%2Cmeta.medias%2Cmeta.playlist%2Cmeta.awards%2Cmeta.pubinfo%2Cmeta.parameters%2Cvote%2Crank_list_info%2Cmeta.review_question%2Crelated_topics%2Crelated_topics.vote%2Cmeta.game_medias%2Cmeta.game_parameters%2Cmeta.team_parameters%2Cmeta.sports_parameters%2Cclub%2Ctimeline%2Cuniversity%2Cheader_video%2Cactivity%2Cpin_template";
        const res = await $http.get(`https://api.zhihu.com/v5.1/topics/${topicId.value}?include=${include}`);
        const data = res.data || res;

        topicInfo.value = {
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
            id: topicInfo.value.id,
            type: 'topic',
            title: topicInfo.value.name,
            preview: topicInfo.value.excerpt
        });
    } catch (e) {
        console.error('Failed to fetch topic info', e);
    } finally {
        loading.value = false;
    }
};

const formatContentItem = (item) => {
    const targetItem = item.target || item;
    const authorName = targetItem.author?.name || '';
    const rawExcerpt = targetItem.excerpt || targetItem.excerpt_title || '';
    const originalType = targetItem.type;
    const type = originalType === 'moments_pin' ? 'pin' : originalType;
    const id = targetItem.id;

    const likes = targetItem.voteup_count || targetItem.like_count || 0;
    const comments = targetItem.comment_count || 0;

    let excerpt = authorName ? `${authorName} : ${rawExcerpt}` : rawExcerpt;
    let title = targetItem.title || '';
    let footer = '';

    switch (type) {
        case 'answer':
            title = targetItem.question?.title || title;
            break;

        case 'question':
            title = targetItem.title;
            const answerCount = (targetItem.answer_count || 0) + "个回答";
            const followerCount = (targetItem.follower_count || 0) + "人关注";
            footer = `${answerCount} · ${followerCount}`;
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
            if (targetItem.content && targetItem.content.length > 0) {
                excerpt = targetItem.content;
            }
            break;
        default:
            break;
    }

    return {
        id,
        type,
        title,
        excerpt,
        footer,
        noAuthorPrefix: true,
        metrics: {
            likes,
            comments
        },
    };
};

const fetchContent = async (tabId, isRefresh = false) => {
    if (tabId === 'detail') return;
    const dataState = tabData[tabId];
    if (dataState.loading) return;

    if (!isRefresh && !dataState.hasMore && dataState.lastResult) return;

    dataState.loading = true;
    try {
        let res;
        if (isRefresh || !dataState.lastResult) {
            const url = getDynamicUrl(tabId, dataState.sort);
            res = await $http.get(url);
        } else {
            res = await dataState.lastResult.next();
        }

        if (!res) {
            dataState.hasMore = false;
        } else {
            const rawList = res.data || [];
            const mappedList = rawList.map(formatContentItem).filter(i => i.id);

            if (isRefresh) {
                dataState.list = mappedList;
            } else {
                dataState.list.push(...mappedList);
            }

            dataState.lastResult = res;
            dataState.hasMore = !res.paging?.is_end;
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

const onRefresh = async (tabId, done) => {
    const id = tabId || activeTab.value;
    await fetchContent(id, true);
    if (done) done();
};

const onLoadMore = (tabId) => {
    const id = tabId || activeTab.value;
    fetchContent(id, false);
};

onMounted(() => {
    if (!hasHistory) {
        fetchTopicInfo();
    }
});

watch(activeTab, (newTab) => {
    if (newTab !== 'detail' && tabData[newTab].list.length === 0) {
        fetchContent(newTab, true);
    }
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
    if (tabData[tabId]) {
        tabData[tabId].sort = key;
        tabData[tabId].list = [];
        tabData[tabId].lastResult = null;
        tabData[tabId].hasMore = true;
        fetchContent(tabId, true);
    }
};

// Follow Topic function
const toggleFollow = async () => {
    if (isFollowLoading.value || !topicInfo.value) return;

    isFollowLoading.value = true;
    const url = `https://api.zhihu.com/topics/${topicId.value}/followers`;
    const currentFollowerCount = topicInfo.value.followerCount;

    try {
        if (!topicInfo.value.isFollowing) {
            await $http.post(url);
            topicInfo.value.isFollowing = true;
            topicInfo.value.followerCount = currentFollowerCount + 1;
        } else {
            const currentUserId = currentUser.value?.id || 'self';
            await $http.delete(`${url}/${currentUserId}`, "", { encryptHead: true });
            topicInfo.value.isFollowing = false;
            topicInfo.value.followerCount = Math.max(0, currentFollowerCount - 1);
        }
    } catch (err) {
        console.error('Failed to toggle follow:', err);
    } finally {
        isFollowLoading.value = false;
    }
};
</script>

<template>
    <f7-page class="topic-detail" :ref="(el) => pageRef = el">
        <f7-navbar class="profile-navbar">
            <f7-nav-left>
                <f7-link icon-only @click="handleBack">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="topicInfo" class="navbar-title">{{ topicInfo.name }}</f7-nav-title>
            <f7-nav-right>
                <f7-link v-if="activeTab !== 'detail'" icon-only popover-open=".sort-popover">
                    <f7-icon ios="f7:ellipsis_vertical" md="material:more_vert" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <div class="profile-main-content">
            <div class="profile-header-section">
                <div class="profile-header" v-if="topicInfo">
                    <div class="cover-image"
                        :style="{ backgroundColor: '#6366f1', backgroundImage: topicInfo.headerImage ? `url(${topicInfo.headerImage})` : '' }">
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
                <TabLayout v-if="topicInfo" :tabs="tabs" :active-id="activeTab" :onChange="(id) => activeTab = id"
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
                            :infinite-preloader="false" @infinite="onLoadMore(tab.id)" class="tab-scroll-content"
                            :ref="(el) => setScrollRef(el, tab.id)">
                            <div class="content-list">
                                <div v-if="!tabData[tab.id].loading && tabData[tab.id].list.length === 0"
                                    class="empty-state">
                                    暂无内容
                                </div>
                                <div v-else>
                                    <FeedCard v-for="(item, idx) in tabData[tab.id].list" :key="item.id + '-' + idx"
                                        :item="item" @click="$handleCardClick(f7router, item)" />
                                </div>

                                <div v-if="!tabData[tab.id].hasMore && tabData[tab.id].list.length > 0"
                                    class="end-text text-align-center padding-vertical text-color-gray">
                                    已加载全部内容
                                </div>
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
    border: 4px solid #fff;
    object-fit: cover;
    background: #f0f0f0;
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
    color: #444;
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
    color: #666;
}

.content-list {
    padding: 0;
}

.end-text {
    font-size: 0.8rem;
    padding: 16px 0;
}

.empty-state {
    padding: 100px 32px;
    text-align: center;
    color: #999;
}

.detail-text {
    white-space: pre-wrap;
    line-height: 1.6;
    color: #444;
}
</style>
