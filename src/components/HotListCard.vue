<script setup>
defineProps(['item', 'rank'])
defineEmits(['click'])
</script>

<template>
    <s-card clickable="true" class="hot-card" @click="$emit('click', item)">
        <div class="rank-badge" :class="{ 'top-3': rank <= 3, 'top-1': rank === 1 }">
            {{ rank }}
        </div>
        <div class="content">
            <div class="title">{{ item.title }}</div>
            <div class="metrics">{{ item.metrics }}</div>
        </div>
        <div v-if="item.thumbnailSrc" class="thumbnail-container">
            <img :src="item.thumbnailSrc" class="thumbnail" :onerror="`this.style.display='none'`" />
        </div>
    </s-card>
</template>

<style scoped>
.hot-card {
    display: flex;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    border-radius: 12px;
    max-width: none;
    position: relative;
    overflow: hidden;
}

.rank-badge {
    font-size: 1.25rem;
    font-weight: bold;
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    flex-shrink: 0;
}

.content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}


.thumbnail-container {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
}

.thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
