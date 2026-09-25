<script setup>
import { onMounted, computed } from 'vue';
import $http from '@/services/http.js';
import { usePageState } from '@/composables/usePageState.js';
import { usePagedList } from '@/composables/usePagedList.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const { userId, moreId } = props.f7route.params;

const { page, loading, refresh, loadMore, ensureLoaded } = usePagedList({
    name: '更多内容',
    fetch: (signal) => $http.get(getUrl(), { signal }),
    map: (item) => resolveItem(item),
});

const { hasCache } = usePageState({
    state: { page },
    loading,
});

const pageTitle = computed(() => {
    return moreId || '更多内容';
});

const getUrl = () => {
    const type = moreId || '';
    if (type.includes('视频合集')) {
        if (type.includes('详情')) {
            return `https://api.zhihu.com/zvideo-collections/collections/${userId}/include?limit=10&include=answer`;
        } else {
            return `https://api.zhihu.com/zvideo-collections/members/${userId}/collections?limit=10`;
        }
    }

    if (type.includes('划线')) {
        return `https://www.zhihu.com/api/v4/members/${userId}/segments?limit=10`;
    }

    let gettype = '';
    if (type.includes('专栏')) gettype = 'columns';
    else if (type.includes('话题')) gettype = 'topics';
    else if (type.includes('问题')) gettype = 'questions';
    else if (type.includes('圆桌')) gettype = 'roundtables';
    else if (type.includes('专题')) gettype = 'news_specials';

    if (gettype) {
        return `https://api.zhihu.com/people/${userId}/following_${gettype}`;
    }
};

const resolveItem = (item) => {
    const type = moreId || '';
    const targetItem = item.target || item;

    let mainType = '';
    if (type.includes('视频合集')) mainType = '视频合集';
    else if (type.includes('专栏')) mainType = '专栏';
    else if (type.includes('话题')) mainType = '话题';
    else if (type.includes('问题')) mainType = '问题';

    let title = '', excerpt = '', footer = '', id = '', targetType = '';

    switch (mainType) {
        case '视频合集':
            if (type.includes('详情')) {
                title = targetItem.title;
                excerpt = targetItem.description;
                footer = `${targetItem.play_count || 0}个播放`;
                id = targetItem.id;
                targetType = 'zvideo';
            } else {
                title = targetItem.name;
                excerpt = targetItem.description;
                footer = `${targetItem.zvideo_count || 0}个视频 · ${targetItem.voteup_count || 0}个赞同`;
                id = targetItem.id;
                targetType = 'zvideo_collection';
            }
            break;

        case '专栏':
            title = targetItem.title;
            excerpt = targetItem.description;
            footer = `${targetItem.items_count || 0}篇内容 · ${targetItem.voteup_count || 0}个赞同`;
            id = targetItem.id;
            targetType = 'column';
            break;

        case '话题':
            title = targetItem.name;
            excerpt = targetItem.excerpt || targetItem.description;
            id = targetItem.id;
            targetType = 'topic';
            break;

        case '问题':
            title = targetItem.title;
            footer = `${targetItem.answer_count || 0}个回答 · ${targetItem.follower_count || 0}个关注`;
            id = targetItem.id;
            targetType = 'question';
            break;

        default:
            title = targetItem.title || targetItem.name || '无标题';
            excerpt = targetItem.excerpt || targetItem.description || targetItem.headline || '';
            id = targetItem.id;
            targetType = targetItem.type || 'article';
            break;
    }

    const avatar = targetItem.avatar_url || targetItem.image_url || (targetItem.author?.avatar_url);
    return {
        id,
        type: targetType,
        title,
        excerpt,
        footer,
        avatar,
    };
};

const onRefresh = async (done) => {
    await refresh();
    done();
};

const onInfinite = () => {
    loadMore();
};

const handleItemClick = (f7router, item) => {
    if (item.type === 'zvideo_collection') {
        f7router.navigate(`/people-more/${item.id}/视频合集详情/`);
        return;
    }
    $handleCardClick(f7router, item);
};

onMounted(() => {
    if (!hasCache.value) {
        ensureLoaded();
    }
});
</script>

<template>
    <f7-page name="people-more" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite">
        <f7-navbar :title="pageTitle" back-link="返回" />

        <f7-list media-list no-hairlines class="more-list">
            <f7-list-item v-for="item in page.list" :key="item.id" :title="item.title" :subtitle="item.excerpt"
                :footer="item.footer" link @click="handleItemClick(f7router, item)">
                <template #media v-if="item.avatar">
                    <img :src="item.avatar" class="item-avatar" />
                </template>
            </f7-list-item>
        </f7-list>
        <LoadMoreFooter :has-more="page.hasMore" :length="page.list.length" />
        <EmptyState v-if="!loading && page.list.length === 0" icon="tray_fill" text="列表为空" />
    </f7-page>
</template>

<style scoped>
.item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
}

</style>
