<script setup>
import MomentListCard from './MomentListCard.vue';

const props = defineProps(['item'])
defineEmits(['click'])
</script>

<template>
    <!-- 专门处理折叠卡片的组件 -->
    <div class="collapsible-moment-card-container">
        <!-- 分组标题 - 只有当unfoldShowSize < 卡片总数时才显示 -->
        <div v-if="item.unfoldShowSize < item.groupData.length" class="collapsible-moment-group-header">
            <h3 class="collapsible-moment-group-title">{{ item.groupText }}</h3>
            <span class="collapsible-moment-group-count">
                共 {{ item.groupData.length }} 条内容
            </span>
        </div>
        
        <!-- 默认显示的卡片 - 直接展示在外部，传递items数组 -->
        <div class="default-cards-wrapper">
            <MomentListCard 
                :items="item.groupData.slice(0, item.unfoldShowSize)" 
                :group-text="item.unfoldShowSize < item.groupData.length ? item.groupText : ''"
                @click="$emit('click', $event)" 
            />
        </div>
        
        <!-- 剩余卡片 - 使用Accordion组件折叠，默认关闭，传递剩余items数组 -->
        <f7-accordion v-if="item.groupData.length > item.unfoldShowSize">
            <f7-accordion-item :opened="false">
                <!-- Accordion Toggle - 点击此处展开/折叠剩余卡片 -->
                <f7-accordion-toggle class="collapsible-moment-toggle">
                    <div class="collapsible-moment-toggle-content">
                        <span class="collapsible-moment-toggle-text">
                            查看更多 {{ item.groupData.length - item.unfoldShowSize }} 条
                        </span>
                    </div>
                </f7-accordion-toggle>
                
                <!-- Accordion Content - 展开后显示的剩余卡片 -->
                <f7-accordion-content>
                    <MomentListCard 
                        :items="item.groupData.slice(item.unfoldShowSize)" 
                        :group-text="''"
                        @click="$emit('click', $event)" 
                    />
                </f7-accordion-content>
            </f7-accordion-item>
        </f7-accordion>
    </div>
</template>

<style scoped>
/* 容器样式 */
.collapsible-moment-card-container {
    margin-bottom: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 分组标题样式 */
.collapsible-moment-group-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
}

.collapsible-moment-group-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #333;
}

.collapsible-moment-group-count {
    font-size: 14px;
    color: #999;
}

/* 折叠按钮样式 */
.collapsible-moment-toggle {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 0;
}

.collapsible-moment-toggle-content {
    padding: 12px;
    text-align: center;
}

.collapsible-moment-toggle-text {
    font-size: 14px;
    color: #1989fa;
    font-weight: 500;
}

/* 展开后显示的卡片 */
:deep(.f7-accordion-content .moment-card) {
    margin-bottom: 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: 1px solid #e0e0e0;
}
</style>