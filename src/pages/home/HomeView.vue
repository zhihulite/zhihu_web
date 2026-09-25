<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue';
import { destroyOnClosed } from '@/utils/modal.js';
import { f7 } from 'framework7-vue';
import TopBar from '@/components/TopBar.vue';
import FeedCard from '@/components/FeedCard.vue';
import HotListCard from '@/components/home/HotListCard.vue';
import TabLayout from '@/components/TabLayout.vue';
import $http from '@/services/http.js';
import MomentListCard from '@/components/home/MomentListCard.vue';
import RecommendUserCardList from '@/components/home/RecommendUserCardList.vue';
import { useUser } from '@/composables/userManager.js';
import { usePagedList } from '@/composables/usePagedList.js';
import { useTabbedPagedList } from '@/composables/useTabbedPagedList.js';
import { mapRecommendItem, mapMomentsFeed, mapFeedItemIndexGroup, mapThoughtItem, mapHotItem } from '@/mappers/feed.js';
import { makeBlockWordsFilter, settings } from '@/core/settings.js';
import { homeTabs } from '@/core/home-tabs.js';
import { dedupFilter, resetDedup } from '@/services/feed-dedup.js';
import { fetchDislikeOptions, submitDislike } from '@/services/negative-feedback.js';
import { reportRead } from '@/services/read-report.js';
import { handleCardClick, handleZhihuUrl, openLink } from '@/core/navigation.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

// 屏蔽词过滤器：设置变更时重算，列表下次加载即生效
const blockFilter = computed(() => makeBlockWordsFilter());
// 推荐流额外去重：屏蔽词 + 去重两道
const recommendFilter = computed(() => {
    const block = blockFilter.value;
    return (item) => (!block || block(item)) && dedupFilter(item, settings.dedupWindow);
});

const props = defineProps({
    f7router: Object
});

// 主页各 tab 是 swipeable，隐藏 tab 的容器依然有高度，满屏补拉必须按各列表自己的容器判定
const scrollEls = {};
const setScrollEl = (key, elRef) => {
    if (elRef) scrollEls[key] = elRef.$el;
};

const isMobile = ref(false);

// tabbar 高亮只认本组件这两块元素，不用类名全局取
const desktopTabbarRef = ref(null);
const sectionTabbarRef = ref(null);
const tabbarEl = (ref) => (ref && (ref.$el || ref)) || null;
const activeTab = ref('recommend');

const allTabDefinitions = {
    recommend: { id: 'recommend', label: '推荐', icon: 'home', iosIcon: 'f7:house_fill', mdIcon: 'material:home' },
    following: { id: 'following', label: '关注', icon: 'group', iosIcon: 'f7:person_2_fill', mdIcon: 'material:group' },
    hot: { id: 'hot', label: '热榜', icon: 'local_fire_department', iosIcon: 'f7:flame_fill', mdIcon: 'material:local_fire_department' },
    thoughts: { id: 'thoughts', label: '想法', icon: 'emoji_objects', iosIcon: 'f7:lightbulb_fill', mdIcon: 'material:bubble_chart' }
};

const enabledTabs = ref([]);

// 栏目配置单源（core/home-tabs.js）：首帧按配置定初始 tab，此后设置页改动 watch 即时生效
let tabsInitialized = false;
const applyHomeTabs = () => {
    const enabled = homeTabs.tabs
        .filter((t) => t.enabled)
        .map((t) => allTabDefinitions[t.id])
        .filter(Boolean);
    enabledTabs.value = enabled.length ? enabled : Object.values(allTabDefinitions);

    if (!tabsInitialized) {
        activeTab.value = homeTabs.default && enabledTabs.value.some((t) => t.id === homeTabs.default)
            ? homeTabs.default
            : enabledTabs.value[0].id;
        tabsInitialized = true;
    } else if (!enabledTabs.value.some((t) => t.id === activeTab.value)) {
        activeTab.value = enabledTabs.value[0].id;
    }
};
watch(homeTabs, applyHomeTabs);

// 根据当前激活的标签页加载对应数据
const loadCurrentTabData = (isRefresh) => {
    if (!activeTab.value) return;

    const dataCheckMap = {
        'recommend': () => recommendPage.list.length > 0,
        'hot': () => hotList.value.length > 0,
        'thoughts': () => thoughtsPage.list.length > 0,
        'following': () => momentsTabData[momentsActiveTab.value]?.list.length > 0,
    };

    if (isRefresh === undefined && dataCheckMap[activeTab.value]?.()) {
        return;
    }

    const refresh = isRefresh !== undefined ? isRefresh : true;

    const fetchMap = {
        'recommend': () => fetchRecommendData(refresh),
        'hot': () => fetchHotData(),
        'thoughts': () => fetchThoughtsData(refresh),
        'following': () => refresh ? refreshMoments(momentsActiveTab.value) : ensureMomentsLoaded(momentsActiveTab.value),
    };

    fetchMap[activeTab.value]?.();
};

// 监听主标签页切换
watch(activeTab, (newTab, oldTab) => {
    // 首帧由 applyHomeTabs 定下 activeTab，那次赋值不算用户切换，别和 onMounted 的加载重复
    if (oldTab !== undefined && newTab !== oldTab) {
        loadCurrentTabData();
    }
});



// 推荐模块
const sectionUrlAt = (index) => {
    const currentItem = hometab.value[index];
    if (!currentItem) return null;
    const { section_id, sub_page_id } = currentItem;
    if (section_id === null) return 'https://api.zhihu.com/topstory/recommend';
    return sub_page_id
        ? `https://api.zhihu.com/feed-root/section/${section_id}?sub_page_id=${sub_page_id}&channelStyle=0`
        : `https://api.zhihu.com/feed-root/section/${section_id}?channelStyle=0`;
};

const recommendSectionUrl = () => sectionUrlAt(currentSectionIndex.value);

// 列表当前内容来自哪个栏目地址
let loadedRecommendUrl = null;

const { page: recommendPage, refresh: refreshRecommend, loadMore: loadMoreRecommend }
    = usePagedList({
        name: '推荐',
        fillEl: () => scrollEls.recommend,
        fetch: (signal) => {
            const url = recommendSectionUrl();
            loadedRecommendUrl = url;
            return url ? $http.get(url, { isWWW: true, signal }) : null;
        },
        map: mapRecommendItem,
        filter: recommendFilter,
    });

const fetchRecommendData = (isRefresh = false) => {
    // 整表重取前先清去重窗口：接口重复回同一批内容时，否则整页都被判成"已展示"，列表刷空
    if (isRefresh) resetDedup();
    return isRefresh ? refreshRecommend() : loadMoreRecommend();
};

// 点开推荐卡：先按条目自带的 brief 报一次已读（同一条只报一次），再走统一跳转
const openRecommendCard = (item) => {
    if (!item.readReported) {
        item.readReported = true;
        reportRead(item.brief);
    }
    handleCardClick(props.f7router, item);
};

// 「不感兴趣」负反馈：拉面板选项 → actions 菜单 → 回传并从列表移除
const onRecommendDislike = async (item) => {
    let options;
    try {
        options = await fetchDislikeOptions(item.type, item.id);
    } catch (e) {
        console.error('获取负反馈选项失败', e);
        f7.toast.show({ text: '获取选项失败' });
        return;
    }
    if (!options.length) {
        f7.toast.show({ text: '没有可用的选项' });
        return;
    }

    const group = options.map((opt) => ({
        text: opt.label,
        onClick: async () => {
            if (opt.backendUrl) {
                if (await submitDislike(opt.backendUrl)) {
                    f7.toast.show({ text: opt.toast });
                    const i = recommendPage.list.indexOf(item);
                    if (i !== -1) recommendPage.list.splice(i, 1);
                } else {
                    f7.toast.show({ text: '操作失败' });
                }
            } else if (opt.intentUrl) {
                openLink(`https://www.zhihu.com/report?id=${opt.intentUrl}&source=android`);
            }
        },
    }));

    const menu = f7.actions.create({ buttons: [group, [{ text: '取消', color: 'red' }]] });
    destroyOnClosed(menu).open();
};

// 刷新推荐section tabs高亮状态
const refreshHighlight = () => {
    nextTick(() => {
        const el = tabbarEl(sectionTabbarRef.value);
        if (el) f7.toolbar.setHighlight(el);
    });
};

// 主页推荐tabs模块
const selectedSections = ref([]);
const hometab = ref([]);
const currentSectionIndex = ref(0);

// 按用户偏好排列/过滤分区：先按 sectionOrder 排序，未列出的保持原序排后；再去掉 hiddenSections
const arrangeSections = (sections) => {
    const order = settings.sectionOrder || [];
    const hidden = new Set(settings.hiddenSections || []);
    const rank = (s) => {
        const i = order.indexOf(s.section_id);
        return i === -1 ? order.length : i;
    };
    return sections
        .filter((s) => !hidden.has(s.section_id))
        .map((s, i) => ({ s, i }))
        .sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i)
        .map(({ s }) => s);
};

// 获取推荐section列表
const fetchRecommendSections = async () => {
    // 只有在推荐标签页启用时才获取推荐section列表
    if (!enabledTabs.value.some(t => t.id === 'recommend')) {
        return;
    }

    try {
        const res = await $http.get('https://api.zhihu.com/feed-root/sections/query/v2', {
            isWWW: true
        });

        let sections = res.selected_sections || [];

        // 「全站」分区（section_id=null），可在设置里隐藏
        if (!settings.hideAllSection) {
            sections.unshift({
                section_name: '全站',
                section_id: null,
                sub_page_id: null,
            });
        }

        sections = arrangeSections(sections);
        selectedSections.value = sections;

        // 初始化hometab数据结构
        hometab.value = sections.map(item => ({
            sub_page_id: item.sub_page_id,
            section_id: item.section_id
        }));

        // 留在用户当前看的栏目上，栏目列表变化不该把他拽回首栏
        handleTabSelected(currentSectionIndex.value < sections.length ? currentSectionIndex.value : 0);
    } catch (e) {
        console.error("Failed to fetch recommend sections", e);
    }
};

// 栏目列表按登录态各取一次：/me 每次刷新都会广播，重复取会把整条推荐流拉好几遍
let sectionsFetchedFor = null;

const ensureRecommendSections = () => {
    const who = isLoggedIn.value ? 'user' : 'guest';
    if (sectionsFetchedFor === who) return;
    sectionsFetchedFor = who;
    fetchRecommendSections();
};

const onSectionsSettingsChanged = () => {
    sectionsFetchedFor = null;
    ensureRecommendSections();
};

// 处理tab选择事件
const handleTabSelected = (pos) => {
    const url = sectionUrlAt(pos);
    currentSectionIndex.value = pos;
    // 同一栏目内容重复取回时不再整页刷新：刷新会被去重判成"全部已展示"，列表反而被清空
    if (url === loadedRecommendUrl) return;
    // 刷新推荐数据 - fetchRecommendData会根据当前选择的section获取数据
    fetchRecommendData(true);
};

const onRecommendRefresh = async (done) => {
    await fetchRecommendData(true);
    done();
};

const onRecommendInfinite = () => {
    loadMoreRecommend();
};

// 关注模块
const momentsActiveTab = ref('recommend');

const defaultFollowing = homeTabs.defaultFollowing || 'recommend';
momentsActiveTab.value = defaultFollowing;

const momentsTabs = [
    { id: 'recommend', label: '精选', feedType: 'recommend' },
    { id: 'timeline', label: '最新', feedType: 'timeline' },
    { id: 'pin', label: '想法', feedType: 'pin' }
];

const feedTypeFor = (tabId) => momentsTabs.find(t => t.id === tabId)?.feedType;

// moments_v3 一次响应含多种 wrapper 类型，摊平成卡片列表；分组类型会额外插入 group_start 标记
// 键在生成时就固定（折叠展开与移除都挂在卡片上，位置键会在列表变动后让后一张卡继承前一张的状态）
let momentsSeq = 0;
const withKey = (mapped, raw) => {
    if (!mapped) return mapped;
    mapped.key = raw?.card_id || raw?.id || `${mapped.type || 'moment'}-${++momentsSeq}`;
    return mapped;
};

const mapMomentsResponse = (rawList) => {
    const out = [];
    for (const item of rawList) {
        switch (item.type) {
            case 'moments_feed':
                out.push(withKey(mapMomentsFeed(item), item));
                break;
            case 'feed_item_index_group':
                out.push(withKey(mapFeedItemIndexGroup(item), item));
                break;
            case 'item_group_card': {
                const actor = item.actor || {};
                out.push(withKey({
                    type: 'collapsible_group',
                    groupText: item.group_text,
                    authorName: actor.name || '未知用户',
                    avatarUrl: actor.avatar_url || '',
                    actionText: item.action_text || '',
                    timeText: item.action_time ? new Date(item.action_time * 1000).toLocaleDateString() : '',
                    groupData: (item.data || []).map(mapFeedItemIndexGroup).filter(Boolean),
                    unfoldShowSize: item.unfold_show_size || 0,
                    expanded: false,
                }, item));
                break;
            }
            case 'recommend_user_card_list':
                out.push(withKey(item, item));
                break;
            case 'moments_recommend_followed_group':
                if (item.list?.length > 0) {
                    out.push(withKey({
                        type: 'group_start',
                        groupText: item.group_text,
                        groupType: 'moments_recommend_followed_group',
                    }, item));
                    out.push(withKey(mapMomentsFeed(item.list[0]), item.list[0]));
                }
                break;
        }
    }
    return out;
};

const {
    tabs: momentsTabData,
    loading: momentsLoading,
    ensure: ensureMomentsTabs,
    refresh: refreshMoments,
    loadMore: loadMoreMoments,
    ensureLoaded: ensureMomentsLoaded,
} = useTabbedPagedList({
    name: '关注动态',
    tabs: () => momentsTabs.map(t => t.id),
    fillEl: (tabId) => scrollEls[`moments-${tabId}`],
    fetch: (tabId, signal) => $http.get(`https://api.zhihu.com/moments_v3?feed_type=${feedTypeFor(tabId)}`, { signal }),
    mapList: (rawList) => mapMomentsResponse(rawList),
    filter: blockFilter,
});

// 三个嵌套 pane 会随页面一次性渲染，先建好每个 tab 的空页，模板才不会读到 undefined.list
ensureMomentsTabs();

const onMomentsRefresh = async (tabId, done) => {
    await refreshMoments(tabId);
    if (done) done();
};

const onMomentsInfinite = (tabId) => {
    loadMoreMoments(tabId);
};

const handleMomentsTabChange = (tabId) => {
    momentsActiveTab.value = tabId;
    ensureMomentsLoaded(tabId);
};

const handleRemoveRecommendUserCardList = (tabId, removedItem) => {
    momentsTabData[tabId].list = momentsTabData[tabId].list.filter(item =>
        !(item.type === 'recommend_user_card_list' && item.title === removedItem.title)
    );
};


const handleAuthorClick = (f7router, item) => {
    if (!item.actor || !item.actor.id) return;
    f7router.navigate(`/user/${item.actor.id}`);
};

// 关注模块结束

// 热榜模块（无分页）
const hotList = ref([]);
const isHotLoading = ref(false);

const fetchHotData = async () => {
    if (isHotLoading.value) return;
    isHotLoading.value = true;
    try {
        const res = await $http.get('https://api.zhihu.com/topstory/hot-lists/total?limit=50&mobile=true');
        hotList.value = (res.data || []).map(mapHotItem);
    } catch (e) {
        console.error('热榜加载失败', e);
    } finally {
        isHotLoading.value = false;
    }
};

const onHotRefresh = async (done) => {
    await fetchHotData();
    done();
};

// 热榜条目的目的地在条目自带 link 里，非问题类内容也按同一条链接解析，不假定类型
const handleHotListCardClick = async (f7router, item) => {
    if (!item.url) {
        f7.toast.show({ text: '该条目没有可用链接' });
        return;
    }
    const parsed = await handleZhihuUrl(f7router, item.url);
    if (parsed.type === 'error') {
        f7.toast.show({ text: '暂不支持的链接' });
    }
};

// 热榜模块结束

// 想法模块
const { page: thoughtsPage, refresh: refreshThoughts, loadMore: loadMoreThoughts }
    = usePagedList({
        name: '想法',
        fillEl: () => scrollEls.thoughts,
        fetch: (signal) => $http.get('https://api.zhihu.com/prague/feed?limit=10', { signal }),
        map: mapThoughtItem,
        filter: blockFilter,
    });

const fetchThoughtsData = (isRefresh = false) => (isRefresh ? refreshThoughts() : loadMoreThoughts());

const onThoughtsRefresh = async (done) => {
    await refreshThoughts();
    done();
};

const onThoughtsInfinite = () => {
    loadMoreThoughts();
};

// 使用useUser hook
const { isLoggedIn, onUserUpdate } = useUser();

// 订阅事件
let unsubscribeUserUpdate = null;

onMounted(() => {
    isMobile.value = !f7.device.desktop;
    applyHomeTabs();
    ensureRecommendSections();
    window.addEventListener('home-recommendtab-settings-changed', onSectionsSettingsChanged);

    unsubscribeUserUpdate = onUserUpdate(() => {
        // 同一种登录态下的用户信息刷新不需要重取栏目，只有游客↔登录的切换才要
        ensureRecommendSections();
    });

    nextTick(() => {
        const el = tabbarEl(desktopTabbarRef.value);
        if (!isMobile.value && el) f7.toolbar.setHighlight(el);
    });

    loadCurrentTabData();
});

// 在组件卸载时取消订阅
onUnmounted(() => {
    window.removeEventListener('home-recommendtab-settings-changed', onSectionsSettingsChanged);
    if (unsubscribeUserUpdate) {
        unsubscribeUserUpdate();
    }
});

// 监听推荐section索引变化，刷新高亮
watch(currentSectionIndex, refreshHighlight);
</script>

<template>
    <!-- 不使用:page-content='false' 使用后处理双重tab较麻烦 -->
    <f7-page name="home">
        <!-- Using TopBar here -->
        <template #fixed>
            <TopBar :f7router="f7router" />

            <!-- Desktop Tabbar -->
            <f7-toolbar ref="desktopTabbarRef" tabbar top class="desktop-home-toolbar" v-if="!isMobile">
                <f7-link v-for="tab in enabledTabs" :key="tab.id" :tab-link="`#tab-${tab.id}`"
                    :tab-link-active="activeTab === tab.id" @click="activeTab = tab.id">
                    {{ tab.label }}
                </f7-link>
            </f7-toolbar>
        </template>

        <f7-tabs class="tabs-auto-page-content" animated>
            <f7-tab id="tab-recommend" :tab-active="activeTab === 'recommend'"
                v-if="enabledTabs.some(t => t.id === 'recommend')">
                <!-- 推荐section tabs -->
                <f7-toolbar ref="sectionTabbarRef" tabbar top class="recommend-section-tabs tab-bar-static"
                    v-if="isLoggedIn && selectedSections.length > 0">
                    <f7-link v-for="(section, index) in selectedSections" :key="section.section_id"
                        :tab-link="`#tab-${section.section_id}`" :tab-link-active="currentSectionIndex === index"
                        @click="handleTabSelected(index)">
                        {{ section.section_name }}
                    </f7-link>
                </f7-toolbar>

                <!-- 单个page-content，tab切换只更新内容 -->
                <f7-page-content ptr @ptr:refresh="onRecommendRefresh" infinite @infinite="onRecommendInfinite"
                    :ref="(el) => setScrollEl('recommend', el)"
                    :style="{ 'padding-bottom': isLoggedIn ? 'var(--f7-toolbar-height)' : '' }">
                    <div class="card-grid">
                        <FeedCard class="masonry-item" v-for="(item, idx) in recommendPage.list" :key="item.id ?? idx" :item="item"
                            :dismissible="true" @click="openRecommendCard(item)"
                            @dislike="onRecommendDislike" />
                    </div>
                    <LoadMoreFooter :has-more="recommendPage.hasMore" :length="recommendPage.list.length"
                        text="没有更多内容了" />
                </f7-page-content>
            </f7-tab>

            <f7-tab id="tab-following" :tab-active="activeTab === 'following'"
                v-if="enabledTabs.some(t => t.id === 'following')">
                <!-- 未登录提示 -->
                <EmptyState v-if="!isLoggedIn" icon="person" text="不登录无法加载数据">
                    <f7-button fill color="primary" @click="f7.dialog.alert('请点击主页右上角登录')">
                        去登录
                    </f7-button>
                </EmptyState>
                <!-- 已登录内容 -->
                <TabLayout v-else :tabs="momentsTabs" :onChange="(id) => handleMomentsTabChange(id)" :nested="true"
                    :autoPageContent="false" :fixed="false" :initialActiveId="momentsActiveTab">
                    <template v-for="tab in momentsTabs" :key="tab.id" #[tab.id]>
                        <f7-page-content ptr @ptr:refresh="(done) => onMomentsRefresh(tab.id, done)" infinite
                            @infinite="onMomentsInfinite(tab.id)" :ref="(el) => setScrollEl(`moments-${tab.id}`, el)"
                            class="moments-scroll-content">
                            <div class="moments-list">


                                <template v-for="item in momentsTabData[tab.id].list" :key="item.key">
                                    <!-- 推荐关注卡片列表，处理recommend_user_card_list类型 -->
                                    <RecommendUserCardList v-if="item.type === 'recommend_user_card_list'" :item="item"
                                        @remove="(removedItem) => handleRemoveRecommendUserCardList(tab.id, removedItem)"
                                        @click="(item) => handleAuthorClick(f7router, item)" />

                                    <!-- 普通卡片和折叠组卡片 -->
                                    <MomentListCard v-else :item="item" @click="$handleCardClick(f7router, $event)" />
                                </template>

                                <LoadMoreFooter :has-more="momentsTabData[tab.id].hasMore"
                                    :length="momentsTabData[tab.id].list.length" text="没有更多内容了" />

                                <EmptyState v-if="!momentsLoading[tab.id] && momentsTabData[tab.id].list.length === 0"
                                    icon="tray" text="暂无动态" />
                            </div>
                        </f7-page-content>
                    </template>
                </TabLayout>
            </f7-tab>

            <f7-tab id="tab-hot" :tab-active="activeTab === 'hot'" v-if="enabledTabs.some(t => t.id === 'hot')">
                <f7-page-content ptr @ptr:refresh="onHotRefresh">
                    <f7-list media-list no-hairlines class="hot-list">
                        <HotListCard v-for="(item, index) in hotList" :key="item.id" :item="item" :rank="index + 1"
                            :hide-image="settings.hotHideImage" :hide-metrics="settings.hotHideMetrics"
                            @click="handleHotListCardClick(f7router, item)" />
                    </f7-list>
                </f7-page-content>
            </f7-tab>

            <f7-tab id="tab-thoughts" :tab-active="activeTab === 'thoughts'"
                v-if="enabledTabs.some(t => t.id === 'thoughts')">
                <f7-page-content ptr @ptr:refresh="onThoughtsRefresh" infinite @infinite="onThoughtsInfinite"
                    :ref="(el) => setScrollEl('thoughts', el)">
                    <div class="card-grid">
                        <FeedCard class="masonry-item" v-for="(item, index) in thoughtsPage.list" :key="item.id ?? index" :item="item"
                            @click="$handleCardClick(f7router, item)" />
                    </div>
                </f7-page-content>
            </f7-tab>
        </f7-tabs>

        <!-- Mobile Tabbar -->
        <f7-toolbar tabbar bottom icons v-if="isMobile">
            <f7-toolbar-pane>
                <f7-link v-for="tab in enabledTabs" :key="tab.id" :tab-link="`#tab-${tab.id}`"
                    :tab-link-active="activeTab === tab.id" @click="activeTab = tab.id" :icon-ios="tab.iosIcon"
                    :icon-md="tab.mdIcon" :text="tab.label"></f7-link>
            </f7-toolbar-pane>
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

/* 按容器宽度自适应列数 */
@media (min-width: 640px) {
    .card-grid {
        column-count: 2;
    }
}

@media (min-width: 1024px) {
    .card-grid {
        column-count: 3;
    }
}

@media (min-width: 1440px) {
    .card-grid {
        column-count: 4;
    }
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 16px;
}

.hot-list {
    margin-top: 0;
    margin-bottom: 0;
    padding-bottom: 80px;
    background: var(--f7-page-bg-color);
}

.moments-scroll-content {
    height: 100%;
}

.moments-list {
    padding: 8px 0 80px;
}

/* 推荐 section tabs 与历史页 tabs 同款样式 */
.recommend-section-tabs {
    z-index: 100;
    margin-bottom: 0;
    box-shadow: 0 1px 0 var(--app-divider-color);
}
</style>
