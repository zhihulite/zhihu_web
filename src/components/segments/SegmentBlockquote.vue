<script setup>
// src/components/segments/SegmentBlockquote.vue
import RenderStyledText from '@/components/RenderStyledText.vue';

defineProps({ segment: Object });
</script>

<template>
    <div class="blockquote-wrapper">
        <div class="quote-icon">
            <f7-icon ios="f7:quote_bubble_fill" md="material:format_quote" size="24" />
        </div>
        <blockquote class="blockquote">
            <RenderStyledText :text="segment.blockquote.text" :marks="segment.blockquote.marks" />
        </blockquote>
    </div>
</template>

<style scoped>
.blockquote-wrapper {
    position: relative;
    padding-left: 24px;
    margin: 24px 0;
}

.quote-icon {
    position: absolute;
    top: 0;
    left: 0;
}

.blockquote {
    font-size: 1.125rem;
    font-style: italic;
    padding-left: 16px;
    margin: 0;
}
</style>
