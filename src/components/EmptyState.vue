<script setup>
defineProps({
    icon: { type: String, default: 'tray' },
    text: { type: String, default: '暂无内容' },
    subtext: { type: String, default: '' },
});
</script>

<template>
    <div class="empty-state">
        <f7-icon :f7="icon" size="48" color="gray" />
        <p>{{ text }}</p>
        <p v-if="subtext" class="empty-subtext">{{ subtext }}</p>
        <slot />
    </div>
</template>
