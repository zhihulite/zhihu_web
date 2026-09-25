<script setup>
// src/components/segments/SegmentHeading.vue
// id 供详情页目录与回顶定位使用，命名规则与 ArticleDetail 的 heading-${index} 一致
defineProps({ segment: Object, index: Number });
</script>

<template>
    <h3 :id="`heading-${index}`" class="heading">{{ segment.heading.text }}</h3>
</template>

<style scoped>
.heading {
    scroll-margin-top: 80px;
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 32px;
    margin-bottom: 16px;
    padding-left: 12px;
}
</style>
