<script setup>
import { ref } from 'vue'
import RecommendUserCard from './RecommendUserCard.vue'

const props = defineProps(['item'])
const emit = defineEmits(['click', 'remove'])

// 存储当前显示的卡片数据
const cardData = ref([...(props.item.data || [])])

// 处理取消关注事件
const handleUninterest = (userId) => {
  // 从当前列表中移除该用户卡片
  cardData.value = cardData.value.filter(card => card.actor.id !== userId)
  
  // 如果所有卡片都被移除，则触发整个卡片列表的移除事件
  if (cardData.value.length === 0) {
    emit('remove', props.item)
  }
}
</script>

<template>
    <!-- 推荐关注卡片列表 -->
    <f7-card class="recommend-user-card-list">
        <!-- 标题 -->
        <f7-card-header class="recommend-user-card-list-header">
            <h3 class="recommend-user-card-list-title">{{ item.title || '推荐关注' }}</h3>
        </f7-card-header>
        
        <!-- 使用网格布局实现一行两个用户卡片 -->
        <f7-card-content class="recommend-user-card-list-content">
            <div class="recommend-user-grid">
                <!-- 遍历卡片数据渲染推荐用户卡片 -->
                <RecommendUserCard 
                    v-for="(card, index) in cardData" 
                    :key="index"
                    :item="card"
                    @uninterest="handleUninterest"
                    @click="(item) => $emit('click', item)"
                    class="recommend-user-grid-item"
                />
            </div>
        </f7-card-content>
    </f7-card>
</template>

<style scoped>
.recommend-user-card-list {
    margin-bottom: 16px;
    background-color: transparent;
    border-radius: 0;
    overflow: hidden;
    box-shadow: none;
}

.recommend-user-card-list-header {
    padding: 12px 16px;
    background-color: transparent;
    border-bottom: none;
}

.recommend-user-card-list-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #333;
}

.recommend-user-card-list-content {
    padding: 0 16px 16px;
    overflow: visible;
}

.recommend-user-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin: 0;
    padding: 0;
}

.recommend-user-grid-item {
    width: calc(50% - 8px); /* 8px is half the gap (16px) */
    box-sizing: border-box;
}

/* 适配小屏幕，确保在窄屏上也能正常显示 */
@media (max-width: 576px) {
    .recommend-user-grid-item {
        width: 100%;
    }
}
</style>