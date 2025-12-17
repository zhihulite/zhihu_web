<script setup>
import FeedCard from '../FeedCard.vue';
import PullToRefresh from '../PullToRefresh.vue';

defineProps({
    data: Array,
    onRefresh: Function,
    onArticleClick: Function,
    onCommentClick: Function
})
</script>

<template>
    <div class="daily-view">
        <div class="container">
            <div class="header">
                <h2 class="title">知乎日报</h2>
                <p class="subtitle">为您精选的故事</p>
            </div>
            <div class="content">
                <PullToRefresh :onRefresh="onRefresh">
                    <div class="card-grid">
                        <div class="masonry-item" v-for="(item, index) in data" :key="item.id + '-' + index">
                            <FeedCard :item="item" @click="onArticleClick(item)" @commentClick="onCommentClick" />
                        </div>
                    </div>
                </PullToRefresh>
            </div>
        </div>
    </div>
</template>

<style scoped>
.daily-view {
    width: 100%;
    height: 100%;
    background-color: var(--md-sys-color-surface);
}

.container {
    max-width: 900px;
    margin: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.header {
    padding: 16px;
    padding-bottom: 8px;
    padding-top: 16px;
    flex-shrink: 0;
}

.title {
    font-size: 1.875rem;
    font-weight: bold;
    color: #111;
    margin: 0;
    margin-top: 16px;
}

.subtitle {
    color: #666;
    margin-top: 4px;
}

.content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.card-grid {
    padding: 16px;
    column-count: 1;
    column-gap: 16px;
    padding-bottom: 80px;
}

@media (min-width: 768px) {
    .card-grid {
        column-count: 2;
    }
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 16px;
}
</style>
