<script setup>
import MetricRow from '@/components/MetricRow.vue';
import { ICON } from '@/core/icons.js';

const props = defineProps({
    item: Object,
    dismissible: Boolean,
})
const emit = defineEmits(['click', 'dislike'])

// 长按走 Framework7 原生 taphold（app.touch.tapHold），右键走 contextmenu；
// tapHoldPreventClicks 默认开启，长按后不会再触发 click
const onContextMenu = (e) => {
    if (!props.dismissible) return
    e.preventDefault()
    emit('dislike', props.item)
}

const onTaphold = () => {
    if (!props.dismissible) return
    emit('dislike', props.item)
}
</script>

<template>
    <f7-card class="feed-card" :class="[$attrs.class, dismissible ? 'dismissible' : '']" @click="$emit('click', item)"
        @taphold="onTaphold" @contextmenu="onContextMenu">
        <f7-card-content>
            <div v-if="item.image" class="card-image-wrap">
                <img :src="item.image" class="content-img" />
            </div>
            <div class="title" v-html="item.title"></div>

            <div v-if="item.bottomText" class="bottom-text-line">
                {{ item.bottomText }}
            </div>
            <div v-else class="author-excerpt-line">
                <span class="author-label" v-if="!item.noAuthorPrefix">{{ item.authorName || '匿名用户' }}：</span>
                <span class="excerpt-text" v-html="item.excerpt"></span>
            </div>
        </f7-card-content>

        <f7-card-footer>
            <div v-if="item.footer" class="card-footer-text">
                {{ item.footer }}
            </div>
            <MetricRow v-else :items="[
                { icon: ICON.like, value: item.metrics?.likes },
                { icon: ICON.comment, value: item.metrics?.comments },
            ]" />
        </f7-card-footer>
    </f7-card>
</template>

<style scoped>
.feed-card {
    cursor: pointer;
    margin: var(--app-card-gap, 8px) var(--app-page-margin, 16px) !important;
}

.feed-card :deep(.card-content) {
    padding: var(--app-card-padding, 16px);
}

.feed-card.dismissible {
    -webkit-touch-callout: none;
    user-select: none;
    -webkit-user-select: none;
}

.card-image-wrap {
    margin-bottom: 12px;
}

.content-img {
    width: 100%;
    border-radius: 4px;
    max-height: 200px;
    object-fit: cover;
}

.title {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--f7-text-color);
}

.author-excerpt-line,
.bottom-text-line {
    font-size: 14px;
    color: var(--f7-text-color);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.bottom-text-line {
    color: var(--app-sub-text);
}

.title :deep(p),
.title :deep(span) {
    display: inline;
    margin: 0;
}

.author-excerpt-line :deep(p),
.author-excerpt-line :deep(em),
.author-excerpt-line :deep(span) {
    display: inline;
    margin: 0;
}

.author-label {
    font-weight: 500;
    color: var(--app-sub-text);
}
</style>
