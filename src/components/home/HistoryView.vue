<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { f7 } from 'framework7-vue';
import { HistoryService } from '../../services/historyService.js';

const props = defineProps({
    f7router: Object
});

const activeFilter = ref('all');

const filters = [
    { id: 'all', label: '全部' },
    { id: 'answer', label: '回答' },
    { id: 'pin', label: '想法' },
    { id: 'article', label: '文章' },
    { id: 'question', label: '问题' },
    { id: 'people', label: '用户' },
    { id: 'topic', label: '话题' },
    { id: 'zvideo', label: '视频' }
];

const filteredItems = computed(() => {
    return HistoryService.getRecords(activeFilter.value);
});

const formatTime = (ts) => {
    const date = new Date(ts);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const clearAll = () => {
    HistoryService.clearHistory();
};

const refreshHighlight = () => {
    nextTick(() => {
        f7.toolbar.setHighlight('.filter-toolbar');
    });
};

onMounted(refreshHighlight);
watch(activeFilter, refreshHighlight);
</script>

<template>
    <f7-page class="history-view">
        <f7-navbar title="最近浏览" back-link="返回">
            <f7-nav-right>
                <f7-link icon-f7="trash" @click="clearAll" v-if="filteredItems.length > 0" />
            </f7-nav-right>
        </f7-navbar>

        <f7-toolbar tabbar top scrollable class="filter-toolbar">
            <f7-link v-for="filter in filters" :key="filter.id" :tab-link="`#tab-${filter.id}`"
                :tab-link-active="activeFilter === filter.id" @click="activeFilter = filter.id">
                {{ filter.label }}
            </f7-link>
        </f7-toolbar>

        <div class="history-content">
            <div v-if="filteredItems.length === 0" class="empty-state">
                <f7-icon f7="clock" size="48" color="gray" />
                <p>暂无浏览记录</p>
            </div>

            <div v-else class="history-list">
                <f7-card v-for="item in filteredItems" :key="item.id + item.type + item.timestamp" class="history-card"
                    @click="$handleCardClick(f7router, item)">
                    <div class="card-inner">
                        <div class="info-side">
                            <div class="title-row">
                                <span class="history-title">{{ item.title }}</span>
                            </div>
                            <div class="preview-text">{{ item.preview }}</div>
                            <div class="footer-row">
                                <f7-chip outline class="type-tag">{{filters.find(f => f.id === item.type)?.label ||
                                    '内容'}}</f7-chip>
                                <span class="time-text">{{ formatTime(item.timestamp) }}</span>
                            </div>
                        </div>
                    </div>
                </f7-card>
            </div>
        </div>
    </f7-page>
</template>

<style scoped>
.filter-toolbar {
    --f7-toolbar-background-color: #fff;
    z-index: 100;
}

.history-content {
    padding-bottom: 32px;
}

.history-card {
    margin: 12px 16px !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
    cursor: pointer;
    transition: transform 0.2s;
}

.card-inner {
    padding: 16px;
}

.info-side {
    flex: 1;
    min-width: 0;
}

.history-title {
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

.preview-text {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.footer-row {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
}

.time-text {
    color: #999;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 32px;
    color: #999;
}
</style>
