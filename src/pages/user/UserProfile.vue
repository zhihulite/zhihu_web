<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import TabLayout from '@/components/TabLayout.vue';
import $http from '@/services/http.js';
import { HistoryService } from '@/services/history.js';
import { f7 } from 'framework7-vue';
import { usePageState } from '@/composables/usePageState.js';
import { useResource } from '@/composables/useResource.js';
import { useTabbedPagedList } from '@/composables/useTabbedPagedList.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';
import MetricRow from '@/components/MetricRow.vue';
import { ICON } from '@/core/icons.js';
import { handleCardClick, openLink } from '@/core/navigation.js';
import { useUser, requireLogin } from '@/composables/userManager.js';
import { voteupOf } from '@/mappers/zhihu-item.js';
import { useBlockToggle } from '@/composables/useBlockToggle.js';
import { useContentMenu } from '@/composables/useContentMenu.js';
import { followUser, unfollowUser } from '@/composables/useFollowToggle.js';

const { currentUser } = useUser();

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const userId = props.f7route?.params?.id;
const activeTab = ref('activities');
const answerSort = ref('created');

const tabs = ref([]);

const urlFor = (tabId) => {
    const tab = tabs.value.find(t => t.id === tabId);
    let url = tab?.url;
    if (tabId === 'answer' && url) {
        url = `${url.split('?')[0]}?order_by=${answerSort.value}&offset=0&limit=20`;
    }
    return url;
};

// 用户资料：单资源生命周期交给 useResource，映射与历史记录在 transform 内完成
const { data: userInfo, loading, reload: fetchUserInfo } = useResource(
    (signal) => $http.get(`https://api.zhihu.com/people/${userId}`, { signal }),
    {
        transform: (data) => {
            const mappedItem = {
                id: data.id,
                name: data.name,
                avatarUrl: data.avatar_url,
                coverUrl: data.cover_url,
                isBlocking: data.is_blocking,
                isFollowing: data.is_following ?? data.relationship?.is_following ?? false,
                headline: data.headline,
                metrics: {
                    follower: data.follower_count || 0,
                    following: data.following_count || 0,
                    voteup: voteupOf(data),
                },
                isUpvoted: data.reaction?.relation?.vote === "UP" ? true : false,
                isLiked: data.reaction?.relation?.liked || false,
                isFavorited: data.reaction?.relation?.faved || false
            };

            HistoryService.addRecord({
                id: mappedItem.id,
                type: 'people',
                title: mappedItem.name,
                preview: mappedItem.headline || '无签名'
            });

            return mappedItem;
        },
    }
);

const { tabs: tabData, ensure, refresh, loadMore, ensureLoaded, reset } = useTabbedPagedList({
    name: '用户内容',
    tabs: () => tabs.value.map(t => t.id),
    fillEl: (tabId) => scrollElements[tabId],
    fetch: (tabId, signal) => $http.get(urlFor(tabId), { signal }),
    mapList: (rawList, tabId, res) => mapUserContent(rawList, res),
});

const scrollElements = {};
const setScrollRef = (elRef, id) => {
    if (elRef) scrollElements[id] = elRef.$el;
};

const { hasCache } = usePageState({
    state: {
        userInfo,
        activeTab,
        answerSort,
        tabData,
        tabs
    },
    loading,
    scroll: (main) => ({ main, ...scrollElements })
});

const fetchTabs = async () => {
    const urlsMap = {
        activities: `https://api.zhihu.com/moments/${userId}/activities?limit=20`,
        zvideo: `https://api.zhihu.com/members/${userId}/zvideos?offset=0&limit=20`,
        answer: `https://api.zhihu.com/people/${userId}/answers?order_by=created&offset=0&limit=20`,
        vote: `https://api.zhihu.com/moments/${userId}/vote?limit=20`,
        article: `https://api.zhihu.com/people/${userId}/articles?offset=0&limit=20`,
        column: `https://api.zhihu.com/people/${userId}/columns?offset=0&limit=20`,
        pin: `https://api.zhihu.com/v2/pins/${userId}/moments`,
        question: `https://api.zhihu.com/members/${userId}/questions?offset=0&limit=20`,
        more: `https://api.zhihu.com/people/${userId}/profile/tab/more?tab_type=1`
    };

    try {
        const res = await $http.get(`https://api.zhihu.com/people/${userId}/profile/tab`);
        const data = res.data || res;
        const rawTabs = data.tabs_v3 || [];
        const processedTabs = [];

        const addTab = (tab) => {
            if (tab.name === '全部' || tab.key === 'all') return;
            let title = tab.name;
            if (tab.number > 0) title += ` ${tab.number}`;
            processedTabs.push({ key: tab.key, title, url: tab.url });
        };

        rawTabs.forEach(tab => {
            if (tab.sub_tab) tab.sub_tab.forEach(addTab);
            else addTab(tab);
        });

        const finalTabs = [];
        let answerIndex = -1;

        const getKeyFromUrl = (url) => {
            const map = {
                '/activities': 'activities',
                '/answers': 'answer',
                '/articles': 'article',
                '/zvideos': 'zvideo',
                '/questions': 'question',
                '/vote': 'vote',
                '/pins': 'pin',
                '/column': 'column'
            };
            for (const [path, key] of Object.entries(map)) {
                if (url && url.includes(path)) return key;
            }
            return 'unknown';
        };

        processedTabs.forEach((tab) => {
            const id = getKeyFromUrl(tab.url);
            let mapKey = tab.key;
            if (mapKey === 'share') return;
            const url = urlsMap[mapKey] || tab.url;
            if (url) finalTabs.push({ id: mapKey || id, label: tab.title, url, key: mapKey });
        });

        const actIndex = finalTabs.findIndex(t => t.id === 'activities');
        if (actIndex > 0) {
            finalTabs.unshift(finalTabs.splice(actIndex, 1)[0]);
        } else if (actIndex === -1) {
            finalTabs.unshift({ id: 'activities', label: '动态', url: urlsMap.activities });
        }

        tabs.value = finalTabs;
        ensure();
        if (finalTabs.length > 0) activeTab.value = finalTabs[0].id;

    } catch (e) {
        console.error('Fetch tabs failed', e);
        tabs.value = [{ id: 'activities', label: '动态', url: urlsMap.activities }];
        ensure();
        activeTab.value = 'activities';
    }
};

// more_tabs 响应用作「更多」入口卡片，普通响应按类型归一化为活动卡片
const mapUserContent = (rawList, res) => {
    const avatarUrl = userInfo.value?.avatarUrl;
    const moreTabs = res?.more_tabs || [];

    if (moreTabs.length > 0) {
        // 「更多」页无分页，标记 is_end 防止继续翻页
        if (res.paging) res.paging.is_end = true;
        return moreTabs.map(tabItem => ({
            id: tabItem.title,
            title: tabItem.title,
            excerpt: `${tabItem.sub_title ? `共有${tabItem.sub_title}个内容 ` : ''}点击查看`,
            avatarUrl,
            type: 'more_tab',
            actionName: '的更多',
            metrics: { likes: 0, comments: 0 },
        }));
    }

    return rawList.map(item => {
        const targetItem = item.target || item;
        const type = targetItem.type === 'moments_pin' ? 'pin' : targetItem.type;
        const likes = targetItem.voteup_count || targetItem.like_count || 0;
        const comments = targetItem.comment_count || targetItem.items_count || 0;

        let title = targetItem.title || targetItem.name;
        let id = targetItem.id;
        let excerpt = targetItem.excerpt;
        let actionName = item?.source?.action_text;

        switch (type) {
            case 'answer':
                title = targetItem.question?.title || '无标题';
                actionName = actionName || '发布了回答';
                break;
            case 'topic':
                title = title || '未知话题';
                actionName = actionName || '发布了话题';
                excerpt = '无预览内容';
                break;
            case 'question':
                title = title || '未知问题';
                actionName = actionName || '发布了问题';
                excerpt = '无预览内容';
                break;
            case 'column':
                title = title || '未知专栏';
                actionName = actionName || '发布了专栏';
                excerpt = item.intro || '无介绍';
                break;
            case 'collection':
            case 'people':
                title = `关注了${title}`;
                break;
            case 'pin': {
                const firstContent = item.content?.[0];
                title = (item.content?.length > 0 && firstContent?.title) ? firstContent.title : '一个想法';
                actionName = actionName || '发布了想法';
                excerpt = item.content_html || '';
                break;
            }
            case 'article':
                title = title || '未知文章';
                actionName = actionName || '发布了文章';
                break;
            case 'zvideo':
                title = title || '未知视频';
                actionName = actionName || '发布了视频';
                break;
            case 'roundtable':
                title = title || '未知圆桌';
                actionName = actionName || '关注了圆桌';
                excerpt = item.description || '无描述';
                break;
            case 'special':
                title = item.title || '未知专题';
                actionName = actionName || '关注了专题';
                excerpt = item.description || '无描述';
                break;
            default:
                title = '未知';
                actionName = '未知';
                break;
        }

        return { id, title, excerpt, actionName, avatarUrl, type, metrics: { likes, comments } };
    });
};

const headerHeight = ref(0);
const headerRef = ref(null);

onMounted(() => {
    if (!hasCache.value) {
        fetchUserInfo();
        fetchTabs().then(() => {
            if (activeTab.value) ensureLoaded(activeTab.value);
        });
    }

    nextTick(() => {
        if (headerRef.value) {
            headerHeight.value = headerRef.value.offsetHeight;
        }
    });
});

watch(activeTab, (newId) => {
    if (newId) ensureLoaded(newId);
});

// 挂载后再监听：usePageState 在 onMounted 里恢复 answerSort，先注册会在恢复瞬间
// 触发一次重取，把刚恢复回来的列表与滚动位置冲掉
onMounted(() => {
    watch(answerSort, () => {
        reset('answer');
        refresh('answer');
    });
});

const onRefresh = async (tabId, done) => {
    await refresh(tabId || activeTab.value);
    if (done) done();
};

const onLoadMore = (tabId) => {
    loadMore(tabId || activeTab.value);
};


const handleBack = () => {
    if (props.f7router) props.f7router.back();
};

const handleItemClick = (f7router, item) => {
    const id = item.id;
    const type = item.type;
    if (type === 'more_tab') {
        if (id.includes('收藏')) {
            if (id.includes('关注')) {
                f7router.navigate(`/collections/${userId}/following`);
            } else {
                f7router.navigate(`/collections/${userId}/mine`);
            }
        } else {
            f7router.navigate(`/people-more/${userId}/${id}`);
        }
    } else {
        handleCardClick(f7router, item);
    }
};

const navigateToPeopleList = (type) => {
    props.f7router.navigate(`/people-list/${type}/${userId}`);
};

// 在途锁：请求未回时再点会读到旧的 isFollowing，两次请求只记一笔关注却把计数加两次
const followPending = ref(false);

const toggleFollow = async () => {
    if (!userInfo.value || followPending.value) return;
    if (!requireLogin()) return;
    const isFollowing = userInfo.value.isFollowing;
    followPending.value = true;

    try {
        if (!isFollowing) {
            await followUser(userId);
            userInfo.value.isFollowing = true;
            userInfo.value.metrics.follower++;
            f7.toast.show({ text: '关注成功' });
        } else {
            await unfollowUser(userId, currentUser.value?.id || 'self');
            userInfo.value.isFollowing = false;
            userInfo.value.metrics.follower--;
            f7.toast.show({ text: '已取消关注' });
        }
    } catch (e) {
        f7.toast.show({ text: '操作失败' });
    } finally {
        followPending.value = false;
    }
};

// 拉黑/取消拉黑，屏蔽端点统一在 useBlockToggle
const { toggle: toggleBlock } = useBlockToggle(
    () => ({ id: userId, isBlocked: userInfo.value?.isBlocking }),
    (blocked) => { if (userInfo.value) userInfo.value.isBlocking = blocked; },
);

const { copyLink: copyUserLink, share: shareUser, report: reportUser } = useContentMenu({
    url: () => `https://www.zhihu.com/people/${userId}`,
    title: () => userInfo.value?.name,
    reportType: 'member',
    reportId: userId,
});

const showSearchPrompt = () => {
    f7.dialog.prompt(
        '请输入搜索关键词',
        '搜索内容',
        (value) => {
            if (value.trim()) {
                props.f7router.navigate(`/search-result/people/${value}/${userId}`);
            } else {
                f7.toast.show({ text: '搜索关键词不能为空' });
            }
        },
        (value) => {
            console.log('Canceled search input, value:', value);
        }
    );
};

</script>

<template>
    <f7-page class="user-profile">
        <f7-navbar class="profile-navbar">
            <f7-nav-left>
                <f7-link icon-only @click="handleBack">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="userInfo" class="navbar-title">{{ userInfo.name }}</f7-nav-title>
            <f7-nav-right>
                <f7-link icon-only popover-open=".user-actions-popover">
                    <f7-icon ios="f7:ellipsis_vertical" md="material:more_vert" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <div class="profile-main-content">
            <div class="profile-header-section" ref="headerRef">
                <div class="profile-header" v-if="userInfo">
                    <div class="cover-image"
                        :style="{ backgroundImage: userInfo.coverUrl ? `url(${userInfo.coverUrl})` : '' }"></div>
                    <div class="info-container">
                        <div class="avatar-row">
                            <img :src="userInfo.avatarUrl" class="avatar" />
                            <div class="action-buttons">
                                <f7-button class="message-btn" fill small
                                    @click="openLink('https://www.zhihu.com/messages')">
                                    私信
                                </f7-button>
                                <f7-button class="follow-btn" :fill="!(userInfo.isFollowing)" outline
                                    :color="userInfo.isFollowing ? 'gray' : undefined" small :loading="followPending"
                                    @click="toggleFollow">
                                    {{ (userInfo.isFollowing) ? '已关注' : '关注' }}
                                </f7-button>
                            </div>
                        </div>
                        <div class="name-row">
                            <h1 class="name">{{ userInfo.name }}</h1>
                            <div class="gender-badge" v-if="userInfo.gender !== -1">
                                <f7-icon :ios="userInfo.gender === 1 ? 'f7:person' : 'f7:person'"
                                    :md="userInfo.gender === 1 ? 'material:male' : 'material:female'" size="16" />
                            </div>
                        </div>
                        <div class="headline" v-if="userInfo.headline">{{ userInfo.headline }}</div>

                        <div class="stats-row">
                            <div class="stat-item" @click="navigateToPeopleList('followees')">
                                <span class="stat-val">{{ userInfo.metrics.following || 0 }}</span>
                                <span class="stat-label">关注</span>
                            </div>
                            <div class="stat-item" @click="navigateToPeopleList('followers')">
                                <span class="stat-val">{{ userInfo.metrics.follower || 0 }}</span>
                                <span class="stat-label">粉丝</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-val">{{ userInfo.metrics.voteup || 0 }}</span>
                                <span class="stat-label">获赞</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tabs-section">
                <TabLayout v-if="tabs.length > 0" :tabs="tabs" :onChange="(id) => activeTab = id"
                    :auto-page-content="false" :fixed="false" :scrollable="true" :initialActiveId="activeTab">
                    <template v-for="tab in tabs" :key="tab.id" #[tab.id]>
                        <f7-page-content ptr @ptr:refresh="(done) => onRefresh(tab.id, done)" infinite
                            :ref="(el) => setScrollRef(el, tab.id)" @infinite="() => onLoadMore(tab.id)"
                            class="tab-scroll-content">
                            <div class="content-list">
                                <div v-if="tab.id === 'answer'"
                                    class="tab-sort-bar padding-horizontal padding-top-half display-flex align-items-center">
                                    <span class="text-color-gray font-size-12">排序方式：</span>
                                    <div class="sort-selector">
                                        <f7-link :class="{ 'active-sort': answerSort === 'created' }"
                                            @click="answerSort = 'created'">最新</f7-link>
                                        <span class="divider">/</span>
                                        <f7-link :class="{ 'active-sort': answerSort === 'voteup_count' }"
                                            @click="answerSort = 'voteup_count'">最热</f7-link>
                                    </div>
                                </div>
                                <EmptyState v-if="!tabData[tab.id]?.list || tabData[tab.id]?.list.length === 0"
                                    text="暂无内容" />

                                <f7-card class="profile-content-card" v-for="(item, index) in tabData[tab.id]?.list"
                                    :key="item.id ?? index" @click="handleItemClick(f7router, item)">
                                    <f7-card-content>
                                        <div class="user-info-section">
                                            <div class="user-avatar" v-if="item.avatarUrl">
                                                <img :src="item.avatarUrl" class="avatar-img" />
                                            </div>
                                            <div class="user-avatar" v-else>
                                                <div class="avatar-placeholder"></div>
                                            </div>
                                            <div class="user-action-info">
                                                <div class="action-text">{{ item.actionName }}</div>
                                                <div class="action-time" v-if="item.createdAt">{{ item.createdAt }}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="content-title" v-if="item.title">
                                            <h3 v-html="item.title"></h3>
                                        </div>

                                        <div class="content-preview" v-if="item.excerpt">
                                            <div class="excerpt-text" v-html="item.excerpt"></div>
                                        </div>
                                    </f7-card-content>

                                    <f7-card-footer>
                                        <MetricRow :items="[
                                            { icon: ICON.like, value: item.metrics?.likes },
                                            { icon: ICON.comment, value: item.metrics?.comments },
                                            { icon: ICON.view, value: item.metrics?.views },
                                        ]" />
                                    </f7-card-footer>
                                </f7-card>

                                <LoadMoreFooter :has-more="tabData[tab.id]?.hasMore"
                                    :length="tabData[tab.id]?.list.length || 0" text="已加载全部内容" />
                            </div>
                        </f7-page-content>
                    </template>
                </TabLayout>
            </div>
        </div>

        <f7-popover class="user-actions-popover">
            <f7-list>
                <f7-list-item title="分享" link popover-close @click="shareUser" />
                <f7-list-item title="复制链接" link popover-close @click="copyUserLink" />
                <f7-list-item title="搜索内容" link popover-close @click="showSearchPrompt" />
                <f7-list-item v-if="userInfo" title="举报" link popover-close @click="reportUser" />
                <f7-list-item v-if="userInfo" :title="userInfo.isBlocking ? '取消拉黑' : '拉黑'" color="red" link
                    popover-close @click="toggleBlock" />
            </f7-list>
        </f7-popover>
    </f7-page>
</template>

<style scoped>
.user-profile {
    height: 100%;
}

.profile-header-section {
    flex-shrink: 0;
}

.tabs-section {
    height: calc(100dvh - var(--f7-navbar-height) - var(--f7-safe-area-top) - var(--f7-toolbar-height));
    display: flex;
    flex-direction: column;
}

.tab-scroll-content {
    height: 100%;
}

.profile-navbar {
    z-index: 100;
}

.cover-image {
    height: 160px;
    background-color: var(--app-placeholder-bg);
    background-size: cover;
    background-position: center;
}

.info-container {
    padding: 0 16px 16px;
    margin-top: -32px;
}

.avatar-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.action-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.message-btn {
    margin-right: 8px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 4px solid var(--f7-page-bg-color);
    object-fit: cover;
}

.follow-btn {
    margin-bottom: 8px;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
}

.name {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 12px 0 0;
}


.headline {
    margin-top: 8px;
    font-size: 0.95rem;
    color: var(--f7-text-color);
}

.stats-row {
    display: flex;
    gap: 24px;
    margin-top: 16px;
}

.stat-item {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.stat-val {
    font-weight: bold;
}

.stat-label {
    font-size: 0.8rem;
    color: var(--app-sub-text);
    margin-left: 4px;
}

.content-list {
    padding: 0;
}

.tab-sort-bar {
    background: var(--f7-bars-bg-color);
    height: 36px;
    border-bottom: 1px solid var(--app-divider-color);
}

.sort-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
}

.sort-selector .link {
    color: var(--app-sub-text);
}

.sort-selector .link.active-sort {
    color: var(--f7-theme-color);
    font-weight: bold;
}

.sort-selector .divider {
    color: var(--app-divider-color);
}

.profile-content-card {
    cursor: pointer;
    margin: 8px 16px !important;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.profile-content-card:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-info-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--app-divider-color);
}

.avatar-img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.avatar-placeholder {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: var(--app-placeholder-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--app-sub-text);
    font-size: 12px;
    font-weight: bold;
    flex-shrink: 0;
}

.user-action-info {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.action-text {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
}

.action-time {
    font-size: 12px;
    color: var(--app-faint-text);
    margin: 0;
}

.content-title {
    margin-bottom: 8px;
}

.content-title h3 {
    font-size: 17px;
    font-weight: 700;
    margin: 0;
    line-height: 1.4;
}

.content-preview {
    margin-bottom: 12px;
}

.excerpt-text {
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}

.content-img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    display: block;
}

.profile-content-card .card-footer {
    background-color: var(--f7-list-bg-color);
    border-top: 1px solid var(--app-divider-color);
    padding: 10px 16px;
    margin: 0;
}

</style>
