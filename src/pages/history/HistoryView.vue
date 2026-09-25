<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { f7 } from 'framework7-vue';
import { HistoryService } from '@/services/history.js';
import EmptyState from '@/components/EmptyState.vue';

const props = defineProps({
    f7router: Object
});

const activeFilter = ref('all');
const keyword = ref('');

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
    const kw = keyword.value.trim().toLowerCase();
    const items = HistoryService.getRecords(activeFilter.value);
    return kw ? items.filter((r) => `${r.title || ''}${r.preview || ''}`.toLowerCase().includes(kw)) : items;
});

// 搜索无结果、分类无记录、真的没有历史是三件事，提示分别给出下一步
const emptyState = computed(() => {
    const kw = keyword.value.trim();
    if (kw) return { text: `未找到“${kw}”`, subtext: '换个关键词，或清空搜索框查看全部记录' };
    if (activeFilter.value !== 'all') return { text: '该分类暂无记录', subtext: '其他分类可能仍有内容，切到「全部」查看' };
    return { text: '暂无浏览记录', subtext: '浏览过的内容会显示在这里' };
});

const removeOne = (item) => {
    f7.dialog.confirm('删除该历史记录？该操作不可撤消！', '删除', () => {
        HistoryService.removeRecord(item.id, item.type);
    });
};

const formatTime = (ts) => {
    const date = new Date(ts);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const clearAll = () => {
    f7.dialog.confirm('确定要清空所有历史记录吗？', () => HistoryService.clearHistory());
};

const filterTabbarRef = ref(null);

const refreshHighlight = () => {
    nextTick(() => {
        // 按元素而不是类名取：同名 tabbar 有多份时 F7 会把 tab-link 数量相加，高亮宽度就错成一半
        const el = filterTabbarRef.value && (filterTabbarRef.value.$el || filterTabbarRef.value);
        if (el) f7.toolbar.setHighlight(el);
    });
};

onMounted(refreshHighlight);
watch(activeFilter, refreshHighlight);
</script>

<template>
    <f7-page class="history-view">
        <f7-navbar title="最近浏览" back-link="返回">
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".history-searchbar" icon-ios="f7:search"
                    icon-md="material:search" />
                <f7-link icon-f7="trash" @click="clearAll" v-if="filteredItems.length > 0" />
            </f7-nav-right>
            <f7-searchbar class="history-searchbar" custom-search expandable v-model:value="keyword"
                placeholder="搜索浏览记录" clear-button @searchbar:clear="keyword = ''"
                @searchbar:disable="keyword = ''" />
        </f7-navbar>

        <f7-toolbar ref="filterTabbarRef" tabbar top scrollable class="filter-toolbar">
            <f7-link v-for="filter in filters" :key="filter.id" :tab-link="`#tab-${filter.id}`"
                :tab-link-active="activeFilter === filter.id" @click="activeFilter = filter.id">
                {{ filter.label }}
            </f7-link>
        </f7-toolbar>

        <div class="history-content">
            <EmptyState v-if="filteredItems.length === 0" icon="clock" :text="emptyState.text"
                :subtext="emptyState.subtext" />

            <div v-else class="history-list">
                <f7-card v-for="item in filteredItems" :key="item.id + item.type + item.timestamp" class="history-card"
                    @click="$handleCardClick(f7router, item)" @taphold="removeOne(item)">
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
    color: var(--f7-text-color);
    flex: 1;
    min-width: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.title-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.preview-text {
    font-size: 13px;
    color: var(--app-sub-text);
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
    color: var(--app-sub-text);
}

</style>
