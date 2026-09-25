<script setup>
import { ref, computed } from 'vue';
import { f7 } from 'framework7-vue';
import { listSaved, removeSaved, clearSaved } from '@/services/local-save.js';
import { formatRelativeTime } from '@/utils/format.js';
import EmptyState from '@/components/EmptyState.vue';

const props = defineProps({
    f7router: Object,
});

const keyword = ref('');
// 每次进入页面重新读，删除与清空后也走它，避免与存储不同步
const entries = ref(listSaved());

const refresh = () => { entries.value = listSaved(); };

const filtered = computed(() => {
    const kw = keyword.value.trim().toLowerCase();
    const sorted = [...entries.value].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    if (!kw) return sorted;
    return sorted.filter((e) => `${e.title || ''}${e.authorName || ''}`.toLowerCase().includes(kw));
});

const emptyState = computed(() => {
    if (keyword.value.trim()) return { text: `未找到“${keyword.value.trim()}”`, subtext: '换个关键词，或清空搜索框查看全部存档' };
    return { text: '还没有本地存档', subtext: '在回答或文章页右上角菜单里选「保存到本地」' };
});

const typeLabel = { answer: '回答', article: '文章', zvideo: '视频', pin: '想法' };

const openEntry = (entry) => {
    props.f7router.navigate(`/local/content/${entry.type}/${entry.id}`);
};

const removeOne = (entry) => {
    f7.dialog.confirm(`删除「${entry.title}」的本地存档？`, '删除', () => {
        removeSaved(entry.type, entry.id);
        refresh();
    });
};

const clearAll = () => {
    f7.dialog.confirm('确定要清空所有本地存档吗？', () => {
        clearSaved();
        refresh();
    });
};
</script>

<template>
    <f7-page class="local-list-view">
        <f7-navbar title="本地内容" back-link="返回">
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".local-searchbar" icon-ios="f7:search"
                    icon-md="material:search" />
                <f7-link icon-f7="trash" v-if="filtered.length > 0" @click="clearAll" />
            </f7-nav-right>
            <f7-searchbar class="local-searchbar" custom-search expandable v-model:value="keyword"
                placeholder="搜索本地存档" clear-button @searchbar:clear="keyword = ''"
                @searchbar:disable="keyword = ''" />
        </f7-navbar>

        <div class="local-content">
            <EmptyState v-if="filtered.length === 0" icon="archivebox" :text="emptyState.text" :subtext="emptyState.subtext" />

            <f7-list v-else strong inset media-list>
                <f7-list-item v-for="entry in filtered" :key="entry.type + '_' + entry.id" :title="entry.title"
                    :subtitle="`${entry.authorName} · ${typeLabel[entry.type] || '内容'} · ${formatRelativeTime(entry.savedAt) || '已保存'}`"
                    :text="entry.droppedImages ? `${entry.segCount} 段，${entry.droppedImages} 张配图未保存` : `${entry.segCount} 段`"
                    link @click="openEntry(entry)" @taphold="removeOne(entry)" />
            </f7-list>
        </div>
    </f7-page>
</template>

<style scoped>
.local-content {
    padding-bottom: 32px;
}
</style>
