<script setup>
// src/components/AtUserSheet.vue
// @用户选择弹层：按 keyword 防抖搜 people/ats，选中后回传 { id, name } 并关闭。
import { ref, watch, nextTick } from 'vue';
import $http from '@/services/http.js';
import { usePagedList } from '@/composables/usePagedList.js';
import { userOf } from '@/mappers/zhihu-item.js';
import { debounce } from '@/utils/timing.js';
import EmptyState from '@/components/EmptyState.vue';

const props = defineProps({
    modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'select']);

const keyword = ref('');
const searchbarRef = ref(null);

const { page, loading, refresh, loadMore } = usePagedList({
    name: '@用户',
    fetch: (signal) => $http.get(
        `https://api.zhihu.com/people/ats?offset=0&limit=20&scene=comment_editor&q=${encodeURIComponent(keyword.value)}`,
        { signal }
    ),
    map: (item) => {
        const user = userOf(item);
        return user.id ? user : null;
    },
});

// 引擎的在途锁会挡回并发刷新，故末次输入与已发起的查询不一致时再补一次，保证搜索词跟得上输入
const runSearch = async () => {
    const queried = keyword.value;
    await refresh();
    if (queried !== keyword.value) debouncedSearch();
};
const debouncedSearch = debounce(runSearch, 300);

watch(keyword, debouncedSearch);

watch(() => props.modelValue, (opened) => {
    if (!opened) return;
    keyword.value = '';
    debouncedSearch();
    nextTick(() => searchbarRef.value?.$el?.querySelector('input')?.focus());
});

const pick = (user) => {
    emit('select', user);
    emit('update:modelValue', false);
};

const close = () => emit('update:modelValue', false);
</script>

<template>
    <f7-sheet class="sheet-bottom at-user-sheet" :opened="modelValue" @sheet:closed="close" style="height: 65vh;"
        swipe-to-close backdrop>
        <div class="sheet-modal-inner">
            <div class="sheet-header">
                <span class="title">选择用户</span>
                <f7-link icon-only @click="close">
                    <f7-icon ios="f7:multiply" md="material:close" />
                </f7-link>
            </div>
            <!-- 搜索条不与 .page-content 平级：F7 的 .searchbar~* 会给后面的 page-content 记一次
                 --f7-page-searchbar-offset 顶部留白，而这里的搜索条本就占着流内高度 -->
            <div class="at-search-row">
                <f7-searchbar ref="searchbarRef" custom-search v-model:value="keyword" placeholder="搜索用户"
                    :disable-button="false" clear-button></f7-searchbar>
            </div>

            <f7-page-content class="sheet-scroll-body" infinite @infinite="loadMore">
                <f7-list media-list no-hairlines-md>
                    <f7-list-item v-for="user in page.list" :key="user.id" :title="user.name"
                        :subtitle="user.headline" link @click="pick(user)">
                        <template #media>
                            <img :src="user.avatarUrl" class="at-avatar" />
                        </template>
                    </f7-list-item>
                </f7-list>
                <EmptyState v-if="!loading && page.list.length === 0" icon="person" text="没有找到用户" />
            </f7-page-content>
        </div>
    </f7-sheet>
</template>

<style scoped>
.at-user-sheet .sheet-header {
    padding: 12px 16px;
}

.at-search-row {
    flex-shrink: 0;
}

.at-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}
</style>
