<script setup>
const props = defineProps(['item', 'rank'])
defineEmits(['click'])
</script>

<template>
    <f7-card class="hot-card" @click="$emit('click', item)">
        <f7-card-content class="hot-card-inner">
            <div class="hot-rank-col">
                <span class="rank-num" :class="'top-' + rank">{{ rank }}</span>
            </div>
            <div class="hot-content-col">
                <div class="hot-title">{{ item.title }}</div>
                <div class="hot-metrics" v-if="item.metricsArea">
                    <f7-icon ios="f7:flame_fill" md="material:local_fire_department" size="14" class="hot-icon" />
                    <span>{{ item.metricsArea }}</span>
                </div>
            </div>
            <div v-if="item.thumbnailSrc" class="hot-img-wrap">
                <img :src="item.thumbnailSrc" class="hot-thumb" />
            </div>
        </f7-card-content>
    </f7-card>
</template>

<style scoped>
.hot-card {
    cursor: pointer;
    margin: 8px 16px !important;
}

.hot-card-inner {
    padding: 16px !important;
    display: flex;
    align-items: center;
    gap: 12px;
}

.hot-rank-col {
    width: 28px;
    flex-shrink: 0;
    text-align: center;
}

.hot-content-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.hot-metrics {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #888;
}

.rank-num {
    font-size: 20px;
    font-weight: 900;
    color: #ccc;
    font-style: italic;
    line-height: 1;
}

.rank-num.top-1 {
    color: #ff3b30;
}

.rank-num.top-2 {
    color: #ff9500;
}

.rank-num.top-3 {
    color: #ffcc00;
}

.hot-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
    color: #1a1a1a;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.hot-img-wrap {
    width: 80px;
    height: 56px;
    flex-shrink: 0;
}

.hot-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.hot-metrics {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #888;
}

.hot-icon {
    color: #ff3b30;
}
</style>
