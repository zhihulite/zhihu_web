<script setup>
import { ref } from 'vue';
import FeedCard from '../FeedCard.vue';
import PullToRefresh from '../PullToRefresh.vue';
import MaterialSymbol from '../MaterialSymbol.vue';
import MobileTabLayout from '../MobileTabLayout.vue';
import { HOT_DATA } from '../../services/mockData'; // Reuse HOT_DATA or Collections Data

defineProps(['onRefresh'])

const activeTab = ref('mine');

const myCollections = [1, 2];
const followingCollections = [1, 2];
</script>

<template>
    <div class="collections-view">
        <h1 class="header-title">收藏</h1>
        <div class="content-wrapper">
            <MobileTabLayout :tabs="[
                { id: 'mine', label: '我创建的' },
                { id: 'following', label: '我关注的' }
            ]" :activeId="activeTab" :onChange="(id) => activeTab = id">
                <template #mine>
                    <PullToRefresh :onRefresh="onRefresh">
                        <div class="grid-layout">
                            <s-card clickable class="create-card group">
                                <MaterialSymbol icon="add" :size="48" class="add-icon" />
                                <span class="create-label">新建收藏夹</span>
                            </s-card>
                            <s-card v-for="i in myCollections" :key="i" clickable class="collection-card">
                                <img :src="`https://picsum.photos/id/${100 + i}/400/300`" class="cover-image" />
                                <div class="overlay">
                                    <span class="title">深度学习 {{ i }}</span>
                                    <span class="count">24 条内容</span>
                                </div>
                            </s-card>
                        </div>
                    </PullToRefresh>
                </template>
                <template #following>
                    <PullToRefresh :onRefresh="onRefresh">
                        <div class="list-layout">
                            <div v-for="i in followingCollections" :key="i" class="list-item">
                                <div class="avatar-container">
                                    <img :src="`https://picsum.photos/id/${200 + i}/200/200`" class="avatar-img" />
                                </div>
                                <div class="text-info">
                                    <h3 class="item-title">优质收藏夹 {{ i }}</h3>
                                    <p class="item-sub">1.2k 关注</p>
                                </div>
                                <s-button type="outlined" style="align-self: center;">已关注</s-button>
                            </div>
                        </div>
                    </PullToRefresh>
                </template>
            </MobileTabLayout>
        </div>
    </div>
</template>

<style scoped>
.collections-view {
    max-width: 900px;
    margin: auto;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--md-sys-color-surface);
    height: 100%;
}

.header-title {
    font-size: 1.875rem;
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    margin-bottom: 8px;
    padding: 16px 24px 0;
    flex-shrink: 0;
}

.content-wrapper {
    flex: 1;
    overflow: hidden;
}

.grid-layout {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
    padding-bottom: 80px;
}

@media (min-width: 768px) {
    .grid-layout {
        grid-template-columns: repeat(3, 1fr);
    }
}

.create-card {
    aspect-ratio: 4 / 3;
    background-color: var(--md-sys-color-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.add-icon {
    color: var(--md-sys-color-on-primary-container);
    transition: transform 0.2s;
}

.create-card:hover .add-icon {
    transform: scale(1.1);
}

.create-label {
    position: absolute;
    bottom: 16px;
    font-weight: bold;
    color: var(--md-sys-color-on-primary-container);
}

.collection-card {
    aspect-ratio: 4 / 3;
    position: relative;
    overflow: hidden;
}

.cover-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
    transition: opacity 0.2s;
}

.collection-card:hover .cover-image {
    opacity: 1;
}

.overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.title {
    color: white;
    font-weight: bold;
    font-size: 1.125rem;
}

.count {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
}

.list-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    padding-bottom: 80px;
}

.list-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.list-item:hover {
    background-color: var(--md-sys-color-surface-container);
}

.avatar-container {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    background-color: #eee;
    flex-shrink: 0;
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.text-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.item-title {
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    margin: 0;
}

.item-sub {
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
    margin-top: 4px;
}
</style>
