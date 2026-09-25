<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { HistoryService } from '@/services/history.js';
import $http from '@/services/http.js';
import { usePageState } from '@/composables/usePageState.js';
import { usePagedList } from '@/composables/usePagedList.js';
import { useFollowToggle } from '@/composables/useFollowToggle.js';
import { formatCount } from '@/utils/format.js';
import { voteupOf, commentCountOf } from '@/mappers/zhihu-item.js';
import { useContentMenu } from '@/composables/useContentMenu.js';
import PageLoader from '@/components/PageLoader.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';


const props = defineProps({
    f7route: Object,
    f7router: Object
});

const id = computed(() => props.f7route?.params?.id);
const question = ref(null);
const infoError = ref(null);
const isLoading = ref(true);
const isDialogOpen = ref(false);
const isFollowed = ref(false);
const showMenu = ref(false);

const sortOrder = ref('default');

const { page, loading: isLoadingMore, refresh: refreshAnswers, loadMore, reset: resetAnswers } = usePagedList({
    name: '回答',
    fetch: (signal) => $http.get(`https://api.zhihu.com/questions/${id.value}/answers?limit=20&order=${sortOrder.value}`, { signal }),
    map: (item) => ({
        id: item.id,
        author: item.author?.name || '匿名用户',
        avatarUrl: item.author?.avatar_url,
        excerpt: item.excerpt || item.content?.substring(0, 200) || '',
        voteCount: voteupOf(item),
        commentCount: commentCountOf(item),
        timestamp: new Date(item.created_time * 1000).toLocaleDateString()
    }),
});

const { loading: isFollowLoading, toggle: toggleFollow } = useFollowToggle({
    url: () => `https://api.zhihu.com/questions/${id.value}/followers`,
    isFollowing: () => isFollowed.value,
    setFollowing: (v) => { isFollowed.value = v; },
    followerCount: () => question.value?.followerCount || 0,
    setFollowerCount: (n) => { if (question.value) question.value.followerCount = n; },
});

const { hasCache } = usePageState({
    state: {
        question,
        page,
        isDialogOpen,
        isFollowed,
        showMenu,
        sortOrder
    },
    loading: [isLoading, isLoadingMore, isFollowLoading],
});


const fetchInfo = async () => {
    infoError.value = null;
    try {
        const res = await $http.get(`https://api.zhihu.com/questions/${id.value}`);
        const data = res.data || res;

        question.value = {
            id: id.value,
            title: data.title,
            description: data.detail || data.excerpt || '',
            tags: (data.topics || []).slice(0, 5).map(t => ({ id: t.id, name: t.name })),
            answerCount: data.answer_count || 0,
            followerCount: data.follower_count || 0,
            author: {
                name: data.author?.name || '匿名用户',
                avatarUrl: data.author?.avatar_url,
                id: data.author?.id || 'anonymous',
                bio: data.author?.headline || ''
            }
        };

        isFollowed.value = data.relationship?.is_following || false;

        HistoryService.addRecord({
            id: question.value.id,
            type: 'question',
            title: question.value.title,
            preview: (question.value.description || '').replace(/<[^>]+>/g, '').substring(0, 100)
        });
    } catch (e) {
        console.error('Failed to fetch info', e);
        // 不置错误态的话整页只剩转圈，用户既看不到失败也没有重试入口
        infoError.value = e.message || '加载失败';
    }
};

const onRefresh = async (done) => {
    await fetchInfo();
    await refreshAnswers();
    if (done && typeof done === 'function') done();
};

const { copyLink: copyQuestionLink, share: shareQuestion, report: reportQuestion } = useContentMenu({
    url: () => `https://www.zhihu.com/question/${id.value}`,
    title: () => question.value?.title,
    reportType: 'question',
    reportId: id.value,
});

const onLoadMore = async () => {
    await loadMore();
};

const handleBack = () => {
    if (props.f7router) props.f7router.back();
};

const handleAnswerClick = (answer) => {
    if (!props.f7router) return;
    // 携带本页有序回答序列，详情页据此上下滑切换相邻回答
    props.f7router.navigate(`/article/answer/${answer.id}`, {
        props: { neighborIds: page.list.map((a) => String(a.id)) },
    });
};

const handleTopicClick = (tag) => {
    if (props.f7router) props.f7router.navigate(`/topic/${tag.id}`);
};

const handleUserClick = (userId) => {
    if (userId === 'anonymous') return;
    if (props.f7router) props.f7router.navigate(`/user/${userId}`);
};

onMounted(() => {
    if (!hasCache.value) {
        onRefresh();
    }
});

watch(sortOrder, () => {
    resetAnswers();
    refreshAnswers();
});
</script>

<template>
    <f7-page class="question-detail" ptr @ptr:refresh="onRefresh" infinite :infinite-preloader="page.hasMore"
        @infinite="onLoadMore">
        <f7-navbar>
            <f7-nav-left>
                <f7-link icon-only @click="handleBack">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="question">{{ question.title }}</f7-nav-title>
            <f7-nav-right>
                <f7-link icon-only popover-open=".menu-popover">
                    <f7-icon ios="f7:ellipsis_vertical" md="material:more_vert" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <PageLoader v-if="!question && !infoError" height="100dvh" />

        <EmptyState v-else-if="!question" icon="exclamationmark_triangle" text="问题信息加载失败"
            subtext="点击重试" @click="fetchInfo" />

        <div v-else-if="question" class="content-wrapper">
            <f7-block class="question-header no-margin padding">
                <div class="tags-row display-flex flex-wrap margin-bottom-half" style="gap: 8px;">
                    <f7-chip v-for="tag in question.tags" :key="tag.id" :text="tag.name" outline
                        @click="handleTopicClick(tag)" />
                </div>

                <div class="question-title font-size-20 font-weight-bold margin-bottom">{{ question.title }}
                </div>

                <div class="author-info display-flex align-items-center margin-bottom"
                    @click="handleUserClick(question.author.id)">
                    <img :src="question.author.avatarUrl" class="author-avatar width-32 height-32"
                        :onerror="`this.src='https://placehold.co/32x32/6366f1/ffffff?text=U'`"
                        style="border-radius: 50%;" />
                    <div class="author-details margin-left display-flex flex-direction-column">
                        <span class="author-name font-weight-bold">{{ question.author.name }}</span>
                        <span class="author-bio text-color-gray text-size-12">{{ question.author.bio }}</span>
                    </div>
                </div>

                <div class="description-preview margin-bottom">
                    <div class="description-text" v-html="question.description"></div>
                    <f7-button small flat v-if="question.description" @click="isDialogOpen = true"
                        class="expand-button margin-top-half display-flex align-items-center">
                        展开阅读全文
                        <f7-icon ios="f7:chevron_down" md="material:keyboard_arrow_down" size="16" />
                    </f7-button>
                </div>

                <div class="action-bar display-flex justify-content-space-between align-items-center margin-top">
                    <div class="action-buttons">
                        <f7-button :fill="!isFollowed" :outline="isFollowed" small @click="toggleFollow"
                            :loading="isFollowLoading">
                            <f7-icon :ios="isFollowed ? 'f7:checkmark' : 'f7:plus'"
                                :md="isFollowed ? 'material:check' : 'material:add'" size="16" />
                            {{ isFollowed ? '已关注' : '关注问题' }}
                        </f7-button>
                    </div>

                    <div class="metrics display-flex gap-2 text-color-gray">
                        <div class="metric-item display-flex align-items-center margin-right">
                            <f7-icon ios="f7:star_fill" md="material:star" size="18" />
                            <span class="margin-left-half">{{ formatCount(question.followerCount) }} 关注</span>
                        </div>
                    </div>
                </div>
            </f7-block>

            <div
                class="answers-header-bar padding-horizontal display-flex justify-content-space-between align-items-center bg-color-white">
                <f7-block-title class="no-margin">{{ question.answerCount }} 个回答</f7-block-title>
                <div class="sort-selector">
                    <f7-link :class="{ 'active-sort': sortOrder === 'default' }"
                        @click="sortOrder = 'default'">默认</f7-link>
                    <span class="divider">/</span>
                    <f7-link :class="{ 'active-sort': sortOrder === 'created' }"
                        @click="sortOrder = 'created'">最新</f7-link>
                </div>
            </div>

            <div class="answers-list">
                <f7-card v-for="answer in page.list" :key="answer.id" class="answer-item"
                    @click="handleAnswerClick(answer)">
                    <f7-card-content>
                        <div class="answer-author display-flex align-items-center margin-bottom-half">
                            <img :src="answer.avatarUrl" class="answer-avatar width-24 height-24"
                                style="border-radius: 50%;"
                                :onerror="`this.src='https://placehold.co/24x24/6366f1/ffffff?text=U'`" />
                            <span class="answer-author-name font-weight-bold margin-left-half">{{ answer.author
                            }}</span>
                        </div>

                        <div class="answer-excerpt text-color-gray">
                            <p class="no-margin">{{ answer.excerpt }}</p>
                        </div>

                        <div
                            class="answer-metrics display-flex align-items-center margin-top text-color-gray text-size-12">
                            <div class="metric-item primary display-flex align-items-center margin-right">
                                <f7-icon ios="f7:hand_thumbsup_fill" md="material:thumb_up" size="16" />
                                <span class="margin-left-half">{{ formatCount(answer.voteCount) }}</span>
                            </div>
                            <div class="metric-item display-flex align-items-center">
                                <f7-icon ios="f7:bubble_left" md="material:chat_bubble" size="16" />
                                <span class="margin-left-half">{{ formatCount(answer.commentCount) }}</span>
                            </div>
                            <div class="timestamp margin-left-auto">{{ answer.timestamp }}</div>
                        </div>
                    </f7-card-content>
                </f7-card>
            </div>

            <LoadMoreFooter :has-more="page.hasMore" :length="page.list.length" text="已加载全部回答" />
        </div>

        <f7-popup class="description-popup" :opened="isDialogOpen" @popup:closed="isDialogOpen = false" swipe-to-close>
            <f7-page>
                <f7-navbar title="问题描述">
                    <f7-nav-right>
                        <f7-link popup-close>关闭</f7-link>
                    </f7-nav-right>
                </f7-navbar>
                <f7-page-content class="padding">
                    <div class="dialog-content" v-html="question?.description"></div>
                </f7-page-content>
            </f7-page>
        </f7-popup>

        <f7-popover class="menu-popover">
            <f7-list>
                <f7-list-item title="刷新" link popover-close @click="onRefresh()" />
                <f7-list-item title="分享" link popover-close @click="shareQuestion" />
                <f7-list-item title="复制链接" link popover-close @click="copyQuestionLink" />
                <f7-list-item title="问题日志" link popover-close
                    @click="$openLink(`https://www.zhihu.com/question/${id}/log`)" />
                <f7-list-item title="举报" link popover-close @click="reportQuestion" />
            </f7-list>
        </f7-popover>
    </f7-page>
</template>

<style scoped>
.question-detail {
    height: 100%;
}

.answers-header-bar {
    border-bottom: 1px solid var(--app-divider-color);
    height: 44px;
}

.sort-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
}

.sort-selector .link {
    color: var(--app-sub-text);
}

.sort-selector .link.active-sort {
    color: var(--f7-theme-color);
    font-weight: bold;
}

.sort-selector .divider {
    color: var(--app-divider-color);
}

.content-wrapper {
    padding-bottom: 80px;
}

.question-header {
    padding: 16px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.question-title {
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1.4;
    margin-bottom: 16px;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.author-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.author-details {
    display: flex;
    flex-direction: column;
}

.author-name {
    font-size: 0.875rem;
    font-weight: bold;
}

.author-bio {
    font-size: 0.75rem;
    opacity: 0.8;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.description-preview {
    margin-bottom: 16px;
}

.description-preview:deep(img) {
    max-width: 100%;
}

.description-text {
    font-size: 0.875rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.expand-button {
    font-weight: 500;
    font-size: 0.875rem;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 2px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.metrics {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
}

.metric-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.metric-item.primary {
    opacity: 0.8;
}

.answers-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--app-divider-color);
}

.answers-list {
    padding: 0;
}


.answer-author {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.answer-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
}

.answer-author-name {
    font-size: 0.875rem;
    font-weight: bold;
}

.answer-excerpt {
    margin-bottom: 12px;
}

.answer-excerpt p {
    font-size: 0.9375rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}

.answer-metrics {
    display: flex;
    align-items: center;
    gap: 24px;
    font-size: 0.875rem;
    opacity: 0.6;
}

.timestamp {
    font-size: 0.75rem;
    margin-left: auto;
    margin-top: 2px;
}

.dialog-content {
    font-size: 0.875rem;
    line-height: 1.6;
    max-width: 100%;
}

.dialog-content :deep(img) {
    max-width: 100%;
    border-radius: 8px;
}

.dialog-content :deep(p) {
    margin-bottom: 12px;
}
</style>
