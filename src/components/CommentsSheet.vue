<script setup>
import { ref, watch } from 'vue';

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
    <f7-sheet class="comments-sheet" :opened="modelValue" @sheet:closed="handleClose"
        style="height: 90vh; border-radius: 24px 24px 0 0;" swipe-to-close backdrop>
        <div class="sheet-modal-inner" style="height: 100%; display: flex; flex-direction: column;">
            <!-- Header -->
            <div class="header">
                <div v-if="expandedComment" class="header-left">
                    <f7-link icon-only @click="closeRepliesView">
                        <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                    </f7-link>
                    <span class="title">评论回复 ({{ expandedComment.replies_count }})</span>
                </div>
                <div v-else class="header-left">
                    <span class="title">{{ totalComments }} 条评论</span>
                </div>

                <f7-link icon-only @click="handleClose">
                    <f7-icon ios="f7:multiply" md="material:close" />
                </f7-link>
            </div>

            <div class="page-content" style="flex: 1; overflow-y: auto;">
                <!-- Replies View -->
                <div v-if="expandedComment" class="replies-view">
                    <!-- Simplified logic to show main comment and replies -->
                    <div class="comment-item main-comment">
                        <!-- ... logic remains similar but using divs ... -->
                        <div class="display-flex padding">
                            <img :src="expandedComment.author_avatar" class="avatar" />
                            <div class="margin-left flex-1">
                                <div class="font-weight-bold">{{ expandedComment.author_name }}</div>
                                <p>{{ expandedComment.content }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="padding">全部回复</div>
                    <div class="list media-list no-hairlines-md">
                        <ul>
                            <li v-for="reply in expandedComment.child_comments" :key="reply.id">
                                <div class="item-content">
                                    <div class="item-media">
                                        <img :src="reply.author_avatar" class="avatar small" />
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <div class="item-title">{{ reply.author_name }}</div>
                                            <div class="item-after">{{ reply.created_time }}</div>
                                        </div>
                                        <div class="item-text">{{ reply.content }}</div>
                                        <div
                                            class="item-footer display-flex justify-content-space-between margin-top-half">
                                            <f7-link small @click="emit('like', reply.id)">
                                                <f7-icon ios="f7:hand_thumbsup" md="material:thumb_up" size="14" /> {{
                                                reply.like_count }}
                                            </f7-link>
                                            <f7-link small @click="handleReply(reply)">回复</f7-link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div class="padding text-align-center" v-if="expandedComment.child_result?.paging?.next">
                            <f7-button small outline @click="loadChildComments(expandedComment, true)"
                                :loading="expandedComment.child_comments_loading">加载更多回复</f7-button>
                        </div>
                    </div>
                </div>

                <!-- Top Level Comments -->
                <div v-else>
                    <div v-if="isLoading && comments.length === 0" class="padding text-align-center">
                        <f7-preloader /> 正在加载...
                    </div>
                    <div v-else-if="comments.length === 0" class="padding text-align-center text-color-gray">
                        暂无评论
                    </div>
                    <div v-else class="list media-list no-hairlines-md">
                        <ul>
                            <li v-for="comment in comments" :key="comment.id">
                                <div class="item-content">
                                    <div class="item-media">
                                        <img :src="comment.author_avatar" class="avatar" />
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <div class="item-title">{{ comment.author_name }}</div>
                                            <div class="item-after">{{ comment.created_time }}</div>
                                        </div>
                                        <div class="item-text">{{ comment.content }}</div>
                                        <div class="item-footer display-flex align-items-center margin-top-half">
                                            <f7-link small @click="emit('like', comment.id)" class="margin-right">
                                                <f7-icon ios="f7:hand_thumbsup" md="material:thumb_up" size="14" /> {{
                                                comment.like_count }}
                                            </f7-link>
                                            <f7-link small @click="handleReply(comment)"
                                                class="margin-right">回复</f7-link>
                                            <f7-link small v-if="comment.replies_count > 0"
                                                @click="openRepliesView(comment)">查看 {{ comment.replies_count }} 条回复
                                                <f7-icon ios="f7:chevron_right" md="material:chevron_right" size="14" />
                                            </f7-link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div class="padding text-align-center" v-if="topResult?.paging?.next">
                            <f7-button outline @click="loadTopComments(true)" :loading="isLoading">加载更多评论</f7-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Input -->
            <div class="footer padding display-flex align-items-center bg-color-white"
                style="border-top: 1px solid rgba(0,0,0,0.1)">
                <input type="text" v-model="replyContent" :placeholder="replyTo ? `回复 ${replyTo}...` : '说点什么...'"
                    style="flex:1; padding: 10px; border-radius: 20px; border: 1px solid #ccc; margin-right: 8px;">
                <f7-link icon-only class="color-primary">
                    <f7-icon ios="f7:paperplane_fill" md="material:send" />
                </f7-link>
            </div>
        </div>
    </f7-sheet>
</template>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    font-size: 1.1em;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar.small {
    width: 30px;
    height: 30px;
}

.item-text {
    color: var(--f7-text-color);
    margin-top: 4px;
}
</style>
