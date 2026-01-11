<script setup>
import { ref, onMounted, watch, nextTick, reactive, onUnmounted } from 'vue';
import { f7 } from 'framework7-vue';
import TopBar from '../TopBar.vue';
import FeedCard from '../FeedCard.vue';
import HotListCard from './HotListCard.vue';
import TabLayout from '../TabLayout.vue';
import $http from '../../api/http.js';
import MomentListCard from './MomentListCard.vue';
import RecommendUserCardList from './RecommendUserCardList.vue';
import { useUser } from '../../composables/userManager.js';

const props = defineProps({
    f7router: Object
});

const isMobile = ref(false);

const activeTab = ref('recommend');

const allTabDefinitions = {
    recommend: { id: 'recommend', label: '推荐', icon: 'home', iosIcon: 'f7:house_fill', mdIcon: 'material:home' },
    following: { id: 'following', label: '关注', icon: 'group', iosIcon: 'f7:person_2_fill', mdIcon: 'material:group' },
    hot: { id: 'hot', label: '热榜', icon: 'local_fire_department', iosIcon: 'f7:flame_fill', mdIcon: 'material:local_fire_department' },
    thoughts: { id: 'thoughts', label: '想法', icon: 'emoji_objects', iosIcon: 'f7:lightbulb_fill', mdIcon: 'material:bubble_chart' }
};

const enabledTabs = ref([]);

const loadSettings = () => {
    try {
        const stored = localStorage.getItem('home_tabs_config');
        if (stored) {
            const config = JSON.parse(stored);
            if (config.tabs && Array.isArray(config.tabs)) {
                const newTabs = [];
                config.tabs.forEach(t => {
                    if (t.enabled && allTabDefinitions[t.id]) {
                        newTabs.push(allTabDefinitions[t.id]);
                    }
                });
                enabledTabs.value = newTabs;
            }
            if (config.default && enabledTabs.value.some(t => t.id === config.default)) {
                activeTab.value = config.default;
            } else if (enabledTabs.value.length > 0) {
                activeTab.value = enabledTabs.value[0].id;
            }
        } else {
            enabledTabs.value = [
                allTabDefinitions.recommend,
                allTabDefinitions.following,
                allTabDefinitions.hot,
                allTabDefinitions.thoughts,
            ];
            activeTab.value = enabledTabs.value[0].id;
        }
    } catch (e) {
        console.error('Failed to load home settings', e);
    }
    fetchRecommendSections();
};

// 根据当前激活的标签页加载对应数据
const loadCurrentTabData = (isRefresh) => {
    if (!activeTab.value) return;

    const dataCheckMap = {
        'recommend': () => recommendList.value.length > 0,
        'hot': () => hotList.value.length > 0,
        'thoughts': () => thoughtsList.value.length > 0,
        'following': () => momentsTabData[momentsActiveTab.value].list.length > 0,
    };

    if (isRefresh === undefined && dataCheckMap[activeTab.value]?.()) {
        return;
    }

    const refresh = isRefresh !== undefined ? isRefresh : true;

    const fetchMap = {
        'recommend': () => fetchRecommendData(refresh),
        'hot': () => fetchHotData(),
        'thoughts': () => fetchThoughtsData(refresh),
        'following': () => fetchMomentsData(momentsActiveTab.value, refresh),
    };

    fetchMap[activeTab.value]?.();
};

const handleResize = () => {
    if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < 768;
    }
};

// 监听主标签页切换
watch(activeTab, (newTab, oldTab) => {
    if (newTab !== oldTab) {
        loadCurrentTabData();
    }
});



// 推荐模块
const lastRecommendResult = ref(null);
const recommendList = ref([]);
const hasMoreRecommend = ref(true);
const isRecommendLoading = ref(false);

const fetchRecommendData = async (isRefresh = false) => {
    if (isRecommendLoading.value) return;
    isRecommendLoading.value = true;

    try {
        let res;

        // 获取当前选中的section
        const currentItem = hometab.value[currentSectionIndex.value];
        if (!currentItem) {
            isRecommendLoading.value = false;
            return;
        }

        const { section_id, sub_page_id } = currentItem;

        if (isRefresh || !lastRecommendResult.value) {
            // 刷新时，根据section_id构建初始URL
            let url;
            if (section_id === null) {
                url = 'https://api.zhihu.com/topstory/recommend';
            } else {
                if (sub_page_id) {
                    url = `https://api.zhihu.com/feed-root/section/${section_id}?sub_page_id=${sub_page_id}&channelStyle=0`;
                } else {
                    url = `https://api.zhihu.com/feed-root/section/${section_id}?channelStyle=0`;
                }
            }
            res = !lastRecommendResult.value ? await $http.get(url, { isWWW: true }) : await lastRecommendResult.value.prev();
        } else {
            res = await lastRecommendResult.value.next();
        }

        const rawList = res.data || [];
        const recommendDataList = rawList.map(item => {
            if (item.type !== "feed") {
                return;
            }

            const targetItem = item.target || item;
            const type = targetItem.type;
            const id = targetItem.id
            const authorName = targetItem.author ? targetItem.author.name : "";

            let excerpt = targetItem.excerpt || targetItem.excerpt_title || "";
            let title = targetItem.title || item.title || "无标题";

            switch (type) {
                case "answer":
                    title = targetItem.question ? targetItem.question.title : title;
                    break;
                case "pin":
                    title = `${authorName}发表了想法`;
                    break;
            }

            if (!excerpt || excerpt.trim() === "" || excerpt === "无预览内容") {
                excerpt = null;
            }

            const likes = targetItem.voteup_count || targetItem.vote_count || targetItem.reaction_count || 0;
            const comments = targetItem.comment_count || 0;

            return {
                type,
                id,
                title,
                excerpt,
                authorName,
                metrics: {
                    likes,
                    comments
                },
            };

        });


        if (isRefresh) {
            recommendList.value = recommendDataList;
        } else {
            recommendList.value.push(...recommendDataList);
        }

        lastRecommendResult.value = res;
        hasMoreRecommend.value = !res.paging?.is_end;

    } catch (e) {
        console.error("Failed to fetch recommend data", e);
    } finally {
        isRecommendLoading.value = false;
    }
};

// 刷新推荐section tabs高亮状态
const refreshHighlight = () => {
    nextTick(() => {
        f7.toolbar.setHighlight('.recommend-section-tabs');
    });
};

// 主页推荐tabs模块
const selectedSections = ref([]);
const hometab = ref([]);
const currentSectionIndex = ref(0);

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

        // 解析返回的数据，获取selected_sections
        const decoded_content = res;
        let sections = decoded_content.selected_sections || [];

        // 添加全站section到列表开头
        sections.unshift({
            section_name: '全站',
            section_id: null,
            sub_page_id: null,
        });

        selectedSections.value = sections;

        // 初始化hometab数据结构
        hometab.value = sections.map(item => ({
            sub_page_id: item.sub_page_id,
            section_id: item.section_id
        }));

        // 刷新当前选中section的内容
        handleTabSelected(0);
    } catch (e) {
        console.error("Failed to fetch recommend sections", e);
    }
};

// 处理tab选择事件
const handleTabSelected = (pos) => {
    currentSectionIndex.value = pos;
    // 刷新推荐数据 - fetchRecommendData会根据当前选择的section获取数据
    fetchRecommendData(true);
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
// 推荐模块结束

// 关注模块
const momentsActiveTab = ref('recommend');

const loadDefaultFollowing = () => {
    try {
        const stored = localStorage.getItem('home_tabs_config');
        if (stored) {
            const config = JSON.parse(stored);
            if (config.defaultFollowing) {
                return config.defaultFollowing;
            }
        }
    } catch (e) {
        console.error('Failed to load defaultFollowing setting', e);
    }
    return 'recommend';
};

const defaultFollowing = loadDefaultFollowing();
momentsActiveTab.value = defaultFollowing;

const momentsTabs = [
    { id: 'recommend', label: '精选', feedType: 'recommend', active: defaultFollowing === 'recommend' },
    { id: 'timeline', label: '最新', feedType: 'timeline', active: defaultFollowing === 'timeline' },
    { id: 'pin', label: '想法', feedType: 'pin', active: defaultFollowing === 'pin' }
];

const momentsTabData = reactive({});

momentsTabs.forEach(tab => {
    momentsTabData[tab.id] = {
        list: [],
        loading: false,
        hasMore: true,
    };
});

const resolveMomentsFeed = (item) => {
    const source = item.source || {};
    const actor = source.actor || {};
    const targetItem = item.target || item;

    const type = targetItem.type === "moments_pin" ? "pin" : targetItem.type;
    const id = targetItem.id;
    const likes = targetItem.voteup_count || targetItem.reaction_count || 0;
    const comments = targetItem.comment_count || 0;
    const authorName = actor.name || '未知用户';
    const actionText = source.action_text || '';
    const avatarUrl = targetItem.author?.avatar_url || actor.avatar_url;
    const timeText = source.action_time ? new Date(source.action_time * 1000).toLocaleDateString() : '';
    const preview = targetItem.preview || '';

    let title = targetItem.title || targetItem.excerpt_title || '';
    let excerpt = targetItem.excerpt || '';

    switch (type) {
        case 'answer':
            title = targetItem.question?.title || title;
            break;
        case 'pin':
            title = title || '一个想法';
            if (targetItem.content && targetItem.content.length > 0) {
                excerpt = targetItem.content[0].content || excerpt;
                if (!excerpt && targetItem.content.some(c => c.type === 'image')) {
                    excerpt = '[图片]';
                }
            }
            break;
        case 'zvideo':
            excerpt = preview || targetItem.description || '[视频]';
            break;
        default:
            break;
    }

    if (preview && preview !== '[视频]') {
        excerpt = `${authorName}: ${excerpt}`;
    }

    return {
        id,
        type,
        title,
        excerpt,
        authorName,
        avatarUrl,
        actionText,
        timeText,
        metrics: {
            likes,
            comments
        }
    };
};

const resolveFeedItemIndexGroup = (item) => {
    const targetItem = item.target || item;
    const type = targetItem.type === "moments_pin" ? "pin" : targetItem.type;

    let avatarUrl, authorName, actionText;

    if (item.actors && item.actors.length > 0) {
        avatarUrl = item.actors[0].avatar_url;
        authorName = item.actors[0].name;
        actionText = authorName + (item.action_text || '');
    } else {
        authorName = targetItem.author || '未知用户';
        actionText = '';
        avatarUrl = '';
    }

    const timeText = item.action_time ? new Date(item.action_time * 1000).toLocaleDateString() : '';
    let title = targetItem.title || targetItem.excerpt_title || '';
    let excerpt = targetItem.digest || '';


    let likes = 0;
    let comments = 0;

    const parseChineseNumber = (str) => {
        if (!str) return 0;
        const num = parseFloat(str);
        if (str.includes('万')) return Math.floor(num * 10000);
        if (str.includes('千')) return Math.floor(num * 1000);
        return Math.floor(num);
    };

    if (targetItem.desc) {
        const descMatch = targetItem.desc.match(/(\d+(?:\.\d+)?[万千]?)\s*赞同/);
        if (descMatch) likes = parseChineseNumber(descMatch[1]);

        const commentMatch = targetItem.desc.match(/(\d+(?:\.\d+)?[万千]?)\s*评论/);
        if (commentMatch) comments = parseChineseNumber(commentMatch[1]);
    }

    let id = targetItem.id;

    switch (type) {
        case 'pin':
            title = title || '一个想法';
            break;
        case 'zvideo':
            if (!excerpt) excerpt = '[视频]';
            break;
        case 'drama':
            if (!excerpt) excerpt = '[直播]';
            break;
        case 'people':
            const cardExtentData = targetItem.card_extend_data;
            authorName = cardExtentData.name;
            title = cardExtentData.description;
            avatarUrl = cardExtentData.avatar_url;
            excerpt = cardExtentData.headline;
            id = cardExtentData.id;
            break;
        default:
            break;
    }

    if (excerpt && excerpt !== '[视频]' && excerpt !== '[直播]') {
        excerpt = `${authorName} : ${excerpt}`;
    }

    const unfoldShowSize = item.unfold_show_size || 0;

    return {
        id,
        type,
        title,
        excerpt,
        authorName,
        avatarUrl,
        actionText,
        timeText,
        unfoldShowSize,
        metrics: {
            likes,
            comments
        }
    };
};

const fetchMomentsData = async (tabId, isRefresh = false) => {
    const state = momentsTabData[tabId];
    if (state.loading) return;
    if (!isRefresh && !state.hasMore) return;

    state.loading = true;

    try {
        let res;
        if (isRefresh || !state.lastResult) {
            const feedType = momentsTabs.find(t => t.id === tabId)?.feedType;
            const url = `https://api.zhihu.com/moments_v3?feed_type=${feedType}`;
            res = !state.lastResult ? await $http.get(url) : await state.lastResult.prev();
        } else {
            res = await state.lastResult.next();
        }

        const rawList = res.data || [];

        const mappedList = rawList.map(item => {
            switch (item.type) {
                case 'moments_feed':
                    return resolveMomentsFeed(item);
                    break;

                case 'feed_item_index_group':
                    return resolveFeedItemIndexGroup(item);
                    break;

                case 'item_group_card':
                    // 简化item_group_card处理 直接将分组数据作为一个整体对象

                    const actionText = item.action_text || '';
                    const actor = item.actor;
                    const authorName = actor.name || '未知用户';
                    const avatarUrl = actor.avatar_url || '';
                    const timeText = item.action_time ? new Date(item.action_time * 1000).toLocaleDateString() : '';

                    const groupItem = {
                        type: 'collapsible_group',
                        groupText: item.group_text,
                        authorName: authorName,
                        avatarUrl: avatarUrl,
                        actionText: actionText,
                        timeText: timeText,
                        groupData: (item.data || []).map(subItem => {
                            const resolved = resolveFeedItemIndexGroup(subItem);
                            if (resolved) {
                                return resolved;
                            }
                            return null;
                        }).filter(Boolean),
                        unfoldShowSize: item.unfold_show_size || 0,
                        expanded: false
                    };
                    return groupItem;
                    break;

                case 'recommend_user_card_list':
                    // 处理推荐用户卡片列表 保持原type不变
                    return item;
                    break;

                case 'moments_recommend_followed_group':
                    if (item.list?.length > 0) {
                        // 为moments_recommend_followed_group类型添加group_start标记，确保groupText显示在顶部
                        const groupStartItem = {
                            type: 'group_start',
                            groupText: item.group_text,
                            groupType: 'moments_recommend_followed_group'
                        };
                        mappedList.push(groupStartItem);

                        const resolved = resolveMomentsFeed(item.list[0]);
                        return resolved;
                    }
                    break;

                default:
                    //console.log(item);
                    break;
            }
        });

        /*
        // 添加示例的recommend_user_card_list数据
        const exampleRecommendUserCardList = {
            "type": "recommend_user_card_list",
            "title": "推荐关注",
            "data": [
                {
                    "reason": "你的朋友李雷也关注了他",
                    "actor": {
                        "id": "user_001",
                        "name": "张华",
                        "headline": "test",
                        "avatar_url": "https://pic4.zhimg.com/v2-abc123.jpg"
                    }
                },
                {
                    "reason": "你关注了科技话题",
                    "actor": {
                        "id": "user_002",
                        "name": "王明",
                        "headline": "test",
                        "avatar_url": "https://pic4.zhimg.com/v2-def456.jpg"
                    }
                }
            ]
        };

        // 将示例数据添加到列表中
        mappedList.push(exampleRecommendUserCardList);
        */

        if (isRefresh) {
            state.list = mappedList;
        } else {
            state.list.push(...mappedList);
        }

        state.lastResult = res;
        state.hasMore = !res.paging?.is_end;
    } catch (e) {
        console.error(`Failed to fetch moments ${tabId}`, e);
    } finally {
        state.loading = false;
    }
};

const onMomentsRefresh = async (tabId, done) => {
    await fetchMomentsData(tabId, true);
    if (done) done();
};

const onMomentsInfinite = (tabId) => {
    fetchMomentsData(tabId);
};

const handleMomentsTabChange = (tabId) => {
    momentsActiveTab.value = tabId;
    if (momentsTabData[tabId].list.length === 0) {
        fetchMomentsData(tabId, true);
    }
};

// 处理移除推荐用户卡片列表事件
const handleRemoveRecommendUserCardList = (tabId, removedItem) => {
    // 从momentsTabData中移除该推荐用户卡片列表
    momentsTabData[tabId].list = momentsTabData[tabId].list.filter(item =>
        !(item.type === 'recommend_user_card_list' && item.title === removedItem.title)
    );
};


const handleAuthorClick = (f7router, item) => {
    if (!item.actor || !item.actor.id) return;
    f7router.navigate(`/user/${item.actor.id}`);
};

// 关注模块结束

// 热榜模块
const hotList = ref([]);
const isHotLoading = ref(false);

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

const onHotRefresh = async (done) => {
    await fetchHotData();
    done();
};

const handleHotListCardClick = (f7router, item) => {
    const type = item.type;
    const id = item.id;

    if (type == "question") {
        f7router.navigate(`/question/${id}`);
    } else {
        throw new Error("异常的类型", item)
    }
};

// 热榜模块结束

// 想法模块
const thoughtsList = ref([]);
const isThoughtsLoading = ref(false);
const hasMoreThoughts = ref(true);
const lastThoughtsResult = ref(null);

const getThoughtTitle = (excerpt) => {
    if (!excerpt) return '一个想法';
    // 取第一行或前30个字符
    const firstLine = excerpt.split('\n')[0].trim();
    return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
};

const fetchThoughtsData = async (isRefresh = false) => {
    if (isThoughtsLoading.value) return;
    isThoughtsLoading.value = true;

    try {
        let res;
        const url = 'https://api.zhihu.com/prague/feed?limit=10';

        if (isRefresh || !lastThoughtsResult.value) {
            // 刷新时，根据section_id构建初始URL
            res = !lastThoughtsResult.value ? await $http.get(url) : await lastThoughtsResult.value.prev();
        } else {
            res = await lastThoughtsResult.value.next();
        }

        const rawList = res.data || [];
        const mappedList = rawList.map(item => {
            const targetItem = item.target || item;
            const excerpt = targetItem.excerpt || '';
            const likes = targetItem.reaction?.statistics?.up_vote_count || 0;
            const comments = targetItem.reaction?.statistics?.comment_count || 0;
            const authorName = targetItem.author?.name || '匿名用户';

            let image = '';
            if (targetItem.images && targetItem.images.length > 0) {
                image = targetItem.images[0].url;
            } else if (targetItem.video && targetItem.video.thumbnail) {
                image = targetItem.video.thumbnail;
            }

            return {
                id: targetItem.id,
                title: getThoughtTitle(excerpt),
                excerpt: excerpt,
                image: image,
                metrics: {
                    likes,
                    comments
                },
                authorName,
                type: 'pin'
            };
        });

        if (isRefresh) {
            thoughtsList.value = mappedList;
        } else {
            thoughtsList.value.push(...mappedList);
        }

        lastThoughtsResult.value = res;
        hasMoreThoughts.value = !res.paging?.is_end;

    } catch (e) {
        console.error("Failed to fetch thoughts", e);
    } finally {
        isThoughtsLoading.value = false;
    }
};

const onThoughtsRefresh = async (done) => {
    await fetchThoughtsData(true);
    done();
};

const onThoughtsInfinite = () => {
    if (hasMoreThoughts.value && !isThoughtsLoading.value) {
        fetchThoughtsData(false);
    }
};
// 想法模块结束

// 使用useUser hook
const { isLoggedIn, onUserUpdate } = useUser();

// 订阅事件
let unsubscribeUserUpdate = null;

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    loadSettings();
    window.addEventListener('home-settings-changed', loadSettings);
    window.addEventListener('home-recommendtab-settings-changed', fetchRecommendSections);

    unsubscribeUserUpdate = onUserUpdate((userData) => {
        if (isLoggedIn.value) {
            // 登录成功时 主动请求fetchRecommendSections
            fetchRecommendSections();
        }
    });

    nextTick(() => {
        if (!isMobile.value) f7.toolbar.setHighlight('.desktop-home-toolbar');
    });

    loadCurrentTabData();
});

// 在组件卸载时取消订阅
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('home-settings-changed', loadSettings);
    window.removeEventListener('home-recommendtab-settings-changed', fetchRecommendSections);
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
            <f7-toolbar tabbar top class="desktop-home-toolbar" v-if="!isMobile">
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
                <f7-toolbar tabbar top class="recommend-section-tabs tab-bar-static"
                    v-if="isLoggedIn && selectedSections.length > 0">
                    <f7-link v-for="(section, index) in selectedSections" :key="index"
                        :tab-link="`#tab-${section.section_id}`" :tab-link-active="currentSectionIndex === index"
                        @click="handleTabSelected(index)">
                        {{ section.section_name }}
                    </f7-link>
                </f7-toolbar>

                <!-- 单个page-content，tab切换只更新内容 -->
                <f7-page-content ptr @ptr:refresh="onRecommendRefresh" infinite @infinite="onRecommendInfinite"
                    :style="{ 'padding-bottom': isLoggedIn ? 'var(--f7-toolbar-height)' : '' }">
                    <div class="card-grid">
                        <FeedCard class="masonry-item" v-for="(item, idx) in recommendList" :key="idx" :item="item"
                            @click="$handleCardClick(f7router, item)" />
                    </div>
                    <div class="load-more block text-align-center" v-if="!hasMoreRecommend && recommendList.length > 0">
                        <span class="text-color-gray">没有更多内容了</span>
                    </div>
                </f7-page-content>
            </f7-tab>

            <f7-tab id="tab-following" :tab-active="activeTab === 'following'"
                v-if="enabledTabs.some(t => t.id === 'following')">
                <!-- 未登录提示 -->
                <div v-if="!isLoggedIn" class="empty-state" style="padding: 40px 20px;">
                    <f7-icon f7="person" size="48" color="gray" />
                    <p style="margin: 16px 0;">不登录无法加载数据</p>
                    <f7-button fill color="primary" @click="() => {
                        f7.dialog.alert('请点击主页右上角登录');
                    }">
                        去登录
                    </f7-button>
                </div>
                <!-- 已登录内容 -->
                <TabLayout v-else :tabs="momentsTabs" :onChange="(id) => handleMomentsTabChange(id)" :nested="true"
                    :autoPageContent="false" :fixed="false">
                    <template v-for="tab in momentsTabs" :key="tab.id" #[tab.id]>
                        <f7-page-content ptr @ptr:refresh="(done) => onMomentsRefresh(tab.id, done)" infinite
                            @infinite="onMomentsInfinite(tab.id)" class="moments-scroll-content">
                            <div class="moments-list">


                                <template v-for="(item, index) in momentsTabData[tab.id].list" :key="index">
                                    <!-- 推荐关注卡片列表，处理recommend_user_card_list类型 -->
                                    <RecommendUserCardList v-if="item.type === 'recommend_user_card_list'" :item="item"
                                        @remove="(removedItem) => handleRemoveRecommendUserCardList(tab.id, removedItem)"
                                        @click="(item) => handleAuthorClick(f7router, item)" />

                                    <!-- 普通卡片和折叠组卡片 -->
                                    <MomentListCard v-else :item="item" @click="$handleCardClick(f7router, $event)" />
                                </template>

                                <div v-if="!momentsTabData[tab.id].hasMore && momentsTabData[tab.id].list.length > 0"
                                    class="padding text-align-center text-color-gray">
                                    没有更多内容了
                                </div>

                                <div v-if="!momentsTabData[tab.id].loading && momentsTabData[tab.id].list.length === 0"
                                    class="empty-state">
                                    <f7-icon f7="tray" size="48" color="gray" />
                                    <p>暂无动态</p>
                                </div>
                            </div>
                        </f7-page-content>
                    </template>
                </TabLayout>
            </f7-tab>

            <f7-tab id="tab-hot" :tab-active="activeTab === 'hot'" v-if="enabledTabs.some(t => t.id === 'hot')">
                <f7-page-content ptr @ptr:refresh="onHotRefresh">
                    <f7-list media-list no-hairlines class="hot-list">
                        <HotListCard v-for="(item, index) in hotList" :key="item.id" :item="item" :rank="index + 1"
                            @click="handleHotListCardClick(f7router, item)" />
                    </f7-list>
                </f7-page-content>
            </f7-tab>

            <f7-tab id="tab-thoughts" :tab-active="activeTab === 'thoughts'"
                v-if="enabledTabs.some(t => t.id === 'thoughts')">
                <f7-page-content ptr @ptr:refresh="onThoughtsRefresh" infinite @infinite="onThoughtsInfinite">
                    <div class="card-grid">
                        <FeedCard class="masonry-item" v-for="(item, index) in thoughtsList" :key="index" :item="item"
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

.hot-list {
    margin-top: 0;
    margin-bottom: 0;
    padding-bottom: 80px;
    background: #fff;
}

.moments-scroll-content {
    height: 100%;
}

.moments-list {
    padding: 8px 0 80px;
}

.empty-state {
    padding: 100px 32px;
    text-align: center;
    color: #999;
}

/* 推荐section tabs样式，参考历史页tabs设计 */
.recommend-section-tabs {
    --f7-toolbar-background-color: #fff;
    z-index: 100;
    margin-bottom: 0;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}
</style>
