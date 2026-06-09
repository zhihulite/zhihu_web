<script setup>
import { ref } from 'vue'

const props = defineProps(['item'])
defineEmits(['click'])

const expanded = ref(false)

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const isCollapsibleGroup = () => {
  return props.item.type === 'collapsible_group'
}

const getGroupText = () => {
  return props.item.groupText
}

const getAllItems = () => {
  return isCollapsibleGroup() ? props.item.groupData : [props.item]
}

const getUnfoldShowSize = () => {
  return isCollapsibleGroup() ? props.item.unfoldShowSize : 0
}

const getDisplayItems = () => {
  const allItems = getAllItems()
  const unfoldSize = getUnfoldShowSize()
  return expanded.value || !unfoldSize ? allItems : allItems.slice(0, unfoldSize)
}

const getRemainingCount = () => {
  const allItems = getAllItems()
  const unfoldSize = getUnfoldShowSize()
  return allItems.length - (unfoldSize || allItems.length)
}
</script>

<template>
    <f7-card class="moment-card">
        <!-- 顶部groupText：仅当不是折叠组时显示 -->
        <div v-if="!isCollapsibleGroup() && getGroupText()" class="moment-group-text-top">
            {{ getGroupText() }}
        </div>
        
        <f7-card-header class="moment-header-single">
            <div class="moment-author-info">
                <img :src="item.avatarUrl" class="moment-avatar" />
                <span class="moment-author-name">{{ item.authorName }}</span>
                <span class="moment-action-time">{{ item.actionText }} · {{ item.timeText }}</span>
            </div>
        </f7-card-header>

        <f7-card-content>
            <f7-list media-list>
                <f7-list-item 
                    v-for="(listItem, index) in getDisplayItems()" 
                    :key="index"
                    class="moment-list-item"
                    @click="$emit('click', listItem)"
                >
                    <div slot="inner" class="moment-item-inner">
                        <div class="moment-item-content">
                            <div slot="title" class="moment-item-title">
                                <h3 v-if="listItem.title" class="moment-title">{{ listItem.title }}</h3>
                            </div>
                            
                            <div slot="text" class="moment-item-excerpt">
                                <div class="moment-excerpt">{{ listItem.excerpt }}</div>
                            </div>
                            
                            <div slot="footer" class="moment-item-metrics">
                                <div class="moment-metrics-row-simple">
                                    <span class="metric">
                                        <f7-icon :ios="'f7:hand_thumbsup'" :md="'material:thumb_up'" size="14" /> {{ listItem.metrics.likes }}
                                    </span>
                                    <span class="metric" v-if="listItem.metrics.comments !== null">
                                        <f7-icon :ios="'f7:bubble_left'" :md="'material:chat_bubble'" size="14" /> {{ listItem.metrics.comments }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </f7-list-item>
            </f7-list>
        </f7-card-content>
        
        <!-- 底部groupText：仅当是折叠组且有剩余项目且未展开时显示 -->
        <f7-card-footer v-if="isCollapsibleGroup() && getRemainingCount() > 0 && !expanded" class="moment-group-text-footer">
            {{ getGroupText() }}
        </f7-card-footer>
        
        <!-- 展开/折叠按钮 -->
        <f7-card-footer v-if="getRemainingCount() > 0" class="moment-expand-footer" @click="toggleExpand">
            <div class="moment-expand-toggle">
                <span class="expand-text">
                    {{ expanded ? '收起' : `查看更多 ${getRemainingCount()} 条` }}
                </span>
                <f7-icon 
                    :ios="expanded ? 'f7:chevron_up' : 'f7:chevron_down'" 
                    :md="expanded ? 'material:keyboard_arrow_up' : 'material:keyboard_arrow_down'"
                    class="expand-icon"
                    size="14"
                />
            </div>
        </f7-card-footer>
    </f7-card>
</template>

<style scoped>
.moment-card {
    margin-bottom: 8px;
}

.moment-group-text-top {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
}

.moment-header-single {
    padding-top: 12px !important;
    padding-bottom: 8px !important;
}

.moment-author-info {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.moment-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
}

.moment-author-name {
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
}

.moment-action-time {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}


.moment-list-item {
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
}

.moment-list-item:last-child {
    border-bottom: none;
}

.moment-item-inner {
    display: flex;
    align-items: flex-start;
    width: 100%;
}

.moment-item-content {
    width: 100%;
}

.moment-item-title {
    margin-bottom: 8px;
}

.moment-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    line-height: 1.4;
    color: #333;
}

.moment-item-excerpt {
    margin-bottom: 12px;
}

.moment-excerpt {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin: 0;
}

.moment-item-metrics {
    margin-top: 8px;
}

.moment-metrics-row-simple {
    display: flex;
    gap: 16px;
    margin: 0;
}

.metric {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4px;
}

/* 展开/折叠按钮样式 */
.moment-expand-footer {
    border-top: 1px solid #f0f0f0;
    cursor: pointer;
    text-align: center;
}

.moment-expand-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
}

.expand-text {
    color: var(--f7-list-item-title-text-color);
}

.expand-icon {
    transition: transform 0.3s ease;
}
</style>