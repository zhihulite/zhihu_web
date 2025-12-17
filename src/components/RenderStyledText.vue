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
    if (!props.marks || props.marks.length === 0) {
        return [{ type: 'text', content: props.text }];
    }

    const sortedMarks = [...props.marks].sort((a, b) => a.start_index - b.start_index);
    const result = [];
    let lastIndex = 0;

    sortedMarks.forEach(mark => {
        if (mark.start_index > lastIndex) {
            result.push({
                type: 'text',
                content: props.text.substring(lastIndex, mark.start_index)
            });
        }

        const segmentContent = props.text.substring(mark.start_index, mark.end_index);
        result.push({
            type: 'mark',
            markType: mark.type, // 'bold', 'italic', 'link'
            content: segmentContent,
            link: mark.link // { href: ... }
        });

        lastIndex = mark.end_index;
    });

    if (lastIndex < props.text.length) {
        result.push({
            type: 'text',
            content: props.text.substring(lastIndex)
        });
    }

    return result;
});
</script>

<template>
    <span>
        <template v-for="(part, index) in parts" :key="index">
            <span v-if="part.type === 'text'">{{ part.content }}</span>
            <a v-else-if="part.markType === 'link' && part.link" :href="part.link.href" target="_blank"
                class="styled-link" @click.stop>
                {{ part.content }}
            </a>
            <strong v-else-if="part.markType === 'bold'" class="styled-bold">{{ part.content }}</strong>
            <em v-else-if="part.markType === 'italic'" class="styled-italic">{{ part.content }}</em>
            <span v-else class="styled-highlight">{{ part.content }}</span>
        </template>
    </span>
</template>

<style scoped>
.styled-link {
    color: var(--md-sys-color-primary);
    text-decoration: underline;
    text-decoration-color: rgba(var(--md-sys-color-primary), 0.3);
    text-underline-offset: 2px;
    transition: color 0.2s;
}

.styled-link:hover {
    text-decoration-color: var(--md-sys-color-primary);
}

.styled-bold {
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
}

.styled-italic {
    font-style: italic;
    color: var(--md-sys-color-on-surface-variant);
}

.styled-highlight {
    background-color: #fef3c7;
    /* yellow-100 */
    color: #111827;
    /* gray-900 */
}
</style>
