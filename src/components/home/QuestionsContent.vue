<script setup>
import { HOT_DATA } from '../../services/mockData';
defineProps(['data', 'onArticleClick', 'onRefresh'])
</script>

<template>
    <div class="questions-content">
        <div v-for="(item, index) in data" :key="index" @click="onArticleClick(item)" class="question-item">
            <h3 class="title">{{ item.title }}</h3>
            <div class="meta">
                <span>{{ item.metrics?.votes }} 关注</span>
                <span>{{ item.metrics?.comments }} 回答</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.questions-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 80px;
    padding: 16px;
}

.question-item {
    padding: 16px;
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.question-item:hover {
    background-color: var(--md-sys-color-surface-container);
}

.title {
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    margin-bottom: 8px;
}

.meta {
    display: flex;
    gap: 16px;
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
}
</style>
