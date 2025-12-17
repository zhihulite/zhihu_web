<script setup>
defineProps(['onRefresh'])
</script>

<template>
    <div class="collections-list">
        <div v-for="i in [1, 2]" :key="i" class="list-item">
            <div class="avatar-container">
                <img :src="`https://picsum.photos/id/${200 + i}/200/200`" class="avatar-img" />
            </div>
            <div class="text-info">
                <h3 class="item-title">优质收藏夹 {{ i }}</h3>
                <p class="item-sub">1.2k 关注</p>
            </div>
            <s-button type="outlined" style="align-self: center;">已关注</s-button>
        </div>
    </div>
</template>

<style scoped>
.collections-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    padding-bottom: 80px;
}

.list-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.list-item:hover {
    background-color: var(--md-sys-color-surface-container);
}

.avatar-container {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    background-color: #eee;
    flex-shrink: 0;
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.text-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.item-title {
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    margin: 0;
}

.item-sub {
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
    margin-top: 4px;
}
</style>
