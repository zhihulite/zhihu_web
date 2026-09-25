<script setup>
import { onMounted, computed } from 'vue';
import $http from '@/services/http.js';
import { usePageState } from '@/composables/usePageState.js';
import { usePagedList } from '@/composables/usePagedList.js';
import { unwrap, normalizeType, titleOf, excerptOf, voteupOf, commentCountOf } from '@/mappers/zhihu-item.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const { type, q, id } = props.f7route.params;

const { page, loading, refresh, loadMore, ensureLoaded } = usePagedList({
    name: '搜索结果',
    fetch: (signal) => {
        const url = getUrl();
        return url ? $http.get(url, { isWWW: true, signal }) : null;
    },
    map: (item) => resolveItem(item),
});

const { hasCache } = usePageState({
    state: { page },
    loading,
});

const pageTitle = computed(() => {
    return '搜索结果';
});

const getUrl = () => {
    const encodedQ = encodeURIComponent(q);
    switch (type) {
        case 'people':
            const userId = id || '';
            return `https://www.zhihu.com/api/v4/search_v3?correction=1&t=general&q=${encodedQ}&restricted_scene=member&restricted_field=member_hash_id&restricted_value=${userId}`;
        case 'collection':
            return `https://www.zhihu.com/api/v4/search_v3?gk_version=gz-gaokao&q=${encodedQ}&t=favlist&lc_idx=0&correction=1&offset=0&advertCount=0&limit=20&is_real_time=0&show_all_topics=0&search_source=History&filter_fields=&city=&pin_flow=false&ruid=undefined&recq=undefined&is_merger=1&raw_query=page_source%3Dmy_collection`;
        default:
            return '';
    }
};

const resolveItem = (item) => {
    const obj = unwrap(item);
    const cleanText = (text = '') => text.replace(/<[^>]*>?/gm, '');
    const type = normalizeType(obj.type);

    let likes = voteupOf(obj) || obj.like_count || 0;
    let comments = commentCountOf(obj);
    let excerpt = cleanText(excerptOf(obj));
    let title = cleanText(titleOf(obj));
    let action = '';

    switch (type) {
        case 'answer':
            action = '添加了回答';
            break;

        case 'topic':
            action = '添加了话题';
            title = obj.name || title;
            break;

        case 'question':
            action = '添加了问题';
            break;

        case 'column':
            action = '添加了专栏';
            comments = obj.items_count || comments;
            break;

        case 'pin':
            action = '添加了想法';
            excerpt = obj.content?.[0]?.content || '';
            likes = obj.like_count || likes;
            title = (obj.author?.name || '匿名') + '发布了想法';
            break;

        case 'zvideo':
            action = '添加了视频';
            break;

        default:
            console.warn(item);
            action = '未知';
            break;
    }

    return {
        id: obj.id,
        type,
        title,
        excerpt,
        action,
        metrics: { likes, comments },
    };
};

const onRefresh = async (done) => {
    await refresh();
    done();
};

const onInfinite = () => {
    loadMore();
};

onMounted(() => {
    if (!hasCache.value) {
        ensureLoaded();
    }
});
</script>

<template>
    <f7-page name="search-result" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite">
        <f7-navbar :title="pageTitle" back-link="返回" />

        <div class="search-list">
            <f7-card v-for="(item, index) in page.list" :key="item.id ?? index" class="search-item-card"
                @click="$handleCardClick(f7router, item)">
                <div class="card-header-custom" v-if="item.action">
                    <span class="action-text">{{ item.action }}</span>
                </div>
                <div class="card-content-custom">
                    <div class="title">{{ item.title }}</div>
                    <div class="excerpt" v-if="item.excerpt">{{ item.excerpt }}</div>

                    <div class="metrics" v-if="item.metrics">
                        <span v-if="item.metrics.likes > 0">{{ item.metrics.likes }} 赞同</span>
                        <span v-if="item.metrics.likes > 0 && item.metrics.comments > 0"> · </span>
                        <span v-if="item.metrics.comments > 0">{{ item.metrics.comments }} 评论</span>
                    </div>
                </div>
            </f7-card>
        </div>

        <LoadMoreFooter :has-more="page.hasMore" :length="page.list.length" />
        <EmptyState v-if="!loading && page.list.length === 0" icon="search" text="未找到相关内容" />
    </f7-page>
</template>

<style scoped>
.search-item-card {
    margin: 8px 12px;
    padding: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.card-header-custom {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--app-sub-text);
}

.title {
    font-size: 16px;
    font-weight: bold;
    color: var(--f7-text-color);
    margin-bottom: 6px;
    line-height: 1.4;
}

.excerpt {
    font-size: 14px;
    color: var(--app-sub-text);
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
}

.metrics {
    font-size: 12px;
    color: var(--app-sub-text);
}

</style>
