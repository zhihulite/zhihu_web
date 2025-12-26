<script setup>
import { ref, computed, onMounted } from 'vue';


const props = defineProps({
    f7route: Object,
    f7router: Object
});

const id = computed(() => props.f7route?.params?.id);
const question = ref(null);
const answers = ref([]);
const isLoading = ref(true);
const isDialogOpen = ref(false);
const isFollowed = ref(false);

const formatCount = (count) => {
    return count > 1000 ? `${(count / 1000).toFixed(1)}k` : count;
};

const fetchQuestionData = async () => {
    isLoading.value = true;
    try {
        const res = await window.$http.get(`https://api.zhihu.com/questions/${id.value}`);
        const data = res.data || res;

        question.value = {
            id: data.id,
            title: data.title,
            description: data.detail || data.excerpt || '',
            tags: (data.topics || []).slice(0, 5).map(t => ({ id: t.id, name: t.name })),
            answerCount: data.answer_count || 0,
            followerCount: data.follower_count || 0,
            author: {
                name: data.author?.name || '匿名用户',
                avatarUrl: data.author?.avatar_url,
                bio: data.author?.headline || ''
            }
        };

        const answersRes = await window.$http.get(`https://api.zhihu.com/questions/${id.value}/answers?limit=20&order=default`);
        const answersData = answersRes.data || answersRes;

        answers.value = (Array.isArray(answersData) ? answersData : []).map(item => ({
            id: item.id,
            author: item.author?.name || '匿名用户',
            avatarUrl: item.author?.avatar_url,
            excerpt: item.excerpt || item.content?.substring(0, 200) || '',
            voteCount: item.voteup_count || 0,
            commentCount: item.comment_count || 0,
            timestamp: new Date(item.created_time * 1000).toLocaleDateString()
        }));

    } catch (err) {
        console.error('Failed to fetch question:', err);
    } finally {
        isLoading.value = false;
    }
};

const handleBack = () => {
    if (props.f7router) props.f7router.back();
};

const handleAnswerClick = (answer) => {
    if (props.f7router) props.f7router.navigate(`/article/answer/${answer.id}`);
};

const handleTopicClick = (tag) => {
    if (props.f7router) props.f7router.navigate(`/topic/${tag.id}`);
};

onMounted(() => {
    fetchQuestionData();
});
</script>

<template>
    <f7-page class="question-detail">
        <f7-navbar>
            <f7-nav-left>
                <f7-link icon-only @click="handleBack">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="question">{{ question.title }}</f7-nav-title>
            <f7-nav-right>
                <f7-link icon-only>
                    <f7-icon ios="f7:ellipsis_vertical" md="material:more_vert" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <div v-if="isLoading" class="loading-state display-flex justify-content-center align-items-center"
            style="height: 100%;">
            <f7-preloader />
        </div>

        <f7-page-content v-else-if="question" class="padding-bottom">
            <div class="content-wrapper">
                <f7-block class="question-header no-margin padding">
                    <div class="max-container">
                        <div class="tags-row display-flex flex-wrap margin-bottom-half" style="gap: 8px;">
                            <f7-chip v-for="tag in question.tags" :key="tag.id" :text="tag.name" outline
                                @click="handleTopicClick(tag)" />
                        </div>

                        <div class="question-title font-size-20 font-weight-bold margin-bottom">{{ question.title }}
                        </div>

                        <div class="author-info display-flex align-items-center margin-bottom">
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

                        <div
                            class="action-bar display-flex justify-content-space-between align-items-center margin-top">
                            <div class="action-buttons">
                                <f7-button :fill="!isFollowed" :outline="isFollowed" small
                                    @click="isFollowed = !isFollowed">
                                    <f7-icon :ios="isFollowed ? 'f7:checkmark' : 'f7:plus'"
                                        :md="isFollowed ? 'material:check' : 'material:add'" size="16" />
                                    {{ isFollowed ? '已关注' : '关注问题' }}
                                </f7-button>
                            </div>

                            <div class="metrics display-flex gap-2 text-color-gray">
                                <div class="metric-item display-flex align-items-center margin-right">
                                    <f7-icon ios="f7:star_fill" md="material:star" size="18" />
                                    <span class="margin-left-half">{{ formatCount(question.followerCount) }} 收藏</span>
                                </div>
                                <div class="metric-item display-flex align-items-center">
                                    <f7-icon ios="f7:bubble_left" md="material:chat_bubble" size="16" />
                                    <span class="margin-left-half">{{ question.answerCount }} 评论</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </f7-block>

                <f7-block-title>{{ question.answerCount }} 个回答</f7-block-title>

                <div class="answers-list">
                    <f7-card v-for="answer in answers" :key="answer.id"
                        class="answer-item margin-horizontal margin-bottom" @click="handleAnswerClick(answer)">
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
            </div>
        </f7-page-content>

        <f7-popup class="description-popup" :opened="isDialogOpen" @popup:closed="isDialogOpen = false" swipe-to-close>
            <f7-page>
                <f7-navbar title="问题描述">
                    <f7-nav-right>
                        <f7-link popup-close>关闭</f7-link>
                    </f7-nav-right>
                </f7-navbar>
                <f7-page-content class="padding">
                    <div class="dialog-content" v-html="question.description"></div>
                </f7-page-content>
            </f7-page>
        </f7-popup>
    </f7-page>
</template>

<style scoped>
.question-detail {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
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

.description-text {
    font-size: 0.875rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
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

.answer-item {
    padding: 16px;
    margin: 16px;
    width: 100%;
    max-width: none;
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
