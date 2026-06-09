<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { HistoryService } from '../services/historyService.js';
import $http from '../api/http.js';
import CommentsSheet from './CommentsSheet.vue';
import { useHistory } from '../composables/useHistory.js';


const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});

const { register, restoreState } = useHistory(props, 'question_detail');
const hasHistory = !!restoreState();

const id = computed(() => props.f7route?.params?.id);
const question = ref(null);
const answers = ref([]);
const isLoading = ref(true);
const isDialogOpen = ref(false);
const isFollowed = ref(false);
const isFollowLoading = ref(false);
const showComments = ref(false);
const showMenu = ref(false);

const sortOrder = ref('default');
const hasMore = ref(true);
const lastResult = ref(null);
const isLoadingMore = ref(false);
const pageRef = ref(null);

register({
    state: {
        question,
        answers,
        isLoading,
        isDialogOpen,
        isFollowed,
        isFollowLoading,
        showComments,
        showMenu,
        sortOrder,
        hasMore,
        lastResult,
        isLoadingMore
    },
    scroll: () => ({
        main: pageRef.value?.$el?.querySelector('.page-content')
    })
});

const formatCount = (count) => {
    return count > 1000 ? `${(count / 1000).toFixed(1)}k` : count;
};

const fetchInfo = async () => {
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
            preview: question.value.description.replace(/<[^>]+>/g, '').substring(0, 100)
        });
    } catch (e) {
        console.error('Failed to fetch info', e);
    }
};

const fetchAnswers = async (isRefresh = false) => {
    if (!isRefresh && !hasMore.value) return;
    if (isLoadingMore.value) return;

    isLoadingMore.value = true;
    try {
        let res;
        if (isRefresh || !lastResult.value) {
            const url = `https://api.zhihu.com/questions/${id.value}/answers?limit=20&order=${sortOrder.value}`;
            res = await $http.get(url);
        } else {
            res = await lastResult.value.next();
        }

        if (!res) {
            hasMore.value = false;
        } else {
            const rawList = res.data || [];

            const mappedList = rawList.map(item => ({
                id: item.id,
                author: item.author?.name || '匿名用户',
                avatarUrl: item.author?.avatar_url,
                excerpt: item.excerpt || item.content?.substring(0, 200) || '',
                voteCount: item.voteup_count || 0,
                commentCount: item.comment_count || 0,
                timestamp: new Date(item.created_time * 1000).toLocaleDateString()
            }));

            if (isRefresh) {
                answers.value = mappedList;
            } else {
                answers.value.push(...mappedList);
            }

            lastResult.value = res;
            hasMore.value = !res.paging?.is_end;
        }
    } catch (err) {
        console.error('Failed to fetch answers:', err);
        hasMore.value = false;
    } finally {
        isLoadingMore.value = false;
    }
};

const onRefresh = async (done) => {
    await fetchInfo();
    await fetchAnswers(true);
    if (done && typeof done === 'function') done();
};

const onLoadMore = async () => {
    await fetchAnswers(false);
};

const handleBack = () => {
    if (props.f7router) props.f7router.back();
};

const handleAnswerClick = (answer) => {
    if (props.f7router) props.f7router.navigate(`/article/answer/${answer.id}`);
};

const handleCommentClick = (type, id) => {
    showComments.value = true;
};

const handleTopicClick = (tag) => {
    if (props.f7router) props.f7router.navigate(`/topic/${tag.id}`);
};

const handleUserClick = (userId) => {
    if (userId === 'anonymous') return;
    if (props.f7router) props.f7router.navigate(`/user/${userId}`);
};

const toggleFollow = async () => {
    if (isFollowLoading.value || !question.value) return;

    isFollowLoading.value = true;
    const url = `https://api.zhihu.com/questions/${id.value}/followers`;
    const currentFollowerCount = question.value.followerCount;

    try {
        if (!isFollowed.value) {
            await $http.post(url);
            isFollowed.value = true;
            question.value.followerCount = currentFollowerCount + 1;
        } else {
            await $http.delete(url);
            isFollowed.value = false;
            question.value.followerCount = Math.max(0, currentFollowerCount - 1);
        }
    } catch (err) {
        console.error('Failed to toggle follow:', err);
    } finally {
        isFollowLoading.value = false;
    }
};

onMounted(() => {
    if (!hasHistory) {
        onRefresh();
    }
});

watch(sortOrder, () => {
    answers.value = [];
    lastResult.value = null;
    hasMore.value = true;
    fetchAnswers(true);
});
</script>

<template>
    <f7-page class="question-detail" ptr @ptr:refresh="onRefresh" infinite :infinite-preloader="hasMore"
        @infinite="onLoadMore" :ref="(el) => pageRef = el">
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

        <div v-if="!question" class="loading-state display-flex justify-content-center align-items-center"
            style="height: 100dvh;">
            <f7-preloader />
        </div>

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
                        <div class="metric-item display-flex align-items-center"
                            @click="handleCommentClick('question', question.id)">
                            <f7-icon ios="f7:bubble_left" md="material:chat_bubble" size="16" />
                            <span class="margin-left-half">{{ question.answerCount }} 评论</span>
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
                <f7-card v-for="answer in answers" :key="answer.id" class="answer-item"
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
                            <div class="metric-item display-flex align-items-center"
                                @click.stop="handleCommentClick('answer', answer.id)">
                                <f7-icon ios="f7:bubble_left" md="material:chat_bubble" size="16" />
                                <span class="margin-left-half">{{ formatCount(answer.commentCount) }}</span>
                            </div>
                            <div class="timestamp margin-left-auto">{{ answer.timestamp }}</div>
                        </div>
                    </f7-card-content>
                </f7-card>
            </div>
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

        <CommentsSheet v-model="showComments" :resourceId="id" resourceType="question" :f7router="f7router" />

        <f7-popover class="menu-popover">
            <f7-list>
                <f7-list-item title="问题日志" link popover-close
                    @click="$openLink(`https://www.zhihu.com/question/${id}/log`)" />
            </f7-list>
        </f7-popover>
    </f7-page>
</template>

<style scoped>
.question-detail {
    height: 100%;
}

.answers-header-bar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    height: 44px;
}

.sort-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
}

.sort-selector .f7-link {
    color: #999;
}

.sort-selector .f7-link.active-sort {
    color: var(--f7-theme-color);
    font-weight: bold;
}

.sort-selector .divider {
    color: #eee;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
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

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    height: 56px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    z-index: 30;
}

.title-text {
    font-weight: bold;
    transition: opacity 0.2s;
}

.main-scroll {
    flex: 1;
    width: 100%;
}

.content-wrapper {
    padding-bottom: 80px;
}

.question-header {
    padding: 16px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.max-container {
    max-width: 768px;
    margin: auto;
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.tag-chip {
    height: 32px;
    border: none;
}

.tag-text {
    font-size: 0.75rem;
    font-weight: 500;
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

.action-btn {
    height: 36px;
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.answers-title {
    font-weight: bold;
    font-size: 1rem;
}

.sort-option {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.875rem;
    opacity: 0.7;
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
