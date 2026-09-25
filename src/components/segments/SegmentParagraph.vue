<script setup>
// src/components/segments/SegmentParagraph.vue
import RenderStyledText from '@/components/RenderStyledText.vue';

defineProps({ segment: Object });
</script>

<template>
    <p class="paragraph">
        <RenderStyledText :text="segment.paragraph.text" :marks="segment.paragraph.marks" />
    </p>
</template>

<style scoped>
.paragraph {
    font-size: 17px;
    line-height: 1.8;
    margin-bottom: 24px;
    letter-spacing: 0.01em;
}
</style>
