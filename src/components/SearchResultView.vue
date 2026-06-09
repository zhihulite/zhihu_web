<script setup>
import { ref, onMounted, computed } from 'vue';
import $http from '../api/http.js';
import { useHistory } from '../composables/useHistory.js';

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});

const { register, restoreState } = useHistory(props, 'search_result');
const hasHistory = !!restoreState();

const { type, q, id } = props.f7route.params;
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

const fetchItems = async (isRefresh = false) => {
    if (isLoading.value) return;
    if (!isRefresh && !hasMore.value) return;

    isLoading.value = true;
    try {
        let res;
        if (isRefresh || !lastResult.value) {
            const url = getUrl();
            if (!url) {
                isLoading.value = false;
                return;
            }
            res = await $http.get(url, { isWWW: true });
        } else {
            res = await lastResult.value.next();
        }

        const rawList = res.data;
        const mapped = rawList.map(item => resolveItem(item)).filter(i => i !== null);
        if (isRefresh) {
            items.value = mapped;
        } else {
            items.value.push(...mapped);
        }
        lastResult.value = res;
        hasMore.value = !res.paging?.is_end;
    } catch (e) {
        console.error('Failed to fetch search results:', e);
    } finally {
        isLoading.value = false;
    }
};

const resolveItem = (item) => {
    const obj = item.object || item;

    // 提前清洗标题和摘要中的 HTML 标签
    const cleanText = (text = '') => text.replace(/<[^>]*>?/gm, '');
    const id = obj.id;
    const type = obj.type === 'pin_general' ? 'pin' : obj.type;

    let likes = obj.voteup_count || obj.like_count || 0;
    let comments = obj.comment_count || 0;
    let excerpt = cleanText(obj.excerpt);
    let title = cleanText(obj.excerpt_title || obj.title || '');
    let action = '';


    switch (type) {
        case 'answer':
            action = '添加了回答';
            title = obj.question?.title || title;
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
            itemType = 'pin';
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
        id,
        type,
        title,
        excerpt,
        action,
        metrics: { likes, comments },
    };
};

const onRefresh = async (done) => {
    await fetchItems(true);
    done();
};

const onInfinite = () => {
    fetchItems();
};

onMounted(() => {
    if (!hasHistory) {
        fetchItems(true);
    }
});
</script>

<template>
    <f7-page name="search-result" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite"
        :ref="(el) => pageRef = el">
        <f7-navbar :title="pageTitle" back-link="返回" />

        <div class="search-list">
            <f7-card v-for="(item, index) in items" :key="index" class="search-item-card"
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

        <div v-if="!hasMore && items.length > 0" class="padding text-align-center text-color-gray no-more">
            没有更多了
        </div>
        <div v-if="!isLoading && items.length === 0" class="empty-state">
            <f7-icon f7="search" size="48" color="gray" />
            <p>未找到相关内容</p>
        </div>
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
    color: #999;
}

.title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 6px;
    line-height: 1.4;
}

.excerpt {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
}

.metrics {
    font-size: 12px;
    color: #999;
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
