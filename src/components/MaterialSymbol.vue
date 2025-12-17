<script setup>
import { computed } from 'vue'

const styleId = 'material-symbols-style';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
    @import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    @import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    @import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    
    .material-symbols {
      line-height: 1;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      user-select: none;
    }
  `;
    document.head.appendChild(style);
}

const props = defineProps({
    icon: {
        type: String,
        required: true
    },
    family: {
        type: String,
        default: 'rounded',
        validator: (value) => ['outlined', 'rounded', 'sharp'].includes(value)
    },
    fill: {
        type: Boolean,
        default: false
    },
    weight: {
        type: Number,
        default: 400
    },
    grade: {
        type: Number,
        default: 0
    },
    size: {
        type: [Number, String],
        default: 24
    },
    color: {
        type: String,
        default: undefined
    },
    alignText: {
        type: Boolean,
        default: false
    }
})

const computedStyle = computed(() => {
    const fontFamily = `Material Symbols ${props.family.charAt(0).toUpperCase() + props.family.slice(1)}`

    return {
        fontFamily: `"${fontFamily}"`,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
        color: props.color,
        position: props.alignText ? 'relative' : undefined,
        top: props.alignText ? '0.125em' : undefined,
        fontVariationSettings: `'FILL' ${props.fill ? 1 : 0}, 'wght' ${props.weight}, 'GRAD' ${props.grade}, 'opsz' ${props.size}`
    }
})
</script>

<template>
    <span class="material-symbols" :style="computedStyle">
        {{ icon }}
    </span>
</template>
