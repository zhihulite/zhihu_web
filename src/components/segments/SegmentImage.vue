<script setup>
// src/components/segments/SegmentImage.vue
// 只负责渲染与上抛点击，图集序号与查看器由 ContentRenderer / 详情页统一处理。
const props = defineProps({ segment: Object });

const emit = defineEmits(['image-click']);

const aspectRatio = () => {
    const { width, height } = props.segment.image;
    return width && height ? `${width} / ${height}` : 'auto';
};
</script>

<template>
    <figure class="image-figure">
        <div class="image-wrapper" :style="{ aspectRatio: aspectRatio(), backgroundColor: 'var(--app-placeholder-bg)' }">
            <img :src="segment.image.urls?.[0]" :alt="segment.image.description || 'Article Image'"
                class="article-image" loading="lazy" @click="emit('image-click', segment.image.urls?.[0])" />
        </div>
        <figcaption v-if="segment.image.description" class="image-caption">
            {{ segment.image.description }}
        </figcaption>
    </figure>
</template>

<style scoped>
.image-figure {
    margin: 24px 0;
}

.article-image {
    width: 100%;
    border-radius: 12px;
    display: block;
    cursor: pointer;
}

.image-caption {
    text-align: center;
    font-size: 0.875rem;
    margin-top: 8px;
}
</style>
