<script setup>
import { ref, onMounted, computed } from 'vue';
import $http from '../api/http.js';
import { useHistory } from '../composables/useHistory.js';

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});

const { register, restoreState } = useHistory(props, 'people_more');
const hasHistory = !!restoreState();

const { userId, moreId } = props.f7route.params;
const items = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const lastResult = ref(null);
const pageRef = ref(null);

register({
    state: {
        items,
        isLoading,
        hasMore,
        lastResult
    },
    scroll: () => ({
        main: pageRef.value?.$el?.querySelector('.page-content')
    })
});

const pageTitle = computed(() => {
    return moreId || '更多内容';
});

const getUrl = () => {
    const type = moreId || '';
    if (type.includes('视频合集')) {
        if (type.includes('详情')) {
            return `https://api.zhihu.com/zvideo-collections/collections/${userId}/include?include=answer`;
        } else {
            return `https://api.zhihu.com/zvideo-collections/members/${userId}/collections`;
        }
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

const fetchItems = async (isRefresh = false) => {
    if (isLoading.value) return;
    if (!isRefresh && !hasMore.value) return;

    isLoading.value = true;
    try {
        let res;
        if (isRefresh || !lastResult.value) {
            res = await $http.get(getUrl());
        } else {
            res = await lastResult.value.next();
        }

        const rawList = res.data || [];

        const mapped = rawList.map(item => resolveItem(item));
        if (isRefresh) {
            items.value = mapped;
        } else {
            items.value.push(...mapped);
        }
        lastResult.value = res;
        hasMore.value = !res.paging?.is_end;
    } catch (e) {
        console.error('Failed to fetch items:', e);
    } finally {
        isLoading.value = false;
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
    await fetchItems(true);
    done();
};

const onInfinite = () => {
    fetchItems();
};

const handleItemClick = (f7router, item) => {
    if (item.type === 'zvideo_collection') {
        f7router.navigate(`/people-more/${item.id}/视频合集详情/`);
        return;
    }
    $handleCardClick(f7router, item);
};

onMounted(() => {
    if (!hasHistory) {
        fetchItems(true);
    }
});
</script>

<template>
    <f7-page name="people-more" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite"
        :ref="(el) => pageRef = el">
        <f7-navbar :title="pageTitle" back-link="返回" />

        <f7-list media-list no-hairlines class="more-list">
            <f7-list-item v-for="item in items" :key="item.id" :title="item.title" :subtitle="item.excerpt"
                :footer="item.footer" link @click="handleItemClick(f7router, item)">
                <template #media v-if="item.avatar">
                    <img :src="item.avatar" class="item-avatar" />
                </template>
            </f7-list-item>
        </f7-list>
        <div v-if="!hasMore && items.length > 0" class="padding text-align-center text-color-gray no-more">
            没有更多了
        </div>
        <div v-if="!isLoading && items.length === 0" class="empty-state">
            <f7-icon f7="tray_fill" size="48" color="gray" />
            <p>列表为空</p>
        </div>
    </f7-page>
</template>

<style scoped>
.item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
    color: #8e8e93;
}

.no-more {
    font-size: 13px;
}
</style>
