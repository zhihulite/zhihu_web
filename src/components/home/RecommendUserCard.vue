<script setup>
import { f7 } from 'framework7-vue'
import $http from '../../api/http.js'

const props = defineProps(['item'])
const emit = defineEmits(['remove', 'uninterest', 'click'])

const removeCard = async (event) => {
  // 阻止事件冒泡 防止触发卡片点击事件
  event.stopPropagation()
  
  try {
    // 发送取消关注请求
    await $http.post('https://api.zhihu.com/moments/uninterest_user', `member_id=${props.item.actor.id}`)
    
    // 触发移除事件
    emit('uninterest', props.item.actor.id)
  } catch (error) {
    console.error('取消关注失败:', error)
    f7.dialog.alert('取消关注失败，请稍后重试')
  }
}

// 处理卡片点击事件
const handleCardClick = () => {
  emit('click', props.item)
}
</script>

<template>
    <div class="recommend-user-card" @click="handleCardClick">
        <div class="recommend-user-close" @click="removeCard">
            <f7-icon f7="xmark_circle" size="20" />
        </div>
        
        <div class="recommend-user-avatar">
            <img 
                :src="item.actor.avatar_url" 
                class="recommend-user-avatar-img"
                @error="$event.target.style.display = 'none'"
            />
            <div class="recommend-user-avatar-mask"></div>
        </div>
        
        <div class="recommend-user-info">
            <h3 class="recommend-user-name">{{ item.actor.name }}</h3>
            <p class="recommend-user-headline">{{ item.actor.headline }}</p>
        </div>
        
        <div class="recommend-user-reason">
            <f7-icon :ios="'f7:person_2'" :md="'material:person_add'" size="14" />
            <span>{{ item.reason }}</span>
        </div>
    </div>
</template>

<style scoped>
.recommend-user-card {
    position: relative;
    width: 100%;
    min-width: auto;
    padding: 16px;
    background-color: transparent;
    border-radius: 8px;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s ease;
}


.recommend-user-close {
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    color: #999;
    z-index: 10;
}

.recommend-user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-top: 10px;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.recommend-user-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 1;
}

.recommend-user-avatar-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    border-radius: 50%;
    z-index: 0;
}

.recommend-user-info {
    text-align: center;
}

.recommend-user-name {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: #333;
}

.recommend-user-headline {
    font-size: 14px;
    color: #666;
    margin: 4px 0 0;
    line-height: 1.4;
}

.recommend-user-reason {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #999;
    margin-top: 8px;
}
</style>