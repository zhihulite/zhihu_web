<script setup>
// src/components/CommentItem.vue
// 单条评论的展示与操作行：顶层评论与回复列表共用，差异（头像尺寸、回复入口）
// 由 props 与默认插槽承担。
defineProps({
    comment: Object,
    small: Boolean,
    // 该条正处于「回复中」高亮态
    replyActive: Boolean,
});

const emit = defineEmits(['user', 'like', 'dislike', 'reply', 'delete', 'menu', 'image']);
</script>

<template>
    <div class="item-content">
        <div class="item-media">
            <f7-link @click="emit('user', comment.authorId)" class="no-padding">
                <img :src="comment.authorAvatar" class="avatar" :class="{ small }" />
            </f7-link>
        </div>
        <div class="item-inner">
            <div class="item-title-row">
                <f7-link @click="emit('user', comment.authorId)" class="item-title comment-author-link">
                    {{ comment.authorName }}
                </f7-link>
                <div class="item-after">
                    {{ comment.createdTime }}{{ comment.ipLocation ? ` · ${comment.ipLocation}` : '' }}
                </div>
            </div>
            <div class="item-text" v-html="comment.content"></div>
            <img v-if="comment.imageUrl" :src="comment.imageUrl" class="comment-image"
                @click="emit('image', comment.imageUrl)" />
            <div class="item-footer display-flex align-items-center margin-top-half">
                <f7-link small @click="emit('like', comment)" class="margin-right"
                    :class="{ 'text-color-primary': comment.liked }">
                    <f7-icon :ios="comment.liked ? 'f7:hand_thumbsup_fill' : 'f7:hand_thumbsup'"
                        :md="comment.liked ? 'material:thumb_up' : 'material:thumb_up_off_alt'" size="14" />
                    {{ comment.likeCount }}
                </f7-link>
                <f7-link small @click="emit('dislike', comment)" class="margin-right"
                    :class="{ 'text-color-primary': comment.disliked }">
                    <f7-icon :ios="comment.disliked ? 'f7:hand_thumbsdown_fill' : 'f7:hand_thumbsdown'"
                        :md="comment.disliked ? 'material:thumb_down' : 'material:thumb_down_off_alt'" size="14" />
                </f7-link>
                <f7-link small @click="emit('reply', comment)" class="margin-right"
                    :class="{ 'text-color-primary': replyActive }">
                    回复
                </f7-link>
                <f7-link small v-if="comment.canDelete" color="red" class="margin-right"
                    @click="emit('delete', comment.id)">删除</f7-link>
                <f7-link small class="margin-right" @click="emit('menu', comment)">更多</f7-link>
                <slot />
            </div>
            <slot name="children" />
        </div>
    </div>
</template>

<style scoped>
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

.comment-author-link {
    text-decoration: none;
    color: inherit;
}

.item-text {
    color: var(--f7-text-color);
    margin-top: 4px;
}

.item-text :deep(p) {
    margin: 0;
    display: inline;
}

.list .item-text {
    max-height: none !important;
    -webkit-line-clamp: unset !important;
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
</style>
