<script setup>
// src/components/segments/SegmentVideo.vue
import ZVideoPlayer from '@/components/ZVideoPlayer.vue';

defineProps({ segment: Object });
</script>

<template>
    <ZVideoPlayer :video-id="segment.video.id" :poster="segment.video.poster" />
</template>
