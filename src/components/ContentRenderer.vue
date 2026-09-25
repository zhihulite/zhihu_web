<script setup>
// src/components/ContentRenderer.vue
// 正文分段渲染：类型 → 组件注册表，段内标记、样式与交互归各段组件自己持有。
import { computed } from 'vue';
import SegmentParagraph from '@/components/segments/SegmentParagraph.vue';
import SegmentHeading from '@/components/segments/SegmentHeading.vue';
import SegmentBlockquote from '@/components/segments/SegmentBlockquote.vue';
import SegmentCodeBlock from '@/components/segments/SegmentCodeBlock.vue';
import SegmentList from '@/components/segments/SegmentList.vue';
import SegmentImage from '@/components/segments/SegmentImage.vue';
import SegmentCard from '@/components/segments/SegmentCard.vue';
import SegmentVideo from '@/components/segments/SegmentVideo.vue';
import SegmentTip from '@/components/segments/SegmentTip.vue';
import SegmentHr from '@/components/segments/SegmentHr.vue';

const SEGMENTS = {
    paragraph: SegmentParagraph,
    heading: SegmentHeading,
    blockquote: SegmentBlockquote,
    code_block: SegmentCodeBlock,
    list_node: SegmentList,
    image: SegmentImage,
    card: SegmentCard,
    video: SegmentVideo,
    myapptip: SegmentTip,
    hr: SegmentHr,
};

const props = defineProps({
    segments: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['imageClick']);

// index 是段在原数组里的下标：目录锚点 heading-${index} 依赖它，过滤后不能重排
const rendered = computed(() => props.segments.map((segment, index) => {
    const comp = SEGMENTS[segment.type];
    if (!comp) return null;
    return {
        comp,
        segment,
        index,
        // 只有目录段需要下标，逐个传会落到其余段的 DOM 属性上
        extraProps: comp === SegmentHeading ? { index } : {},
    };
}).filter(Boolean));

const allImageUrls = computed(() => {
    return props.segments
        .filter(seg => seg.type === 'image')
        .map(seg => seg.image.urls?.[0])
        .filter(url => !!url);
});

const handleImageClick = (url) => {
    const index = allImageUrls.value.indexOf(url);
    emit('imageClick', { url, index, allUrls: allImageUrls.value });
};
</script>

<template>
    <div class="content-renderer">
        <component v-for="entry in rendered" :is="entry.comp" :key="entry.index" :segment="entry.segment"
            v-bind="entry.extraProps" @image-click="handleImageClick" />
    </div>
</template>

<style scoped>
.content-renderer {
    line-height: 1.8;
}
</style>
