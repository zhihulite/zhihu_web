<script setup>
import { onMounted } from 'vue';
import $http from '@/services/http.js';
import FeedCard from '@/components/FeedCard.vue';
import { usePageState } from '@/composables/usePageState.js';
import { usePagedList } from '@/composables/usePagedList.js';
import { authorOf, voteupOf, commentCountOf, unwrap, normalizeType } from '@/mappers/zhihu-item.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const columnId = props.f7route.params.id;

const { page, loading, refresh, loadMore, ensureLoaded } = usePagedList({
    name: '专栏内容',
    // 幽默知乎网页api 不填写url参数无法访问
    fetch: (signal) => $http.get(`https://api.zhihu.com/columns/${columnId}/items?limit=20`, { isWWW: true, signal }),
    map: (item) => resolveItem(item),
});

const { hasCache } = usePageState({
    state: { page },
    loading,
});

const resolveItem = (raw) => {
    // 列表项可能是 target/object 包装，与其余列表页同一口径剥壳归一
    const item = unwrap(raw);
    const author = authorOf(item);
    const likes = voteupOf(item);
    const comments = commentCountOf(item);
    let excerpt = item.excerpt || '';
    let action = '';
    const id = item.id || '';
    const type = normalizeType(item.type || '');
    let title = '';

    switch (type) {
        case 'answer':
            action = '添加了回答';
            title = item.question?.title || '未知问题';
            break;
        case 'zvideo':
            action = '添加了视频';
            title = item.title || '未知视频';
            excerpt = item.excerpt || '[视频]';
            break;
        case 'article':
            action = '添加了文章';
            title = item.title || '未知文章';
            break;
        default:
            action = '未知';
            title = item.title || item.name || '无标题';
            break;
    }

    // 专栏条目的语义是「某人添加了某类内容」，动作合进卡片的作者行文案
    const displayName = author.name === '匿名用户' ? '' : author.name;

    return {
        id,
        type,
        title,
        excerpt,
        authorName: `${displayName} ${action}`.trim(),
        metrics: {
            likes,
            comments
        }
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
    <f7-page name="column-items" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite">
        <f7-navbar title="专栏详情" back-link="返回" />

        <div class="items-list">
            <FeedCard v-for="(item, index) in page.list" :key="item.id + '-' + index" :item="item"
                @click="$handleCardClick(f7router, item)" />
        </div>

        <LoadMoreFooter :has-more="page.hasMore" :length="page.list.length" text="已加载全部内容" />
        <EmptyState v-if="!loading && page.list.length === 0" icon="tray_fill" text="该专栏暂无内容" />
    </f7-page>
</template>
