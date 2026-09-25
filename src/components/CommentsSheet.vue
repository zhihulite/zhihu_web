<script setup>
// src/components/CommentsSheet.vue
// 评论弹层：顶层评论分页 + 回复子视图 + 输入栏（图片/表情/@，输入区见 EmoticonEditor）。
import { ref, watch, onMounted, computed } from 'vue';
import { destroyOnClosed } from '@/utils/modal.js';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { openLink } from '@/core/navigation.js';
import { blockUser } from '@/composables/useBlockToggle.js';
import { requireLogin } from '@/composables/userManager.js';
import { copyText, shareText } from '@/utils/share.js';
import { formatRelativeTime } from '@/utils/format.js';
import PhotoBrowser from '@/components/PhotoBrowser.vue';
import CommentItem from '@/components/CommentItem.vue';
import AtUserSheet from '@/components/AtUserSheet.vue';
import EmoticonEditor from '@/components/EmoticonEditor.vue';
import { useCommentRichText } from '@/composables/useCommentRichText.js';
import { imageAnchorHtml } from '@/utils/comment-content.js';
import { loadEmoticons, injectEmoticons, emoticonStickers } from '@/services/emoticon.js';
import { uploadImage } from '@/services/upload.js';

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
    // 子评论弹层专用：上一层点开的那条评论，前置在列表首位当根评论
    rootComment: Object,
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

// 表情面板 / 图片上传
const showEmojiPanel = ref(false);
const imageInputRef = ref(null);
const pendingImage = ref(null);
const uploadingImage = ref(false);
const uploadProgress = ref(0);
const isSending = ref(false);
const photoBrowserRef = ref(null);

// @用户 与 URL→链接卡片：输入区存字面量，发送时换成锚点 HTML
const showAtSheet = ref(false);
const editorRef = ref(null);
// 由正文里的 '@' 打开选人面板时记下其偏移，选中后 @昵称 顶替这个 '@'
const atTrigger = ref(null);
const {
    mentions, linkCards, addMention, convertUrlAtCaret, buildContent, reset: resetRichText,
} = useCommentRichText(replyContent, editorRef);

// 输入区里要整块着色、整块删除的字面量：与发送时换成锚点的账本同源
const editorTokens = computed(() => [
    ...mentions.value.map((m) => ({ text: `@${m.name} `, kind: 'mention' })),
    ...linkCards.value.map((c) => ({ text: c.title, kind: 'link' })),
]);

const openAtSheet = () => {
    if (!requireLogin()) return;
    showAtSheet.value = true;
};

const onAtTrigger = (offset) => {
    if (!requireLogin()) return;
    atTrigger.value = offset;
    showAtSheet.value = true;
};

const onPickUser = (user) => {
    const trigger = atTrigger.value;
    atTrigger.value = null;
    addMention(user, trigger);
};

watch(showAtSheet, (opened) => {
    if (!opened) atTrigger.value = null;
});

const onEditorInput = () => convertUrlAtCaret(editorRef.value?.$el);

// 评论缩略图统一交给图片查看器放大
const openCommentImage = (url) => photoBrowserRef.value?.open([url], 0);

// 子评论视图：再开一层本组件（resourceType='comment'），取数走 comment/{id}/child_comment。
// 上一层传进来的根评论前置在列表首位；父卡片的内联预览那份数组只读，不会被这里改写。
const isReplySheet = computed(() => props.resourceType === 'comment');
const showReplySheet = ref(false);
const replyTarget = ref(null);

const openReplies = (comment) => {
    if (isReplySheet.value) {
        f7.toast.show({ text: '当前已在当前回复中', closeTimeout: 1500 });
        return;
    }
    replyTarget.value = comment;
    showReplySheet.value = true;
};

const listWithRoot = computed(() => (isReplySheet.value && props.rootComment)
    ? [props.rootComment, ...comments.value]
    : comments.value);

const headerTitle = computed(() => isReplySheet.value ? '评论回复' : `${totalComments.value} 条评论`);

// 评论最多带一个附件锚点（[贴图名] 或 查看图片/动图）：先抽出独立缩略图，余下文本再走表情/链接处理
const extractAttachment = (raw) => {
    const text = raw || '';
    const match = text.match(/<a[^>]*>(?:\[[^\]]*\]|查看[^<]*)<\/a>/);
    const href = match && match[0].match(/href="([^"]+)"/)?.[1];
    if (!href) return { content: text, imageUrl: null };
    return { content: text.replace(match[0], ''), imageUrl: href };
};

const formatComment = (item) => {
    const attachment = extractAttachment(item.content);

    let authorName = item.author?.name || "匿名用户";
    if (item.author_tag?.[0]?.text) authorName += `「${item.author_tag[0].text}」`;
    if (item.reply_to_author?.name) {
        authorName += ` -> ${item.reply_to_author.name}`;
        if (item.reply_author_tag?.[0]?.text) authorName += `「${item.reply_author_tag[0].text}」`;
    }

    const createdTime = formatRelativeTime(item.created_time);
    const ipLocation = item.address_text || null;
    // 根评论响应内联返回部分子评论，先展示这些
    const childComments = (item.child_comments || []).map(formatComment);

    return {
        id: String(item.id),
        authorId: item.author?.id,
        authorName,
        authorAvatar: item.author?.avatar_url,
        ipLocation,
        content: injectEmoticons(convertLinksToOpenlink(attachment.content)),
        imageUrl: attachment.imageUrl,
        likeCount: item.like_count ?? item.vote_count ?? 0,
        liked: item.liked,
        disliked: item.disliked,
        canDelete: item.can_delete,
        createdTime,
        repliesCount: item.replies_count || item.child_comment_count || 0,
        childComments,
    };
};

const getApiType = (type) => {
    return `${type}s`;
};

// 子评论列表固定按时间序，顶层列表才跟随排序切换
const listUrl = () => isReplySheet.value
    ? `https://api.zhihu.com/comment_v5/comment/${props.resourceId}/child_comment?limit=20&order_by=ts`
    : `https://api.zhihu.com/comment_v5/${getApiType(props.resourceType)}/${props.resourceId}/root_comment?limit=20&order_by=${sortOrder.value}`;

// 重取代号：排序切换/发送后的重取要抢下这一轮，在途的旧结果回来后按代号丢弃
let topAttempt = 0;

const loadTopComments = async (loadMore = false) => {
    if (loadMore && isLoading.value) return;

    const attempt = ++topAttempt;
    isLoading.value = true;
    error.value = null;
    // 表情库晚于首页评论返回时，这批 [名称] 会永久停在字面量：格式化前先等它
    await loadEmoticons();

    try {
        let res;
        if (loadMore && topResult.value) {
            res = await topResult.value.next();
        } else {
            res = await $http.get(listUrl());
        }

        if (attempt !== topAttempt) return;
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
            // totals 缺省时保留原计数，否则标题会渲染成「 条评论」
            const totals = Number(res?.paging?.totals);
            if (Number.isFinite(totals)) totalComments.value = totals;
        }

        topHasMore.value = !res?.paging?.is_end;
        topResult.value = res;

    } catch (err) {
        if (attempt !== topAttempt) return;
        console.error('Failed to load comments:', err);
        error.value = "评论加载失败";
    } finally {
        if (attempt === topAttempt) isLoading.value = false;
    }
};

const sendComment = async () => {
    if (!requireLogin()) return;
    if (isSending.value) return;
    if (uploadingImage.value) {
        f7.toast.show({ text: '图片上传中，请稍候' });
        return;
    }
    if (!replyContent.value.trim() && !pendingImage.value) {
        f7.dialog.alert("你还没输入喵");
        return;
    }

    let mytext = buildContent();
    // 替换回车换行符，防止 API 报错
    mytext = mytext.replace(/\r/g, "\\u000D").replace(/\n/g, "\\u000A");

    // 附带图片：拼成知乎评论的图片锚点
    if (pendingImage.value) {
        mytext += imageAnchorHtml(pendingImage.value);
    }

    const postData = {
        comment_id: "",
        content: mytext,
        extra_params: "",
        has_img: !!pendingImage.value,
        reply_comment_id: String(replyCommentId.value || ""),
        score: 0,
        selected_settings: [],
        sticker_type: null,
        unfriendly_check: "strict"
    };

    const type = getApiType(props.resourceType);
    // 写操作（发/删评论）走 web 端点 www.zhihu.com/api/v4，读与互动走 api.zhihu.com
    const url = `https://www.zhihu.com/api/v4/comment_v5/${type}/${props.resourceId}/comment`;

    isSending.value = true;
    try {
        await $http.post(url, JSON.stringify(postData));
        f7.toast.show({
            text: "发送成功 如若想看到自己发言请刷新数据",
            position: 'center'
        });
        clearReply();
        pendingImage.value = null;
        showEmojiPanel.value = false;
        loadTopComments();
    } catch (err) {
        console.error('Failed to send comment:', err);
        f7.toast.show({ text: err.message || '发送失败', position: 'center' });
    } finally {
        isSending.value = false;
    }
};

// 表情面板：点表情在光标处插入 [名称]，输入区内就地画成表情图（清单见 services/emoticon.js）

const toggleEmojiPanel = () => {
    showEmojiPanel.value = !showEmojiPanel.value;
    if (showEmojiPanel.value) loadEmoticons();
};

const insertEmoticon = (placeholder) => {
    editorRef.value?.insertText(placeholder);
};

// 选图上传
const pickImage = () => imageInputRef.value?.click();

const onImagePicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    uploadingImage.value = true;
    uploadProgress.value = 0;
    uploadController?.abort();
    uploadController = new AbortController();
    try {
        const result = await uploadImage(file, (r) => { uploadProgress.value = r; }, uploadController.signal);
        if (result) pendingImage.value = result;
        else f7.toast.show({ text: '图片上传失败' });
    } catch (err) {
        if (err?.name !== 'AbortError') {
            console.error('上传失败', err);
            f7.toast.show({ text: err.message || '图片上传失败' });
        }
    } finally {
        uploadingImage.value = false;
    }
};

// 关闭弹层后上传没必要继续跑，占着请求与进度状态
let uploadController = null;

const removePendingImage = () => { pendingImage.value = null; };

// infinite 触底续拉本页评论
const onTopInfinite = () => {
    if (!topHasMore.value || isLoading.value) return;
    loadTopComments(true);
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
        // 换回复对象等于重起一段正文：不清富文本节点的话，上一次的 @ 与链接卡片会被拼进来
        resetRichText();
        replyContent.value = '';
    }
};

const deleteComment = async (commentId) => {
    f7.dialog.confirm("确定要删除这条评论吗？", async () => {
        try {
            const url = `https://www.zhihu.com/api/v4/comment_v5/comment/${commentId}`;
            await $http.delete(url);
            f7.toast.show({
                text: "删除成功",
                position: 'center'
            });
            // Refresh comments
            loadTopComments();
        } catch (err) {
            console.error('Failed to delete comment:', err);
            f7.toast.show({ text: err.message || '删除失败', position: 'center' });
        }
    });
};

// 同一条评论的点赞/点踩在途时短路：请求未回的窗口内连点会各发一次，本地计数与服务端脱节
const reactionPending = new Set();
const beginReaction = (comment) => {
    if (reactionPending.has(comment.id)) return false;
    reactionPending.add(comment.id);
    return true;
};

const toggleLike = async (comment) => {
    if (!beginReaction(comment)) return;
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
        f7.toast.show({ text: err.message || '操作失败', position: 'center' });
    } finally {
        reactionPending.delete(comment.id);
    }
};

const toggleDislike = async (comment) => {
    if (!beginReaction(comment)) return;
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
        f7.toast.show({ text: err.message || '操作失败', position: 'center' });
    } finally {
        reactionPending.delete(comment.id);
    }
};

const clearReply = () => {
    replyTo.value = null;
    replyCommentId.value = "";
    replyContent.value = '';
    resetRichText();
};

// 评论 HTML 转纯文本：去掉表情 img 等标签
const commentPlainText = (comment) => {
    const div = document.createElement('div');
    div.innerHTML = comment.content || '';
    return (div.textContent || '').trim();
};

// 屏蔽作者（确认后拉黑）
const blockCommentAuthor = (comment) => {
    if (!requireLogin()) return;
    f7.dialog.confirm('确定拉黑该用户吗？', async () => {
        try {
            await blockUser(comment.authorId);
            f7.toast.show({ text: '已拉黑', position: 'center' });
        } catch (err) {
            console.error('Failed to block user:', err);
            f7.toast.show({ text: '操作失败' });
        }
    });
};

const reportComment = (comment) => {
    openLink(`https://www.zhihu.com/report?id=${comment.id}&type=comment&source=android&ab_signature=`);
};

// 评论「更多操作」菜单
const openCommentMenu = (comment) => {
    const menu = f7.actions.create({
        buttons: [
            [
                { text: '刷新', onClick: () => loadTopComments() },
                { text: '分享', onClick: () => shareText(commentPlainText(comment)) },
                { text: '复制', onClick: async () => {
                    f7.toast.show({ text: await copyText(commentPlainText(comment)) ? '复制成功' : '复制失败', closeTimeout: 1500 });
                } },
                { text: '举报', onClick: () => reportComment(comment) },
                { text: '屏蔽用户', onClick: () => blockCommentAuthor(comment) },
                { text: '查看主页', onClick: () => handleUserClick(comment.authorId) },
            ],
            [{ text: '取消', color: 'red' }],
        ],
    });
    destroyOnClosed(menu).open();
};

// 每次打开都从干净状态起：子评论弹层挂载时就是打开态，所以挂载与置为打开两处都要走这里
const resetAndLoad = () => {
    comments.value = [];
    totalComments.value = 0;
    topResult.value = null;
    error.value = null;
    showReplySheet.value = false;
    replyTarget.value = null;
    clearReply();
    uploadController?.abort();
    pendingImage.value = null;
    showEmojiPanel.value = false;
    topHasMore.value = true;

    if (props.resourceType && props.resourceId) {
        loadTopComments();
    }
};

onMounted(() => {
    loadEmoticons();
    if (props.modelValue) resetAndLoad();
});

watch(() => props.modelValue, (opened) => {
    if (opened) resetAndLoad();
});

watch(sortOrder, () => {
    if (props.modelValue && !isReplySheet.value) {
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
    <f7-sheet class="sheet-bottom" :opened="modelValue" @sheet:closed="handleClose"
        style="height: 90vh;" swipe-to-close backdrop>
        <div class="sheet-modal-inner">
            <!-- Header：子评论弹层只有标题与关闭（子评论固定按时间序，不给排序入口） -->
            <div class="sheet-header">
                <div class="header-left display-flex align-items-center">
                    <span class="title">{{ headerTitle }}</span>
                    <div v-if="!isReplySheet" class="sort-selector margin-left">
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

            <f7-page-content infinite @infinite="onTopInfinite"
                class="sheet-scroll-body">
                <div v-if="isLoading && comments.length === 0" class="padding text-align-center">
                    <f7-preloader /> 正在加载...
                </div>
                <div v-else-if="comments.length === 0" class="padding text-align-center text-color-gray">
                    暂无评论
                </div>
                <div v-else class="list media-list no-hairlines-md">
                    <ul>
                        <li v-for="comment in listWithRoot" :key="comment.id">
                            <CommentItem :comment="comment"
                                :reply-active="replyCommentId === String(comment.id)" @user="handleUserClick"
                                @like="toggleLike" @dislike="toggleDislike" @reply="handleReply"
                                @delete="deleteComment" @menu="openCommentMenu" @image="openCommentImage">
                                <!-- 回复数多于内联返回的条数时才给入口 -->
                                <f7-link v-if="comment.repliesCount > comment.childComments.length"
                                    class="more-replies" @click="openReplies(comment)">
                                    查看全部{{ comment.repliesCount }}条回复
                                </f7-link>
                                <f7-link v-else-if="comment.repliesCount > 0" class="more-replies"
                                    @click="openReplies(comment)">查看回复</f7-link>

                                <template #children>
                                    <!-- 内联子评论：缩进对齐父评论正文，一行头像 + 昵称 + 正文 + 时间/点赞 -->
                                    <div v-if="comment.childComments.length > 0" class="child-list">
                                        <div v-for="reply in comment.childComments" :key="reply.id" class="child-row"
                                            @click="openReplies(comment)">
                                            <img :src="reply.authorAvatar" class="child-avatar" />
                                            <div class="child-body">
                                                <div class="child-name">{{ reply.authorName }}</div>
                                                <div class="child-content" v-html="reply.content"></div>
                                                <img v-if="reply.imageUrl" :src="reply.imageUrl" class="comment-image"
                                                    @click.stop="openCommentImage(reply.imageUrl)" />
                                                <div class="child-meta">
                                                    <span>{{ reply.createdTime
                                                        }}{{ reply.ipLocation ? ` · ${reply.ipLocation}` : '' }}</span>
                                                    <span class="child-like">
                                                        <f7-icon ios="f7:hand_thumbsup"
                                                            md="material:thumb_up_off_alt" size="14" />
                                                        {{ reply.likeCount }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </CommentItem>
                        </li>
                    </ul>
                    <div v-if="!topHasMore" class="padding text-align-center text-color-gray font-size-12">
                        已加载全部评论
                    </div>
                </div>
            </f7-page-content>

            <!-- 输入栏：沿用 messagebar 的类名骨架，输入区换成能内联画表情的 contenteditable -->
            <div class="toolbar messagebar comment-messagebar"
                :class="{ 'messagebar-sheet-visible': showEmojiPanel, 'messagebar-attachments-visible': !!pendingImage || uploadingImage }">
                <div class="toolbar-inner">
                    <div class="messagebar-area">
                        <div v-if="uploadingImage" class="uploading-text font-size-12">
                            图片上传中 {{ Math.round(uploadProgress * 100) }}%
                        </div>
                        <f7-messagebar-attachments>
                            <f7-messagebar-attachment v-if="pendingImage" :image="pendingImage.url" deletable
                                @attachment:delete="removePendingImage" />
                        </f7-messagebar-attachments>
                        <EmoticonEditor ref="editorRef" v-model="replyContent" :tokens="editorTokens"
                            :placeholder="replyTo ? `回复 ${replyTo}...` : '说点什么...'" @input="onEditorInput"
                            @at="onAtTrigger" />
                        <div class="messagebar-icons">
                            <f7-link icon-only @click="toggleEmojiPanel" :class="{ 'color-primary': showEmojiPanel }">
                                <f7-icon ios="f7:smiley" md="material:emoji_emotions" />
                            </f7-link>
                            <f7-link icon-only @click="pickImage">
                                <f7-icon ios="f7:photo" md="material:image" />
                            </f7-link>
                            <f7-link icon-only @click="openAtSheet">
                                <f7-icon ios="f7:at" md="material:alternate_email" />
                            </f7-link>
                            <input ref="imageInputRef" type="file" accept="image/*" style="display:none"
                                @change="onImagePicked">
                        </div>
                    </div>
                    <div class="toolbar-pane">
                        <f7-link icon-only @click="sendComment">
                            <f7-icon ios="f7:arrow_up_circle_fill" md="material:send" class="color-primary" />
                        </f7-link>
                    </div>
                </div>
                <div class="messagebar-sheet emoji-sheet">
                    <div class="emoji-grid">
                        <img v-for="s in emoticonStickers" :key="s.placeholder" :src="s.static_image_url"
                            :alt="s.title" :title="s.placeholder" class="emoji-cell"
                            @click="insertEmoticon(s.placeholder)" />
                    </div>
                    <p v-if="!emoticonStickers.length" class="emoji-empty">表情库没加载出来，可以直接输入文字。</p>
                </div>
            </div>
        </div>
    </f7-sheet>
    <PhotoBrowser ref="photoBrowserRef" />
    <AtUserSheet v-model="showAtSheet" @select="onPickUser" />
    <!-- 子评论弹层：再开一层本组件，关掉即销毁（自己的分页与输入状态随之释放） -->
    <CommentsSheet v-if="showReplySheet && replyTarget" v-model="showReplySheet" resource-type="comment"
        :resource-id="replyTarget.id" :root-comment="replyTarget" :f7router="f7router" />
</template>

<style scoped>
/* messagebar 的内边距默认 0，输入框会贴到弹层左右边缘；按弹层内容口径留 16px */
.comment-messagebar {
    --f7-messagebar-inner-padding-left: 16px;
    --f7-messagebar-inner-padding-right: 16px;
}

.messagebar-icons {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    flex-shrink: 0;
}

/* F7 把 .messagebar-sheet 定成 flex 列向换行、把 .messagebar-sheet-item 定成 92×84 的方格，
   那是选图用的契约；表情要的是密排网格，所以直接改 sheet 自身的布局，不再套 sheet-item */
.emoji-sheet {
    display: block;
    overflow-y: auto;
    padding: 8px 12px;
}

/* 待发送图与输入框拼成同一张卡片：附件条出上圆角，输入框跟着去掉上圆角；
   缩略图收小并把删除角标挪进图内（.messagebar-area 是 overflow:hidden，角标外挑会被裁掉） */
.comment-messagebar :deep(.messagebar-attachments) {
    padding: 8px 8px 0;
}

.comment-messagebar :deep(.messagebar-attachment),
.comment-messagebar :deep(.messagebar-attachment img) {
    height: 56px;
    width: 56px;
    border-radius: 12px;
}

.comment-messagebar :deep(.messagebar-attachment-delete) {
    height: 20px;
    width: 20px;
    right: 4px;
    top: 4px;
}

.comment-messagebar :deep(.messagebar-attachment-delete::after),
.comment-messagebar :deep(.messagebar-attachment-delete::before) {
    height: 2px;
    width: 10px;
    margin-left: -5px;
    margin-top: -1px;
}

.messagebar-attachments-visible .emoticon-editor {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.emoji-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 8px;
}

.emoji-cell {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
    cursor: pointer;
    border-radius: 8px;
}

.emoji-cell:active {
    background-color: rgba(var(--f7-theme-color-rgb), .15);
}

.emoji-empty {
    font-size: 13px;
    color: var(--app-sub-text);
    padding: 8px 0;
}

.uploading-text {
    padding: 6px 12px 0;
}

/* 「查看全部N条回复」：主题色整行，与评论正文同一起始线 */
.more-replies {
    display: block;
    margin-top: 4px;
    padding-bottom: 8px;
    font-size: 14px;
    color: var(--f7-theme-color);
    text-decoration: none;
}

.child-list {
    margin-top: 4px;
}

.child-row {
    display: flex;
    gap: 12px;
    padding: 6px 0;
    cursor: pointer;
}

.child-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    margin-top: 2px;
}

.child-body {
    flex: 1;
    min-width: 0;
}

.child-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--f7-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.child-content {
    margin-top: 2px;
    font-size: 15px;
    line-height: 1.5;
    color: var(--f7-text-color);
}

.child-content :deep(p) {
    margin: 0;
    display: inline;
}

.child-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 12px;
    color: var(--app-sub-text);
}

.child-like {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 2px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.sort-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: normal;
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

.comment-image {
    max-width: 160px;
    max-height: 160px;
    border-radius: 8px;
    margin-top: 6px;
    display: block;
    cursor: pointer;
    object-fit: cover;
}

.comment-content :deep(p) {
    margin: 0;
    display: inline;
}

.comment-author-link {
    text-decoration: none;
    color: inherit;
}
</style>
