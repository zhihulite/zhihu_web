<script setup>
import { ref, watch } from 'vue';
import MaterialSymbol from './MaterialSymbol.vue';
import $http from '../api/http.js';

const props = defineProps({
    modelValue: Boolean,
    resourceType: {
        type: String,
        required: true,
    },
    resourceId: {
        type: [String, Number],
        required: true,
    }
});

const emit = defineEmits(['update:modelValue', 'reply', 'like']);

const comments = ref([]);
const totalComments = ref(0);
const topResult = ref(null);
const isLoading = ref(false);
const error = ref(null);

const replyTo = ref(null);
const replyContent = ref('');

const expandedComment = ref(null);
const repliesViewLoading = ref(false);

const formatComment = (item) => {
    const repliesCount = item.replies_count || item.child_comment_count || 0;
    return {
        id: item.id,
        author_name: item.author?.member?.name || "匿名用户",
        author_avatar: item.author?.member?.avatar_url,
        ip_location: item.address_text || null,
        content: item.content,
        like_count: item.vote_count || 0,
        created_time: new Date(item.created_time * 1000).toLocaleDateString(),
        replies_count: repliesCount,
        reply_to_author: item.reply_to_author?.member?.name || null,
        child_result: null,
        child_comments: [],
        child_comments_loading: false,
    };
};

const getApiType = (type) => {
    if (type === "p") return "articles";
    if (type === "answer") return "answers";
    return type;
};

const loadTopComments = async (loadMore = false) => {
    if (isLoading.value) return;

    isLoading.value = true;
    error.value = null;

    try {
        let result;
        if (loadMore && topResult.value) {
            result = await topResult.value.next();
        } else {
            const url = `https://api.zhihu.com/${getApiType(props.resourceType)}/${props.resourceId}/comments?limit=20&order=normal`;
            result = await $http.get(url);
        }

        if (!result) {
            isLoading.value = false;
            return;
        }

        const formatted = result.data.map(formatComment);

        if (loadMore) {
            comments.value.push(...formatted);
        } else {
            comments.value = formatted;
            totalComments.value = result.paging?.totals || result.data.length;
        }

        topResult.value = result;

    } catch (err) {
        console.error('Failed to load comments:', err);
        error.value = "评论加载失败";
    } finally {
        isLoading.value = false;
    }
};

const openRepliesView = async (comment) => {
    expandedComment.value = comment;

    if (comment.replies_count > 0) {
        repliesViewLoading.value = true;
        await loadChildComments(comment);
        repliesViewLoading.value = false;
    }
};

const closeRepliesView = () => {
    if (expandedComment.value) {
        expandedComment.value.child_comments = [];
    }
    expandedComment.value = null;
};

const loadChildComments = async (parentComment, loadMore = false) => {
    if (parentComment.child_comments_loading) return;

    parentComment.child_comments_loading = true;

    try {
        let result;
        if (loadMore && parentComment.child_result) {
            result = await parentComment.child_result.next();
        } else {
            const url = `https://api.zhihu.com/comments/${parentComment.id}/replies?limit=20`;
            result = await $http.get(url);

            if (result.data.length > 0 && result.data[0].id == parentComment.id) {
                result.data = result.data.slice(1);
            }
        }

        if (!result) {
            parentComment.child_comments_loading = false;
            return;
        }

        const formatted = result.data.map(formatComment);

        if (loadMore) {
            parentComment.child_comments.push(...formatted);
        } else {
            parentComment.child_comments = formatted;
        }

        parentComment.child_result = result;

    } catch (err) {
        console.error('Failed to load child comments:', err);
    } finally {
        parentComment.child_comments_loading = false;
    }
};

const handleClose = () => {
    emit('update:modelValue', false);
};

const handleReply = (comment) => {
    replyTo.value = comment.author_name;
};

const clearReply = () => {
    replyTo.value = null;
    replyContent.value = '';
};

watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        comments.value = [];
        totalComments.value = 0;
        topResult.value = null;
        error.value = null;
        expandedComment.value = null;
        replyTo.value = null;
        replyContent.value = '';

        if (props.resourceType && props.resourceId) {
            loadTopComments();
        }
    }
});
</script>

<template>
    <s-dialog :showed="modelValue" @close="handleClose">
        <div slot="trigger" style="display: none;"></div>

        <div class="comments-container">
            <div class="header">
                <div v-if="expandedComment" class="header-left">
                    <s-icon-button @click="closeRepliesView">
                        <MaterialSymbol icon="arrow_back" />
                    </s-icon-button>
                    <span class="title">评论回复 ({{ expandedComment.replies_count }})</span>
                </div>
                <div v-else class="header-left">
                    <span class="title">{{ totalComments }} 条评论</span>
                </div>

                <s-icon-button @click="handleClose">
                    <MaterialSymbol icon="close" />
                </s-icon-button>
            </div>

            <s-scroll-view class="scroll-view">

                <div v-if="expandedComment" class="replies-view">
                    <div class="comment-item main-comment">
                        <img :src="expandedComment.author_avatar" class="avatar"
                            :onerror="`this.src='https://placehold.co/40x40/6366f1/ffffff?text=U'`" />
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="username">{{ expandedComment.author_name }}</span>
                                <span class="timestamp">{{ expandedComment.created_time }}</span>
                            </div>
                            <p class="text">{{ expandedComment.content }}</p>
                        </div>
                    </div>

                    <div class="replies-label">全部回复</div>

                    <div class="comments-list replies-container">
                        <div v-for="reply in expandedComment.child_comments" :key="reply.id" class="comment-item">
                            <img :src="reply.author_avatar" class="avatar small"
                                :onerror="`this.src='https://placehold.co/30x30/6366f1/ffffff?text=U'`" />
                            <div class="comment-content">
                                <div class="comment-header">
                                    <div class="user-info">
                                        <span class="username">{{ reply.author_name }}</span>
                                        <span v-if="reply.reply_to_author" class="reply-badge">
                                            <MaterialSymbol icon="arrow_right" :size="14" /> {{
                                                reply.reply_to_author }}
                                        </span>
                                    </div>
                                    <span class="timestamp">{{ reply.created_time }}</span>
                                </div>
                                <p class="text">{{ reply.content }}</p>
                                <div class="actions">
                                    <button class="action-btn" @click="emit('like', reply.id)">
                                        <MaterialSymbol icon="thumb_up" :size="16" /> {{ reply.like_count }}
                                    </button>
                                    <button class="action-btn" @click="handleReply(reply)">
                                        <MaterialSymbol icon="chat_bubble" :size="16" /> 回复
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button v-if="expandedComment.child_result?.paging?.next" class="load-more-btn"
                            @click="loadChildComments(expandedComment, true)">
                            <span v-if="expandedComment.child_comments_loading" class="loading-spinner">
                                <MaterialSymbol icon="progress_activity" :size="16" class="spin" />
                            </span>
                            {{ expandedComment.child_comments_loading ? '正在加载...' : '加载更多回复...' }}
                        </button>
                    </div>
                </div>

                <div v-else>
                    <div v-if="isLoading && comments.length === 0" class="loading-state">
                        <MaterialSymbol icon="progress_activity" :size="24" class="spin primary-color" />
                        正在加载评论...
                    </div>
                    <div v-else-if="error" class="error-state">
                        <MaterialSymbol icon="error" :size="24" />
                        {{ error }}
                    </div>
                    <div v-else-if="comments.length === 0" class="empty-state">
                        暂无评论，快来抢沙发吧~
                    </div>

                    <div class="comments-list" v-else>
                        <div v-for="comment in comments" :key="comment.id" class="comment-item">
                            <img :src="comment.author_avatar" class="avatar"
                                :onerror="`this.src='https://placehold.co/40x40/6366f1/ffffff?text=U'`" />
                            <div class="comment-content">
                                <div class="comment-header">
                                    <div class="user-info">
                                        <span class="username">{{ comment.author_name }}</span>
                                        <span v-if="comment.ip_location" class="location-badge">
                                            <MaterialSymbol icon="location_on" :size="14" /> {{ comment.ip_location
                                            }}
                                        </span>
                                    </div>
                                    <span class="timestamp">{{ comment.created_time }}</span>
                                </div>
                                <p class="text">{{ comment.content }}</p>

                                <div class="actions">
                                    <button class="action-btn" @click="emit('like', comment.id)">
                                        <MaterialSymbol icon="thumb_up" :size="16" /> {{ comment.like_count }}
                                    </button>
                                    <button class="action-btn" @click="handleReply(comment)">
                                        <MaterialSymbol icon="chat_bubble" :size="16" /> 回复
                                    </button>
                                </div>

                                <!-- 子评论切换按钮 -->
                                <div v-if="comment.replies_count > 0" class="replies-toggle">
                                    <button class="toggle-btn" @click="openRepliesView(comment)">
                                        查看全部 {{ comment.replies_count }} 条回复
                                        <MaterialSymbol icon="chevron_right" :size="16" />
                                    </button>
                                </div>

                            </div>
                        </div>

                        <!-- 顶层加载更多 -->
                        <div v-if="topResult?.paging?.next" class="text-center mt-4">
                            <button class="load-more-btn" :disabled="isLoading" @click="loadTopComments(true)">
                                <span v-if="isLoading" class="loading-spinner mr-2">
                                    <MaterialSymbol icon="progress_activity" :size="16" class="spin" />
                                </span>
                                {{ isLoading ? '正在加载更多评论...' : '加载更多评论' }}
                            </button>
                        </div>
                    </div>
                </div>
            </s-scroll-view>

            <div class="footer">
                <div v-if="replyTo" class="reply-context">
                    <span>回复: @{{ replyTo }}</span>
                    <button @click="clearReply" class="close-reply">
                        <MaterialSymbol icon="close" :size="16" />
                    </button>
                </div>
                <s-text-field :label="replyTo ? `回复 ${replyTo}...` : '友善评论，精彩互动...'" v-model="replyContent"
                    class="input-field">
                    <s-icon-button type="filled" class="send-btn" slot="end">
                        <MaterialSymbol icon="send" :size="18" />
                    </s-icon-button>

                </s-text-field>
            </div>
        </div>
    </s-dialog>
</template>

<style scoped>
.comments-container {
    display: flex;
    flex-direction: column;
    height: 85vh;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    overflow: hidden;
    width: 50vw;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.title {
    font-size: 1.125rem;
    font-weight: bold;
}

.scroll-view {
    flex: 1;
    width: 100%;
}

.comments-list {
    padding: 16px;
    padding-bottom: 80px;
}

.replies-view {
    padding-bottom: 80px;
}

.main-comment {
    padding: 16px;
}

.replies-label {
    padding: 12px 16px;
    font-size: 0.9rem;
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.replies-container {
    padding-top: 0;
}

.empty-state,
.loading-state,
.error-state {
    padding: 40px 0;
    text-align: center;
    opacity: 0.7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.comment-item {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.comment-item:last-child {
    margin-bottom: 0;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.avatar.small {
    width: 28px;
    height: 28px;
}

.comment-content {
    flex: 1;
    min-width: 0;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.username {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface);
}

.location-badge {
    font-size: 0.75rem;
    color: var(--md-sys-color-tertiary);
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 4px;
    border-radius: 4px;
    background-color: var(--md-sys-color-tertiary-container);
    opacity: 0.8;
}

.reply-badge {
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.7;
    display: flex;
    align-items: center;
    background-color: var(--md-sys-color-surface-container);
    padding: 2px 4px;
    border-radius: 4px;
}

.timestamp {
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.5;
}

.text {
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--md-sys-color-on-surface-variant);
    margin: 0;
    word-break: break-word;
}

.actions {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 8px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    padding: 0;
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.5;
    cursor: pointer;
    transition: color 0.2s, opacity 0.2s;
}

.action-btn:hover {
    opacity: 1;
    color: var(--md-sys-color-primary);
}

.replies-toggle {
    margin-top: 8px;
}

.toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--md-sys-color-surface-container-low);
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--md-sys-color-primary);
    cursor: pointer;
    transition: opacity 0.2s, background-color 0.2s;
}

.toggle-btn:hover {
    background-color: var(--md-sys-color-surface-container);
}

.load-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--md-sys-color-outline-variant);
    padding: 8px 16px;
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
    border-radius: 9999px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: 16px auto;
    width: fit-content;
}

.load-more-btn:hover:not(:disabled) {
    background-color: var(--md-sys-color-surface-container-high);
}

.load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading-spinner {
    display: inline-flex;
    align-items: center;
}

.spin {
    animation: spin 1s linear infinite;
}

.footer {
    padding: 12px 16px;
    background-color: var(--md-sys-color-surface);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.close-reply {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    display: flex;
}

.input-field {
    display: grid;
    width: 100%;
}

.send-btn {
    width: 36px;
    height: 36px;
}
</style>
