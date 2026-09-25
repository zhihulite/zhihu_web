<script setup>
// src/components/segments/SegmentList.vue
import RenderStyledText from '@/components/RenderStyledText.vue';

defineProps({ segment: Object });
</script>

<template>
    <component :is="segment.list_node.ordered ? 'ol' : 'ul'" class="list-node"
        :class="{ 'ordered': segment.list_node.ordered }">
        <li v-for="(item, i) in segment.list_node.items" :key="i" class="list-item">
            <RenderStyledText :text="item.text" :marks="item.marks" />
        </li>
    </component>
</template>

<style scoped>
.list-node {
    padding-left: 24px;
    margin: 16px 0;
}

.list-item {
    margin-bottom: 8px;
    padding-left: 8px;
}

.list-node ul {
    list-style-type: disc;
}

.list-node ol {
    list-style-type: decimal;
}
</style>
