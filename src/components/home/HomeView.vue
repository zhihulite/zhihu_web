<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import FeedCard from '../FeedCard.vue';
import HotListCard from '../HotListCard.vue';
import PullToRefresh from '../PullToRefresh.vue';
import MobileTabLayout from '../MobileTabLayout.vue';
import MaterialSymbol from '../MaterialSymbol.vue';
import { THOUGHTS_DATA, DAILY_DATA } from '../../services/mockData';
import $http from '../../api/http.js';
import { homeCardRender } from '../../services/homeCardRender.js';

const router = useRouter();
const isMobile = ref(false);

const activeTab = ref('recommend');
const homeFollowingTab = ref('selected');

const recommendList = ref([]);
const hasMoreRecommend = ref(true);
const isRecommendLoading = ref(false);

const hotList = ref([]);
const isHotLoading = ref(false);

const dailyList = ref([...DAILY_DATA]);

const tabs = [
    { id: 'recommend', label: '推荐', icon: 'home' },
    { id: 'following', label: '关注', icon: 'group' },
    { id: 'hot', label: '热榜', icon: 'local_fire_department' },
    { id: 'thoughts', label: '想法', icon: 'emoji_objects' }
];

const followingTabs = [
    { id: 'selected', label: '精选' },
    { id: 'latest', label: '最新' },
    { id: 'thoughts', label: '想法' }
];

const handleResize = () => {
    if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < 768;
    }
};

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchRecommendData(true);
});

const handleArticleClick = (item) => {
    const type = homeCardRender.getDataType(item);
    const id = homeCardRender.getId(item);

    if (type == "question") {
        router.push(`/question/${item.id}`);
    } else {
        router.push(`/article/${type}/${id}`);
    }

};

const handleUserClick = (userId) => {
    router.push(`/user/${userId}`);
};


const fetchRecommendData = async (isRefresh = false) => {
    if (isRecommendLoading.value) return;
    isRecommendLoading.value = true;

    try {
        const res = await $http.get('https://api.zhihu.com/topstory/recommend', {
            isWWW: true
        });

        const dataWithHref = (res.data || []).map(item => {
            const header = homeCardRender.formatTitle(item);
            const type = homeCardRender.getDataType(item);
            const id = homeCardRender.getId(item);
            const href = `./content/${type}/${id}`;
            return {
                ...item,
                id: id,
                title: header || '无标题',
                excerpt: item.target?.excerpt || item.excerpt || '',
                metrics: {
                    likes: item.target?.voteup_count || 0,
                    comments: item.target?.comment_count || 0
                },
                author: item.target?.author || item.author,
                href
            };
        });

        if (isRefresh) {
            recommendList.value = dataWithHref;
        } else {
            recommendList.value = [...recommendList.value, ...dataWithHref];
        }

        hasMoreRecommend.value = !res.paging?.is_end;

    } catch (e) {
        console.error("Failed to fetch recommend data", e);
    } finally {
        isRecommendLoading.value = false;
    }
};

const fetchHotData = async () => {
    if (isHotLoading.value) return;
    isHotLoading.value = true;

    try {
        const url = 'https://api.zhihu.com/topstory/hot-lists/total?limit=50&mobile=true';
        const res = await $zhihu.get(url);

        const list = (res.data || []).map((item, i) => {
            const target = item.target || {};
            const imageArea = target.image_area || {};
            const titleArea = target.title_area || {};
            const metricsArea = target.metrics_area || {};
            const linkInfo = target.link || {};

            return {
                id: item.card_id.split("Q_")[1],
                rank: i + 1,
                title: titleArea.text || '无标题',
                metricsArea: metricsArea.text || '',
                url: linkInfo.url || '',
                type: "question",
                thumbnailSrc: imageArea.url || ''
            };
        });

        hotList.value = list;

    } catch (e) {
        console.error("Failed to fetch hot data", e);
    } finally {
        isHotLoading.value = false;
    }
};

const onRefresh = async () => {
    if (activeTab.value === 'recommend') {
        await fetchRecommendData(true);
    } else if (activeTab.value === 'hot') {
        await fetchHotData();
    } else {
        await new Promise(r => setTimeout(r, 1000));
    }
};

const onLoadMore = () => {
    if (activeTab.value === 'recommend' && hasMoreRecommend.value) {
        fetchRecommendData(false);
    }
};

watch(activeTab, (newTab) => {
    if (newTab === 'hot' && hotList.value.length === 0) {
        fetchHotData();
    }
});

</script>

<template>
    <div class="home-view" :class="{ 'is-mobile': isMobile, 'is-desktop': !isMobile }">
        <div v-if="!isMobile" class="desktop-header">
            <s-tab style="justify-content: center;">
                <s-tab-item v-for="tab in tabs" :key="tab.id" :selected="activeTab === tab.id"
                    @click="activeTab = tab.id">
                    <div slot="text">{{ tab.label }}</div>
                </s-tab-item>
            </s-tab>
        </div>

        <div class="content-area">

            <div v-show="activeTab === 'recommend'" class="tab-content">
                <PullToRefresh :onRefresh="onRefresh" :onLoadMore="hasMoreRecommend ? onLoadMore : null">
                    <div class="card-grid">
                        <div class="masonry-item" v-for="(item, index) in recommendList" :key="item.id + '-' + index">
                            <FeedCard :item="item" @click="handleArticleClick(item)" @userClick="handleUserClick" />
                        </div>
                        <div class="load-more">
                            <div v-if="!hasMoreRecommend && recommendList.length > 0" class="end-marker">没有更多内容了</div>
                        </div>
                    </div>
                </PullToRefresh>
            </div>

            <div v-show="activeTab === 'following'" class="tab-content">
                <MobileTabLayout :tabs="followingTabs" :activeId="homeFollowingTab"
                    :onChange="(id) => homeFollowingTab = id">
                    <template #selected>
                        <PullToRefresh :onRefresh="onRefresh">
                            <div class="card-grid">
                                <div v-for="(item, index) in recommendList.slice(0, 2)" :key="'sel-' + index"
                                    class="masonry-item">
                                    <FeedCard :item="item" @click="handleArticleClick(item)"
                                        @userClick="handleUserClick" />
                                </div>
                            </div>
                        </PullToRefresh>
                    </template>
                    <template #latest>
                        <PullToRefresh :onRefresh="onRefresh">
                            <div class="list-layout">
                                <FeedCard v-for="(item, index) in dailyList" :key="'lat-' + index" :item="item"
                                    @click="handleArticleClick(item)" />
                                <div class="end-marker">已加载全部最新内容</div>
                            </div>
                        </PullToRefresh>
                    </template>
                    <template #thoughts>
                        <PullToRefresh :onRefresh="onRefresh">
                            <div class="card-grid">
                                <div v-for="item in THOUGHTS_DATA" :key="item.id" class="masonry-item">
                                    <FeedCard :item="item" isThought @click="handleArticleClick(item)"
                                        @userClick="handleUserClick" />
                                </div>
                            </div>
                        </PullToRefresh>
                    </template>
                </MobileTabLayout>
            </div>

            <div v-show="activeTab === 'hot'" class="tab-content">
                <PullToRefresh :onRefresh="onRefresh">
                    <div class="list-layout">
                        <HotListCard v-for="(item, index) in hotList" :key="item.id" :item="item" :rank="index + 1"
                            @click="handleArticleClick(item)" />
                    </div>
                </PullToRefresh>
            </div>

            <div v-show="activeTab === 'thoughts'" class="tab-content">
                <PullToRefresh :onRefresh="onRefresh">
                    <div class="card-grid">
                        <div v-for="item in THOUGHTS_DATA" :key="'t-' + item.id" class="masonry-item">
                            <FeedCard :item="item" isThought @click="handleArticleClick(item)"
                                @userClick="handleUserClick" />
                        </div>
                    </div>
                </PullToRefresh>
            </div>

        </div>

        <div v-if="isMobile" class="mobile-nav">
            <s-navigation mode="bottom">
                <s-navigation-item v-for="tab in tabs" :key="tab.id" :selected="activeTab === tab.id"
                    @click="activeTab = tab.id">
                    <MaterialSymbol slot="icon" :icon="tab.icon" :fill="activeTab === tab.id" />
                    <div slot="text">{{ tab.label }}</div>
                </s-navigation-item>
            </s-navigation>
        </div>

    </div>
</template>

<style scoped>
.home-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--md-sys-color-surface);
}

.is-desktop {
    max-width: 900px;
    margin: auto;
    border-left: 1px solid var(--md-sys-color-outline-variant);
    border-right: 1px solid var(--md-sys-color-outline-variant);
    width: 100%;
}

.desktop-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--md-sys-color-surface);
    padding-top: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.content-area {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.tab-content {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    background-color: var(--md-sys-color-surface);
}

.card-grid {
    padding: 16px;
    column-count: 1;
    column-gap: 16px;
    padding-bottom: 80px;
}

@media (min-width: 768px) {
    .card-grid {
        column-count: 2;
    }
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 16px;
}

.list-layout {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 80px;
}

.load-more {
    display: flex;
    justify-content: center;
    padding: 16px;
    flex-direction: column;
    align-items: center;
}

.end-marker {
    text-align: center;
    padding: 16px;
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.5;
}

.mobile-nav {
    flex-shrink: 0;
    z-index: 50;
}
</style>
