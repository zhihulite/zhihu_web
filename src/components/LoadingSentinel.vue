<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps(['onLoadMore']);

const sentinelRef = ref(null);
let observer = null;

onMounted(() => {
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            props.onLoadMore?.();
        }
    }, { threshold: 0.1 });

    if (sentinelRef.value) {
        observer.observe(sentinelRef.value);
    }
});

onUnmounted(() => {
    if (observer) observer.disconnect();
});
</script>

<template>
    <div ref="sentinelRef" class="loading-sentinel">
        <s-circular-progress indeterminate="true" style="width: 24px; height: 24px;"></s-circular-progress>
    </div>
</template>

<style scoped>
.loading-sentinel {
    width: 100%;
    padding: 32px 0;
    display: flex;
    justify-content: center;
}

.progress {
    --md-circular-progress-size: 32px;
}
</style>
