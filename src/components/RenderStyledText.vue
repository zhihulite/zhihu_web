<script setup>
import { computed } from 'vue';

const props = defineProps({
    text: {
        type: String,
        required: true
    },
    marks: {
        type: Array,
        default: () => []
    }
});

const parts = computed(() => {
    const text = props.text;
    const marks = props.marks || [];

    if (marks.length === 0) {
        return [{ type: 'text', content: text }];
    }

    // 获取所有边界点并去重排序
    const points = new Set([0, text.length]);
    marks.forEach(m => {
        if (m.start_index >= 0 && m.start_index <= text.length) points.add(m.start_index);
        if (m.end_index >= 0 && m.end_index <= text.length) points.add(m.end_index);
    });
    const sortedPoints = Array.from(points).sort((a, b) => a - b);

    const specialTypes = ['bold', 'italic', 'code', 'link', 'entity_word'];

    const result = [];
    for (let i = 0; i < sortedPoints.length - 1; i++) {
        const start = sortedPoints[i];
        const end = sortedPoints[i + 1];
        if (start === end) continue;

        const content = text.substring(start, end);
        const activeMarks = marks.filter(m => m.start_index <= start && m.end_index >= end);

        if (activeMarks.length === 0) {
            result.push({ type: 'text', content });
        } else {
            const activeTypes = activeMarks.map(m => m.type);
            const markInfo = {
                type: 'mark',
                content,
                activeTypes,
                url: activeMarks.find(m => m.type === 'link')?.link?.href ||
                    activeMarks.find(m => m.type === 'entity_word')?.entity_word?.url,
                isHighlight: activeTypes.some(t => !specialTypes.includes(t))
            };
            result.push(markInfo);
        }
    }

    return result;
});
</script>

<template>
    <span>
        <template v-for="(part, index) in parts" :key="index">
            <span v-if="part.type === 'text'">{{ part.content }}</span>
            <a v-else-if="part.url" :href="`javascript:$openLink('${part.url}')`" class="styled-link" :class="{
                'styled-bold': part.activeTypes.includes('bold'),
                'styled-italic': part.activeTypes.includes('italic'),
                'styled-code': part.activeTypes.includes('code')
            }" @click.stop>{{ part.content }}</a>
            <span v-else :class="{
                'styled-bold': part.activeTypes.includes('bold'),
                'styled-italic': part.activeTypes.includes('italic'),
                'styled-code': part.activeTypes.includes('code'),
                'styled-highlight': part.isHighlight
            }">{{ part.content }}</span>
        </template>
    </span>
</template>

<style scoped>
.styled-link {
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color 0.2s;
}


.styled-bold {
    font-weight: bold;
}

.styled-italic {
    font-style: italic;
}

.styled-highlight {
    background-color: rgba(var(--f7-theme-color-rgb, 33, 150, 243), 0.12);
    color: var(--f7-theme-color, #2196f3);
    padding: 0.1em 0.3em;
    margin: 0 0.1em;
    border-radius: 6px;
    font-weight: 500;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
}

.styled-code {
    font-family: monospace;
    background-color: rgba(125, 125, 125, 0.1);
    padding: 0 4px;
    border-radius: 4px;
    font-size: 0.9em;
}
</style>
