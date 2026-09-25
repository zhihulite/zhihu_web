<script setup>
// src/components/segments/SegmentCard.vue
// 链接卡片：标题走接口字段，简介与跳转地址在 extra_info 的 JSON 里。
import { computed } from 'vue';
import { openLink } from '@/core/navigation.js';

const props = defineProps({ segment: Object });

const info = computed(() => {
    const card = props.segment.card;
    if (!card) return {};
    try {
        const extra = card.extra_info ? JSON.parse(card.extra_info) : {};
        return {
            title: card.title,
            desc: extra.desc || extra.description || '',
            url: extra.url || '',
            cover: card.cover
        };
    } catch {
        return { title: card.title, desc: '', url: '' };
    }
});

// 没有地址时不开窗：window.open('#') 会复制当前页开一个空白标签
const open = () => {
    if (info.value.url) openLink(info.value.url);
};
</script>

<template>
    <f7-card class="link-card group" @click="open">
        <div class="card-content">
            <h4 class="card-title">{{ info.title }}</h4>
            <p class="card-desc">{{ info.desc }}</p>
            <div class="card-meta">
                <f7-icon ios="f7:arrow_up_right_square" md="material:open_in_new" size="12" />
                <span>Link Card</span>
            </div>
        </div>
        <img v-if="info.cover" :src="info.cover" class="card-cover" />
    </f7-card>
</template>

<style scoped>
.link-card {
    display: flex;
    align-items: center;
    gap: 16px;
    border-radius: 12px;
    padding: 12px;
    margin: 16px 0;
    text-decoration: none;
    transition: background-color 0.2s;
}

.card-content {
    flex: 1;
    min-width: 0;
}

.card-title {
    font-weight: bold;
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 1rem;
}

.card-desc {
    font-size: 0.875rem;
    margin: 4px 0 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
}

.card-cover {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    object-fit: cover;
    background-color: var(--app-placeholder-bg);
}
</style>
