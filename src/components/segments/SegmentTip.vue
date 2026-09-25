<script setup>
// src/components/segments/SegmentTip.vue
// 接口注入的提示条（关系提示、正文末尾的时间与 IP 归属）
defineProps({ segment: Object });
</script>

<template>
    <div class="app-tip">
        <div class="tip-icon">
            <f7-icon ios="f7:info_circle" md="material:info" size="20" />
        </div>
        <div>{{ segment.myapptip.text }}</div>
    </div>
</template>

<style scoped>
.app-tip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    margin: 24px 0;
    font-size: 14px;
    border-left: 3px solid var(--f7-theme-color);
    color: var(--f7-text-color);
    opacity: 0.8;
}

.tip-icon {
    display: flex;
    align-items: center;
    color: var(--f7-theme-color);
}
</style>
