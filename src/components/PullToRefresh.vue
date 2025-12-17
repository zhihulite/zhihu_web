<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LoadingSentinel from './LoadingSentinel.vue';
import MaterialSymbol from './MaterialSymbol.vue';

const props = defineProps({
    onRefresh: {
        type: Function,
        required: true
    },
    onLoadMore: {
        type: Function,
        default: null
    },
    hasMore: {
        type: Boolean,
        default: true
    }
});

const containerRef = ref(null);
const pullDistance = ref(0);
const isRefreshing = ref(false);
const showScrollTop = ref(false);
const isMobile = ref(false);

const startY = ref(0);
const isDragging = ref(false);

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

const handleResize = () => {
    if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < 768;
    }
};

const handleScroll = () => {
    const container = containerRef.value;
    if (!container) return;

    if (container.scrollTop > 300) {
        showScrollTop.value = true;
    } else {
        showScrollTop.value = false;
    }
};

const scrollToTop = () => {
    const container = containerRef.value;
    if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const handleFabRefresh = async () => {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    try {
        await props.onRefresh();
    } finally {
        isRefreshing.value = false;
    }
};

const handleTouchStart = (e) => {
    const container = containerRef.value;
    if (!container) return;

    if (container.scrollTop <= 0) {
        startY.value = e.touches[0].clientY;
        isDragging.value = true;
    } else {
        isDragging.value = false;
    }
};

const handleTouchMove = (e) => {
    const container = containerRef.value;
    if (!isDragging.value || isRefreshing.value || !container || container.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.value;

    if (diff > 0) {
        if (e.cancelable && diff < MAX_PULL) e.preventDefault();
        const newDistance = Math.min(diff * 0.5, MAX_PULL);
        pullDistance.value = newDistance;
    }
};

const finishDrag = async () => {
    if (pullDistance.value > PULL_THRESHOLD) {
        isRefreshing.value = true;
        pullDistance.value = PULL_THRESHOLD;
        try {
            await props.onRefresh();
        } finally {
            isRefreshing.value = false;
            pullDistance.value = 0;
        }
    } else {
        pullDistance.value = 0;
    }
    isDragging.value = false;
};

const handleTouchEnd = () => {
    if (!isDragging.value || isRefreshing.value) return;
    finishDrag();
};

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    const container = containerRef.value;
    if (container) {
        container.addEventListener('scroll', handleScroll);
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    const container = containerRef.value;
    if (container) {
        container.removeEventListener('scroll', handleScroll);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
    }
});

</script>

<template>
    <div class="ptr-wrapper">
        <s-scroll-view ref="containerRef" class="scroll-view">
            <div class="loading-indicator" :style="{
                transform: `translateY(${pullDistance - 50}px)`,
                opacity: (pullDistance > 5 || isRefreshing) ? 1 : 0,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s',
            }">
                <div class="spinner-container">
                    <div v-if="isRefreshing" class="spinner"></div>
                    <s-icon v-else :style="{ transform: `rotate(${pullDistance * 2}deg)` }">
                        <MaterialSymbol icon="refresh" :size="24" class="refresh-icon" />
                    </s-icon>
                </div>
            </div>

            <div class="content-wrapper" :style="{
                transform: `translateY(${pullDistance}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }">
                <slot></slot>
                <div v-if="onLoadMore" class="footer-state">
                    <LoadingSentinel v-if="hasMore && !isRefreshing" :onLoadMore="onLoadMore" />
                    <div v-else-if="!hasMore" class="no-more-text">没有更多了</div>
                </div>
            </div>
        </s-scroll-view>


        <div v-if="!isMobile" class="fab-container">
            <div class="fab-wrapper" :class="{ 'visible': showScrollTop, 'hidden': !showScrollTop }">
                <div class="fab-group">
                    <s-fab @click="scrollToTop">
                        <s-icon>
                            <MaterialSymbol icon="vertical_align_top" />
                        </s-icon>
                    </s-fab>
                    <s-tooltip>回到顶部</s-tooltip>
                </div>
            </div>

            <div class="fab-group">
                <s-fab @click="handleFabRefresh"
                    :style="{ transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }">
                    <s-icon>
                        <MaterialSymbol icon="refresh" />
                    </s-icon>
                </s-fab>
                <s-tooltip>刷新</s-tooltip>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ptr-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.scroll-view {
    display: block;
    height: 100%;
    width: 100%;
    overflow-y: auto;
}

.loading-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 10;
}

.spinner-container {
    width: 40px;
    height: 40px;
    background-color: var(--s-color-surface-container-high);
    border-radius: 9999px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--s-color-primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.refresh-icon {
    color: var(--s-color-primary);
}

.content-wrapper {
    min-height: 100%;
}

.fab-container {
    position: absolute;
    bottom: 32px;
    right: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-end;
    z-index: 50;
    pointer-events: auto;
}

.fab-wrapper {
    transition: all 0.3s;
    transform: translateY(40px);
    opacity: 0;
    pointer-events: none;
    transform-origin: center;
}

.fab-wrapper.visible {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
}

.fab-wrapper.hidden {
    transform: translateY(40px) scale(0.9);
    opacity: 0;
    pointer-events: none;
}

.fab-group {
    position: relative;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.footer-state {
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50px;
}

.no-more-text {
    color: var(--s-color-outline);
    font-size: 0.875rem;
}
</style>
