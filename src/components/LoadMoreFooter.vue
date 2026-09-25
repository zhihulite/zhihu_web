<script setup>
// 列表底部指示：还有数据时不渲染，加载完且非空时提示到底
defineProps({
    hasMore: { type: Boolean, default: true },
    length: { type: Number, default: 0 },
    text: { type: String, default: '没有更多了' },
});
</script>

<template>
    <div v-if="!hasMore && length > 0" class="no-more">
        {{ text }}
    </div>
</template>
