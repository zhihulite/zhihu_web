<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
    tabs: {
        type: Array, // Array { id, label }
        required: true
    },
    activeId: {
        type: String,
        default: undefined
    },
    onChange: {
        type: Function,
        default: undefined
    },
    defaultId: {
        type: String,
        default: undefined
    }
});

const internalActiveId = ref(props.defaultId || props.tabs[0]?.id);
const containerRef = ref(null);
const isProgrammaticScroll = ref(false);
const scrollTimeout = ref(null);

const currentId = computed(() => props.activeId !== undefined ? props.activeId : internalActiveId.value);

const handleTabClick = (id) => {
    if (props.onChange) {
        props.onChange(id);
    } else {
        internalActiveId.value = id;
    }
};

const handleScroll = () => {
    const container = containerRef.value;
    if (!container || isProgrammaticScroll.value) return;

    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;

    const index = Math.round(scrollLeft / width);
    const newActiveId = props.tabs[index]?.id;

    if (newActiveId && newActiveId !== currentId.value) {
        if (props.onChange) {
            props.onChange(newActiveId);
        } else {
            internalActiveId.value = newActiveId;
        }
    }
};

watch(currentId, (newId) => {
    nextTick(() => {
        const container = containerRef.value;
        if (!container) return;

        const index = props.tabs.findIndex(t => t.id === newId);
        if (index === -1) return;

        const width = container.offsetWidth;
        const targetLeft = width * index;
        const currentLeft = container.scrollLeft;

        if (Math.abs(currentLeft - targetLeft) > 5) {
            isProgrammaticScroll.value = true;

            if (scrollTimeout.value) clearTimeout(scrollTimeout.value);

            container.scrollTo({
                left: targetLeft,
                behavior: 'smooth'
            });

            scrollTimeout.value = setTimeout(() => {
                isProgrammaticScroll.value = false;
            }, 600);
        }
    });
}, { immediate: true });

</script>

<template>
    <div class="mobile-tab-layout">
        <div class="header">
            <s-tab class="tab-bar">
                <s-tab-item v-for="tab in tabs" :key="tab.id" :selected="currentId === tab.id"
                    @click="handleTabClick(tab.id)">
                    <div slot="text">{{ tab.label }}</div>
                </s-tab-item>
            </s-tab>
        </div>

        <div ref="containerRef" class="view-pager" @scroll="handleScroll">
            <div v-for="tab in tabs" :key="tab.id" class="page">
                <div class="page-content">
                    <slot :name="tab.id">
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mobile-tab-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.header {
    flex-shrink: 0;
    z-index: 10;
}

.tab-bar {
    width: 100%;
    justify-content: space-around;
}

.view-pager {
    flex: 1;
    width: 100%;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow-y: hidden;
}

.view-pager::-webkit-scrollbar {
    display: none;
}

.page {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    scroll-snap-align: center;
    overflow: hidden;
}

.page-content {
    height: 100%;
    width: 100%;
    position: relative;
}
</style>
