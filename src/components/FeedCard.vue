<script setup>
defineProps({
    item: Object,
    isThought: Boolean
})
defineEmits(['click', 'userClick'])
</script>

<template>
    <f7-card class="feed-card" @click="$emit('click', item)">
        <f7-card-content>
            <div class="title">{{ item.title }}</div>
            <div class="excerpt">{{ item.excerpt }}</div>
            <div class="footer">{{ item.target?.author?.name ?? "未知作者" }} · {{ item.metrics.likes }} 赞同
                {{ item.metrics.comments }} 评论
            </div>
        </f7-card-content>
    </f7-card>
</template>

<style scoped>
.feed-card {
    padding: 16px;
    margin-bottom: 16px;
    cursor: pointer;
}

.title {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 8px;
}

.excerpt {
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.actions {
    display: flex;
    gap: 8px;
}
</style>
