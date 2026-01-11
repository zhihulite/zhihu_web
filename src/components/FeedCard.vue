<script setup>
const props = defineProps({
    item: Object,
})
defineEmits(['click'])

</script>

<template>
    <f7-card class="feed-card" :class="[$attrs.class]" @click="$emit('click', item)">
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
            <div v-else class="card-footer-metrics">
                <span class="metric-item">
                    <f7-icon ios="f7:hand_thumbsup" md="material:thumb_up" size="14" />
                    {{ item.metrics?.likes || 0 }}
                </span>
                <span class="metric-item">
                    <f7-icon ios="f7:bubble_left" md="material:chat_bubble" size="14" />
                    {{ item.metrics?.comments || 0 }}
                </span>
            </div>
        </f7-card-footer>
    </f7-card>
</template>

<style scoped>
.feed-card {
    cursor: pointer;
    margin: 8px 16px !important;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.mini-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.author-name {
    font-size: 14px;
    font-weight: 500;
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
    color: #1a1a1a;
}

.author-excerpt-line,
.bottom-text-line {
    font-size: 14px;
    color: #444;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.bottom-text-line {
    color: #888;
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
    color: #666;
}

.card-footer-metrics {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #999;
}

.metric-item {
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
