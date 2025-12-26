<script setup>
import { ref, onMounted, watch } from 'vue';
import TopBar from '../TopBar.vue';
import FeedCard from '../FeedCard.vue';
import HotListCard from '../HotListCard.vue';
import TabLayout from '../TabLayout.vue';
import { THOUGHTS_DATA, DAILY_DATA } from '../../services/mockData';
import $http from '../../api/http.js';
import { homeCardRender } from '../../services/homeCardRender.js';

const props = defineProps({
    f7router: Object
});

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
        props.f7router.navigate(`/question/${item.id}`);
    } else {
        props.f7router.navigate(`/article/${type}/${id}`);
    }
};

const handleUserClick = (userId) => {
    props.f7router.navigate(`/user/${userId}`);
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
        const res = await $http.get(url);

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

const onRecommendRefresh = async (done) => {
    await fetchRecommendData(true);
    done();
};

const onRecommendInfinite = () => {
    if (hasMoreRecommend.value && !isRecommendLoading.value) {
        fetchRecommendData(false);
    }
};

const onHotRefresh = async (done) => {
    await fetchHotData();
    done();
};

const onFollowingRefresh = async (done) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    done();
};

const onThoughtsRefresh = async (done) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    done();
};

const onFollowingInfinite = () => {
    console.log('Loading more following content...');
    // Mock loading more for demonstration
};

const onHotInfinite = () => {
    console.log('Loading more hot content...');
};

const onThoughtsInfinite = () => {
    console.log('Loading more thoughts...');
};

watch(activeTab, (newTab) => {
    if (newTab === 'hot' && hotList.value.length === 0) {
        fetchHotData();
    }
});

const getTabLinkClass = (id) => {
    return activeTab.value === id ? 'tab-link-active' : '';
}
</script>

<template>
    <!-- 不使用:page-content='false' 使用后处理双重tab较麻烦 -->
    <f7-page name="home">
        <!-- Using TopBar here -->
        <template #fixed>
            <TopBar :f7router="f7router" />

            <!-- Desktop Tabbar -->
            <f7-toolbar tabbar top v-if="!isMobile">
                <f7-link tab-link="#tab-recommend" :tab-link-active="activeTab === 'recommend'"
                    @click="activeTab = 'recommend'">推荐</f7-link>
                <f7-link tab-link="#tab-following" :tab-link-active="activeTab === 'following'"
                    @click="activeTab = 'following'">关注</f7-link>
                <f7-link tab-link="#tab-hot" :tab-link-active="activeTab === 'hot'"
                    @click="activeTab = 'hot'">热榜</f7-link>
                <f7-link tab-link="#tab-thoughts" :tab-link-active="activeTab === 'thoughts'"
                    @click="activeTab = 'thoughts'">想法</f7-link>
            </f7-toolbar>
        </template>

        <f7-tabs class="tabs-auto-page-content" animated>
            <f7-tab id="tab-recommend" tab-active>
                <f7-page-content ptr @ptr:refresh="onRecommendRefresh" infinite @infinite="onRecommendInfinite">
                    <div class="card-grid">
                        <div class="masonry-item" v-for="(item, index) in recommendList" :key="item.id + '-' + index">
                            <FeedCard :item="item" @click="handleArticleClick(item)" @userClick="handleUserClick" />
                        </div>
                    </div>
                    <div class="load-more block text-align-center" v-if="!hasMoreRecommend && recommendList.length > 0">
                        <span class="text-color-gray">没有更多内容了</span>
                    </div>
                </f7-page-content>
            </f7-tab>

            <f7-tab id="tab-following">
                <TabLayout :tabs="followingTabs" :activeId="homeFollowingTab" :onChange="(id) => homeFollowingTab = id"
                    :nested="true">
                    <template #selected>
                        <f7-page-content ptr @ptr:refresh="onFollowingRefresh" infinite @infinite="onFollowingInfinite">
                            <div class="card-grid">
                                <template v-for="(item, index) in recommendList.slice(0, 2)" :key="'sel-' + index">
                                    <div class="masonry-item">
                                        <FeedCard :item="item" @click="handleArticleClick(item)"
                                            @userClick="handleUserClick" />
                                    </div>
                                </template>
                            </div>
                        </f7-page-content>
                    </template>
                    <template #latest>
                        <f7-page-content ptr @ptr:refresh="onFollowingRefresh" infinite @infinite="onFollowingInfinite">
                            <div class="list-layout">
                                <FeedCard v-for="(item, index) in dailyList" :key="'lat-' + index" :item="item"
                                    @click="handleArticleClick(item)" />
                                <div class="padding text-align-center text-color-gray">已加载全部最新内容</div>
                            </div>
                        </f7-page-content>
                    </template>
                    <template #thoughts>
                        <f7-page-content ptr @ptr:refresh="onFollowingRefresh" infinite @infinite="onFollowingInfinite">
                            <div class="card-grid">
                                <div v-for="item in THOUGHTS_DATA" :key="item.id" class="masonry-item">
                                    <FeedCard :item="item" isThought @click="handleArticleClick(item)"
                                        @userClick="handleUserClick" />
                                </div>
                            </div>
                        </f7-page-content>
                    </template>
                </TabLayout>
            </f7-tab>

            <f7-tab id="tab-hot">
                <f7-page-content ptr @ptr:refresh="onHotRefresh" style="padding-top: 0">
                    <div class="list-layout">
                        <HotListCard v-for="(item, index) in hotList" :key="item.id" :item="item" :rank="index + 1"
                            @click="handleArticleClick(item)" />
                    </div>
                </f7-page-content>
            </f7-tab>

            <f7-tab id="tab-thoughts">
                <f7-page-content ptr @ptr:refresh="onThoughtsRefresh" infinite @infinite="onThoughtsInfinite"
                    style="padding-top: 0">
                    <div class="card-grid">
                        <div v-for="item in THOUGHTS_DATA" :key="'t-' + item.id" class="masonry-item">
                            <FeedCard :item="item" isThought @click="handleArticleClick(item)"
                                @userClick="handleUserClick" />
                        </div>
                    </div>
                </f7-page-content>
            </f7-tab>
        </f7-tabs>

        <!-- Mobile Tabbar -->
        <f7-toolbar tabbar bottom icons v-if="isMobile">
            <f7-link tab-link="#tab-recommend" :tab-link-active="activeTab === 'recommend'"
                @click="activeTab = 'recommend'" icon-ios="f7:house_fill" icon-md="material:home" text="推荐"></f7-link>
            <f7-link tab-link="#tab-following" :tab-link-active="activeTab === 'following'"
                @click="activeTab = 'following'" icon-ios="f7:person_2_fill" icon-md="material:group"
                text="关注"></f7-link>
            <f7-link tab-link="#tab-hot" :tab-link-active="activeTab === 'hot'" @click="activeTab = 'hot'"
                icon-ios="flame_fill" icon-md="material:local_fire_department" text="热榜"></f7-link>
            <f7-link tab-link="#tab-thoughts" :tab-link-active="activeTab === 'thoughts'"
                @click="activeTab = 'thoughts'" icon-ios="lightbulb_fill" icon-md="material:bubble_chart"
                text="想法"></f7-link>
        </f7-toolbar>


    </f7-page>
</template>

<style scoped>
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
</style>
