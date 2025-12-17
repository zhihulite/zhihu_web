<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MaterialSymbol from './MaterialSymbol.vue';

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
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
        const res = await window.$zhihu.get(`https://api.zhihu.com/questions/${id.value}`);
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

        const answersRes = await window.$zhihu.get(`https://api.zhihu.com/questions/${id.value}/answers?limit=20&order=default`);
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
    router.back();
};

const handleAnswerClick = (answer) => {
    router.push(`/article/answer/${answer.id}`);
};

const handleTopicClick = (tag) => {
    router.push(`/topic/${tag.id}`);
};

onMounted(() => {
    fetchQuestionData();
});
</script>

<template>
    <div class="question-detail">
        <div v-if="isLoading" class="loading-state">
            <MaterialSymbol icon="progress_activity" :size="32" class="spin" />
        </div>

        <template v-else-if="question">
            <div class="top-bar glass">
                <s-icon-button @click="handleBack">
                    <MaterialSymbol icon="arrow_back" />
                </s-icon-button>
                <div class="title-text">{{ question.title }}</div>
                <s-icon-button>
                    <MaterialSymbol icon="more_vert" />
                </s-icon-button>
            </div>

            <s-scroll-view class="main-scroll">
                <div class="content-wrapper">
                    <div class="question-header">
                        <div class="max-container">
                            <div class="tags-row">
                                <s-chip v-for="tag in question.tags" :key="tag.id" class="tag-chip" clickable="true"
                                    @click="handleTopicClick(tag)">
                                    <span class="tag-text">{{ tag.name }}</span>
                                </s-chip>
                            </div>

                            <div class="author-info">
                                <img :src="question.author.avatarUrl" class="author-avatar"
                                    :onerror="`this.src='https://placehold.co/32x32/6366f1/ffffff?text=U'`" />
                                <div class="author-details">
                                    <span class="author-name">{{ question.author.name }}</span>
                                    <span class="author-bio">{{ question.author.bio }}</span>
                                </div>
                            </div>

                            <div class="description-preview">
                                <div class="description-text" v-html="question.description"></div>
                                <button v-if="question.description" @click="isDialogOpen = true" class="expand-button">
                                    展开阅读全文
                                    <MaterialSymbol icon="keyboard_arrow_down" :size="18" />
                                </button>
                            </div>

                            <div class="action-bar">
                                <div class="action-buttons">
                                    <s-button :type="isFollowed ? 'filled-tonal' : 'filled'"
                                        @click="isFollowed = !isFollowed" class="action-btn">
                                        <s-icon slot="icon">
                                            <MaterialSymbol :icon="isFollowed ? 'check' : 'add'" />
                                        </s-icon>
                                        {{ isFollowed ? '已关注' : '关注问题' }}
                                    </s-button>
                                </div>

                                <div class="metrics">
                                    <div class="metric-item">
                                        <MaterialSymbol icon="star" :size="20" />
                                        <span>{{ formatCount(question.followerCount) }} 收藏</span>
                                    </div>
                                    <div class="metric-item">
                                        <MaterialSymbol icon="chat_bubble" :size="18" />
                                        <span>{{ question.answerCount }} 评论</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <s-divider></s-divider>

                    <div class="max-container">
                        <div class="answers-header">
                            <h2 class="answers-title">{{ question.answerCount }} 个回答</h2>
                            <div class="sort-option">
                                <span>默认排序</span>
                                <MaterialSymbol icon="sort" :size="16" />
                            </div>
                        </div>

                        <div class="answers-list">
                            <s-card v-for="answer in answers" :key="answer.id" class="answer-item" clickable="true"
                                @click="handleAnswerClick(answer)">
                                <div class="answer-author">
                                    <img :src="answer.avatarUrl" class="answer-avatar"
                                        :onerror="`this.src='https://placehold.co/24x24/6366f1/ffffff?text=U'`" />
                                    <span class="answer-author-name">{{ answer.author }}</span>
                                </div>

                                <div class="answer-excerpt">
                                    <p>{{ answer.excerpt }}</p>
                                </div>

                                <div class="answer-metrics">
                                    <div class="metric-item primary">
                                        <MaterialSymbol icon="thumb_up" :size="18" :fill="true" />
                                        <span>{{ formatCount(answer.voteCount) }}</span>
                                    </div>
                                    <div class="metric-item">
                                        <MaterialSymbol icon="chat_bubble" :size="18" />
                                        <span>{{ formatCount(answer.commentCount) }}</span>
                                    </div>
                                    <div class="timestamp">{{ answer.timestamp }}</div>
                                </div>
                            </s-card>
                        </div>
                    </div>
                </div>
            </s-scroll-view>

            <s-dialog :showed="isDialogOpen" @close="isDialogOpen = false">
                <div slot="headline">问题描述</div>
                <div slot="text" class="dialog-content" v-html="question.description"></div>
                <s-button slot="action" type="text" @click="isDialogOpen = false">关闭</s-button>
            </s-dialog>
        </template>
    </div>
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
    color: var(--md-sys-color-primary);
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
