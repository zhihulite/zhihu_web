<script setup>
// src/components/segments/SegmentCodeBlock.vue
import { settings } from '@/core/settings.js';

defineProps({ segment: Object });
</script>

<template>
    <div class="code-block" :class="{ 'code-nowrap': !settings.codeWrap }">
        <pre class="code-content"><code>{{ segment.code_block.content }}</code></pre>
    </div>
</template>

<style scoped>
.code-block {
    background-color: #1e1e1e;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.code-content {
    margin: 0;
}

.code-content code {
    font-family: monospace;
    font-size: 0.875rem;
    color: #e5e7eb;
    white-space: pre-wrap;
    word-break: break-all;
}

/* 关闭自动换行：保持单行并横向滑动 */
.code-block.code-nowrap {
    overflow-x: auto;
}

.code-block.code-nowrap .code-content code {
    white-space: pre;
    word-break: normal;
}
</style>
