<script setup>
// 指标行：点赞/评论等「图标 + 数字」只读展示。
// 交互式的点赞/收藏按钮（会翻转状态）不走这里，用 useReaction。
import { formatCount } from '@/utils/format.js';

defineProps({
    // [{ icon: { ios, md }, value }]
    items: { type: Array, default: () => [] },
    size: { type: [Number, String], default: 14 },
});
</script>

<template>
    <div class="metric-row">
        <span v-for="(m, i) in items" :key="i" class="metric-item">
            <f7-icon :ios="m.icon.ios" :md="m.icon.md" :size="size" />
            {{ formatCount(m.value || 0) }}
        </span>
    </div>
</template>

<style scoped>
.metric-row {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: var(--app-sub-text);
}

.metric-item {
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
