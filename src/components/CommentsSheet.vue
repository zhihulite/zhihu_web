<script setup>
import { ref, watch } from 'vue';
import { f7 } from 'framework7-vue';
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
    },
    f7router: Object
});

const emit = defineEmits(['update:modelValue', 'reply']);

const handleUserClick = (userId) => {
    if (props.f7router) props.f7router.navigate(`/user/${userId}`);
};

const comments = ref([]);
const totalComments = ref(0);
const topResult = ref(null);
const topHasMore = ref(true);
const isLoading = ref(false);
const error = ref(null);
const sortOrder = ref('ts');

const replyTo = ref(null);
const replyCommentId = ref("");
const replyContent = ref('');

const expandedComment = ref(null);
const repliesViewLoading = ref(false);
const scrollPosition = ref(0);
const commentsContainerRef = ref(null);

const formatComment = (item) => {
    const id = item.id;
    const authorId = item.author?.id;
    const authorName = item.author?.name || "匿名用户";
    const authorAvatar = item.author?.avatar_url;
    const ipLocation = item.address_text || null;
    const content = convertLinksToOpenlink(item.content);
    const likeCount = item.vote_count || 0;
    const liked = item.liked;
    const disliked = item.disliked;
    const canDelete = item.can_delete;
    const createdTime = new Date(item.created_time * 1000).toLocaleDateString();
    const repliesCount = item.replies_count || item.child_comment_count || 0;
    const replyToAuthor = item.reply_to_author?.name || null;

    return {
        id,
        authorId,
        authorName,
        authorAvatar,
        ipLocation,
        content,
        likeCount,
        liked,
        disliked,
        canDelete,
        createdTime,
        repliesCount,
        replyToAuthor,
        childResult: null,
        childComments: [],
        childCommentsLoading: false,
        hasMore: true,
    };
};

const getApiType = (type) => {
    return `${type}s`;
};

const loadTopComments = async (loadMore = false) => {
    if (isLoading.value) return;

    isLoading.value = true;
    error.value = null;

    try {
        let res;
        if (loadMore && topResult.value) {
            res = await topResult.value.next();
        } else {
            const url =
                `https://api.zhihu.com/comment_v5/${getApiType(props.resourceType)}/${props.resourceId}/root_comment?limit=20&order_by=${sortOrder.value}`;
            res = await $http.get(url);
        }

        if (!res) {
            isLoading.value = false;
            return;
        }

        const rawList = res?.data || [];

        const formatted = rawList.map(formatComment);

        if (loadMore) {
            comments.value.push(...formatted);
        } else {
            comments.value = formatted;
            totalComments.value = res?.paging?.totals;
        }

        topHasMore.value = !res?.paging?.is_end;
        topResult.value = res;

    } catch (err) {
        console.error('Failed to load comments:', err);
        error.value = "评论加载失败";
    } finally {
        isLoading.value = false;
    }
};

const sendComment = async () => {
    if (!replyContent.value.trim()) {
        f7.dialog.alert("你还没输入喵");
        return;
    }

    let mytext = replyContent.value;
    // 替换回车换行符，防止 API 报错
    mytext = mytext.replace(/\r/g, "\\u000D").replace(/\n/g, "\\u000A");

    const postData = {
        comment_id: "",
        content: mytext,
        extra_params: "",
        has_img: false,
        reply_comment_id: String(replyCommentId.value || ""),
        score: 0,
        selected_settings: [],
        sticker_type: null,
        unfriendly_check: "strict"
    };

    const type = getApiType(props.resourceType);
    const url = `https://api.zhihu.com/comment_v5/${type}/${props.resourceId}/comment`;

    try {
        await $http.post(url, JSON.stringify(postData));
        f7.toast.show({
            text: "发送成功 如若想看到自己发言请刷新数据",
            position: 'center'
        });
        clearReply();
        loadTopComments();
    } catch (err) {
        console.error('Failed to send comment:', err);
    }
};

const openRepliesView = async (comment) => {
    // Record current scroll position
    if (commentsContainerRef.value) {
        scrollPosition.value = commentsContainerRef.value.scrollTop;
    }
    
    expandedComment.value = comment;

    if (comment.repliesCount > 0) {
        repliesViewLoading.value = true;
        await loadChildComments(comment);
        repliesViewLoading.value = false;
    }
};

const closeRepliesView = () => {
    if (expandedComment.value) {
        expandedComment.value.childComments = [];
    }
    
    // Restore scroll position after DOM updates
    setTimeout(() => {
        if (commentsContainerRef.value) {
            commentsContainerRef.value.scrollTop = scrollPosition.value;
        }
    }, 0);
    
    expandedComment.value = null;
};

const loadChildComments = async (parentComment, loadMore = false) => {
    if (parentComment.childCommentsLoading) return;

    parentComment.childCommentsLoading = true;

    try {
        let result;
        if (loadMore && parentComment.childResult) {
            result = await parentComment.childResult.next();
        } else {
            const url = `https://api.zhihu.com/comment_v5/comment/${parentComment.id}/child_comment?limit=20&order_by=ts`;
            result = await $http.get(url);
        }

        if (!result) {
            parentComment.childCommentsLoading = false;
            return;
        }

        const formatted = result.data.map(formatComment);

        if (loadMore) {
            parentComment.childComments.push(...formatted);
        } else {
            parentComment.childComments = formatted;
        }

        parentComment.hasMore = !result.paging?.is_end;
        parentComment.childResult = result;

    } catch (err) {
        console.error('Failed to load child comments:', err);
    } finally {
        parentComment.childCommentsLoading = false;
    }
};

const handleClose = () => {
    emit('update:modelValue', false);
};

const handleReply = (comment) => {
    const idStr = String(comment.id);
    if (replyCommentId.value === idStr) {
        clearReply();
    } else {
        replyTo.value = comment.authorName;
        replyCommentId.value = idStr;
        replyContent.value = '';
    }
};

const deleteComment = async (commentId) => {
    f7.dialog.confirm("确定要删除这条评论吗？", async () => {
        try {
            const url = `https://api.zhihu.com/comment_v5/comment/${commentId}`;
            await $http.delete(url);
            f7.toast.show({
                text: "删除成功",
                position: 'center'
            });
            // Refresh comments
            if (expandedComment.value && (expandedComment.value.id === commentId || expandedComment.value.childComments.some(c =>
                c.id === commentId))) {
                if (expandedComment.value.id === commentId) {
                    closeRepliesView();
                    loadTopComments();
                } else {
                    loadChildComments(expandedComment.value);
                }
            } else {
                loadTopComments();
            }
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    });
};

const toggleLike = async (comment) => {
    const url = `https://api.zhihu.com/comment_v5/comment/${comment.id}/reaction/like`;
    try {
        if (!comment.liked) {
            await $http.put(url, '');
            comment.likeCount++;
            comment.liked = true;
        } else {
            await $http.delete(url);
            comment.likeCount--;
            comment.liked = false;
        }
    } catch (err) {
        console.error('Failed to toggle like:', err);
    }
};

const toggleDislike = async (comment) => {
    const url = `https://api.zhihu.com/comment_v5/comment/${comment.id}/reaction/dislike`;
    try {
        if (!comment.disliked) {
            await $http.put(url, '');
            comment.disliked = true;
        } else {
            await $http.delete(url);
            comment.disliked = false;
        }
    } catch (err) {
        console.error('Failed to toggle dislike:', err);
    }
};

const clearReply = () => {
    replyTo.value = null;
    replyCommentId.value = "";
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
        replyCommentId.value = "";
        replyContent.value = '';

        if (props.resourceType && props.resourceId) {
            loadTopComments();
        }
    }
});

watch(sortOrder, () => {
    if (props.modelValue) {
        comments.value = [];
        topResult.value = null;
        loadTopComments();
    }
});


const convertLinksToOpenlink = function (html) {
    if (typeof html !== 'string') return html;

    return html.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
        // 提取原始的 href 值
        const hrefMatch = attrs.match(/href\s*=\s*(["'])(.*?)\1/i);
        if (!hrefMatch) return match;

        const originalUrl = hrefMatch[2];

        // 移除 target 和 rel 属性
        let newAttrs = attrs
            .replace(/\s*target\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s+rel\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s+class\s*=\s*["'][^"']*["']/gi, '');

        // 替换 href
        newAttrs = newAttrs.replace(
            /href\s*=\s*(["']).*?\1/i,
            `href="javascript:$openLink('${originalUrl}')"`
        );

        return `<a ${newAttrs}>`;
    });
};
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
                    <span class="title">评论回复 ({{ expandedComment.repliesCount }})</span>
                </div>
                <div v-else class="header-left display-flex align-items-center">
                    <span class="title">{{ totalComments }} 条评论</span>
                    <div class="sort-selector margin-left">
                        <f7-link :class="{ 'active-sort': sortOrder === 'ts' }" @click="sortOrder = 'ts'">按时间</f7-link>
                        <span class="divider">/</span>
                        <f7-link :class="{ 'active-sort': sortOrder === 'score' }"
                            @click="sortOrder = 'score'">按热度</f7-link>
                    </div>
                </div>

                <f7-link icon-only @click="handleClose">
                    <f7-icon ios="f7:multiply" md="material:close" />
                </f7-link>
            </div>

            <div class="page-content" ref="commentsContainerRef" style="flex: 1; overflow-y: auto;">
                <!-- Replies View -->
                <div v-if="expandedComment" class="replies-view">
                    <!-- Simplified logic to show main comment and replies -->
                    <div class="comment-item main-comment">
                        <!-- ... logic remains similar but using divs ... -->
                        <div class="display-flex padding">
                            <f7-link @click="handleUserClick(expandedComment.authorId)" class="no-padding">
                                <img :src="expandedComment.authorAvatar" class="avatar" />
                            </f7-link>
                            <div class="margin-left flex-1">
                                <f7-link @click="handleUserClick(expandedComment.authorId)"
                                    class="comment-author-link font-weight-bold">{{ expandedComment.authorName
                                    }}</f7-link>
                                <div class="comment-content" v-html="expandedComment.content"></div>
                            </div>
                        </div>
                    </div>
                    <div class="padding">全部回复</div>
                    <div class="list media-list no-hairlines-md">
                        <ul>
                            <li v-for="reply in expandedComment.childComments" :key="reply.id">
                                <div class="item-content">
                                    <div class="item-media">
                                        <f7-link @click="handleUserClick(reply.authorId)" class="no-padding">
                                            <img :src="reply.authorAvatar" class="avatar small" />
                                        </f7-link>
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <f7-link @click="handleUserClick(reply.authorId)"
                                                class="item-title comment-author-link">{{ reply.authorName }}</f7-link>
                                            <div class="item-after">{{ reply.createdTime }}</div>
                                        </div>
                                        <div class="item-text" v-html="reply.content"></div>
                                        <div class="item-footer display-flex align-items-center margin-top-half">
                                            <f7-link small @click="toggleLike(reply)" class="margin-right"
                                                :class="{ 'text-color-primary': reply.liked }">
                                                <f7-icon
                                                    :ios="reply.liked ? 'f7:hand_thumbsup_fill' : 'f7:hand_thumbsup'"
                                                    :md="reply.liked ? 'material:thumb_up' : 'material:thumb_up_off_alt'"
                                                    size="14" /> {{ reply.likeCount }}
                                            </f7-link>
                                            <f7-link small @click="toggleDislike(reply)" class="margin-right"
                                                :class="{ 'text-color-primary': reply.disliked }">
                                                <f7-icon
                                                    :ios="reply.disliked ? 'f7:hand_thumbsdown_fill' : 'f7:hand_thumbsdown'"
                                                    :md="reply.disliked ? 'material:thumb_down' : 'material:thumb_down_off_alt'"
                                                    size="14" />
                                            </f7-link>
                                            <f7-link small @click="handleReply(reply)" class="margin-right"
                                                :class="{ 'text-color-primary': replyCommentId === String(reply.id) }">
                                                回复
                                            </f7-link>
                                            <f7-link small v-if="reply.can_delete" color="red"
                                                @click="deleteComment(reply.id)">删除</f7-link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div class="padding text-align-center" v-if="expandedComment.hasMore">
                            <f7-button small outline @click="loadChildComments(expandedComment, true)"
                                :loading="expandedComment.childCommentsLoading">加载更多回复</f7-button>
                        </div>
                        <div v-else-if="expandedComment.childComments.length > 0"
                            class="padding text-align-center text-color-gray font-size-12">
                            已加载全部回复
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
                                        <f7-link @click="handleUserClick(comment.authorId)" class="no-padding">
                                            <img :src="comment.authorAvatar" class="avatar" />
                                        </f7-link>
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <f7-link @click="handleUserClick(comment.authorId)"
                                                class="item-title comment-author-link">{{ comment.authorName
                                                }}</f7-link>
                                            <div class="item-after">{{ comment.createdTime }}</div>
                                        </div>
                                        <div class="item-text" v-html="comment.content"></div>
                                        <div class="item-footer display-flex align-items-center margin-top-half">
                                            <f7-link small @click="toggleLike(comment)" class="margin-right"
                                                :class="{ 'text-color-primary': comment.liked }">
                                                <f7-icon
                                                    :ios="comment.liked ? 'f7:hand_thumbsup_fill' : 'f7:hand_thumbsup'"
                                                    :md="comment.liked ? 'material:thumb_up' : 'material:thumb_up_off_alt'"
                                                    size="14" /> {{ comment.likeCount }}
                                            </f7-link>
                                            <f7-link small @click="toggleDislike(comment)" class="margin-right"
                                                :class="{ 'text-color-primary': comment.disliked }">
                                                <f7-icon
                                                    :ios="comment.disliked ? 'f7:hand_thumbsdown_fill' : 'f7:hand_thumbsdown'"
                                                    :md="comment.disliked ? 'material:thumb_down' : 'material:thumb_down_off_alt'"
                                                    size="14" />
                                            </f7-link>
                                            <f7-link small @click="handleReply(comment)" class="margin-right"
                                                :class="{ 'text-color-primary': replyCommentId === String(comment.id) }">
                                                回复
                                            </f7-link>
                                            <f7-link small v-if="comment.canDelete" color="red" class="margin-right"
                                                @click="deleteComment(comment.id)">删除</f7-link>
                                            <f7-link small v-if="comment.repliesCount > 0"
                                                @click="openRepliesView(comment)">查看 {{ comment.repliesCount }} 条回复
                                                <f7-icon ios="f7:chevron_right" md="material:chevron_right" size="14" />
                                            </f7-link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div class="padding text-align-center" v-if="topHasMore">
                            <f7-button outline @click="loadTopComments(true)" :loading="isLoading">加载更多评论</f7-button>
                        </div>
                        <div v-else class="padding text-align-center text-color-gray font-size-12">
                            已加载全部评论
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Input -->
            <div class="footer padding display-flex align-items-center bg-color-white"
                style="border-top: 1px solid rgba(0,0,0,0.1)">
                <input type="text" v-model="replyContent" :placeholder="replyTo ? `回复 ${replyTo}...` : '说点什么...'"
                    @keyup.enter="sendComment"
                    style="flex:1; padding: 10px; border-radius: 20px; border: 1px solid #ccc; margin-right: 8px;">
                <f7-link icon-only class="color-primary" @click="sendComment">
                    <f7-icon ios="f7:paperplane_fill" md="material:send" />
                </f7-link>
            </div>
        </div>
    </f7-sheet>
</template>

<style scoped>
.comments-sheet {
    max-width: 600px;
    left: 0 !important;
    right: 0 !important;
    margin: 0 auto !important;
    width: 100%;
}

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

.sort-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: normal;
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

.item-text {
    color: var(--f7-text-color);
    margin-top: 4px;
}

.item-text :deep(p),
.comment-content :deep(p) {
    margin: 0;
    display: inline;
}

.comment-author-link {
    text-decoration: none;
    color: inherit;
}

.list .item-text {
    max-height: none !important;
    -webkit-line-clamp: unset !important;
}
</style>
