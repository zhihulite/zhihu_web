<script setup>
import FeedCard from '../FeedCard.vue';


defineProps({
    items: Array,
    onClear: Function,
    onRefresh: Function,
    onArticleClick: Function,
    onUserClick: Function,
    onCommentClick: Function
})
</script>

<template>
    <div class="history-view">
        <div class="container">
            <div class="header">
                <h1 class="title">历史记录</h1>
                <s-button type="filled-tonal" @click="onClear">
                    <f7-icon ios="f7:trash_fill" md="material:delete_sweep" slot="icon" /> 清空
                </s-button>
            </div>
            <div class="content">
                <div class="scroller">
                    <div v-if="items.length === 0" class="empty-state">
                        <f7-icon ios="f7:clock" md="material:history" size="40" class="empty-icon" />
                        <p>暂无历史</p>
                    </div>
                    <div v-else class="card-grid">
                        <div class="masonry-item" v-for="(item, index) in items"
                            :key="'history-' + item.id + '-' + index">
                            <FeedCard :item="item" @click="onArticleClick(item)" @userClick="onUserClick"
                                @commentClick="onCommentClick" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.history-view {
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 32px 24px 0;
    flex-shrink: 0;
}

.title {
    font-size: 1.875rem;
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
}

.content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.scroller {
    padding: 16px;
    padding-bottom: 80px;
    height: 100%;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 256px;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.5;
}

.empty-icon {
    margin-bottom: 8px;
}

.card-grid {
    column-count: 1;
    column-gap: 16px;
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
