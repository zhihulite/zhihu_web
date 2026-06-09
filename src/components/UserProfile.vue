<script setup>
import { ref, onMounted, watch, reactive, nextTick } from 'vue';
import TabLayout from './TabLayout.vue';
import $http from '../api/http.js';
import { HistoryService } from '../services/historyService.js';
import { f7 } from 'framework7-vue';
import { useHistory } from '../composables/useHistory.js';
import { useUser } from '../composables/userManager.js';

const { currentUser } = useUser();

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});

const { register, restoreState } = useHistory(props, 'user_profile');
const hasHistory = !!restoreState();

const userId = props.f7route?.params?.id;
const userInfo = ref(null);
const loading = ref(false);
const activeTab = ref('activities');
const answerSort = ref('created');

const tabData = reactive({});

const tabs = ref([]);

const pageRef = ref(null);
const scrollElements = {};
const setScrollRef = (elRef, id) => {
    if (elRef) scrollElements[id] = elRef.$el;
};

register({
    state: {
        userInfo,
        loading,
        activeTab,
        answerSort,
        tabData,
        tabs
    },
    scroll: () => ({
        main: pageRef.value?.$el?.querySelector('.page-content'),
        ...scrollElements
    })
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

            if (url) {
                const tabId = mapKey || id;
                finalTabs.push({ id: tabId, label: tab.title, url, key: mapKey });

                if (!tabData[tabId]) {
                    tabData[tabId] = { list: [], page: 1, hasMore: true, loading: false, url };
                }
            }
        });

        const actIndex = finalTabs.findIndex(t => t.id === 'activities');
        if (actIndex > 0) {
            const actTab = finalTabs.splice(actIndex, 1)[0];
            finalTabs.unshift(actTab);
        } else if (actIndex === -1) {
            const actUrl = urlsMap.activities;
            finalTabs.unshift({ id: 'activities', label: '动态', url: actUrl });
            if (!tabData['activities']) {
                tabData['activities'] = { list: [], page: 1, hasMore: true, loading: false, url: actUrl };
            }
        }

        tabs.value = finalTabs;
        if (finalTabs.length > 0) {
            activeTab.value = finalTabs[0].id;
        }

    } catch (e) {
        console.error('Fetch tabs failed', e);
        const fallback = [
            { id: 'activities', label: '动态', url: urlsMap.activities },
        ];
        fallback.forEach(t => {
            if (!tabData[t.id]) tabData[t.id] = { list: [], page: 1, hasMore: true, loading: false, url: t.url };
        });
        tabs.value = fallback;
        activeTab.value = 'activities';
    }
};

const fetchUserInfo = async () => {
    loading.value = true;
    try {
        const data = await $http.get(`https://api.zhihu.com/people/${userId}`);

        const mappedItem = {
            id: data.id,
            name: data.name,
            avatarUrl: data.avatar_url,
            coverUrl: data.cover_url,
            isBlocking: data.is_blocking,
            headline: data.headline,
            metrics: {
                follower: data.follower_count || 0,
                following: data.following_count || 0,
                voteup: data.voteup || 0,
            },
            isUpvoted: data.reaction?.relation?.vote === "UP" ? true : false,
            isLiked: data.reaction?.relation?.liked || false,
            isFavorited: data.reaction?.relation?.faved || false
        };

        userInfo.value = mappedItem;

        HistoryService.addRecord({
            id: mappedItem.id,
            type: 'people',
            title: mappedItem.name,
            preview: mappedItem.headline || '无签名'
        });
    } catch (e) {
        console.error('Failed to fetch user info', e);
    } finally {
        loading.value = false;
    }
};

const fetchContent = async (tabId, isRefresh = false) => {
    const dataState = tabData[tabId];
    if (dataState.loading) return;
    if (!isRefresh && !dataState.hasMore) return;

    dataState.loading = true;

    try {
        let res;

        if (isRefresh || !dataState.lastResult) {
            let url = dataState.url;
            if (tabId === 'answer') {
                const baseUrl = url.split('?')[0];
                url = `${baseUrl}?order_by=${answerSort.value}&offset=0&limit=20`;
            }

            res = await $http.get(url);
        } else {
            if (dataState.lastResult) {
                res = await dataState.lastResult.next();
            }
        }

        let processedItems = [];
        const avatarUrl = userInfo.value.avatarUrl;
        const moreTabs = res.more_tabs || [];
        if (moreTabs.length > 0) {
            processedItems = moreTabs.map(tabItem => {
                const title = tabItem.title;
                const subtitleInfo = tabItem.sub_title ? `共有${tabItem.sub_title}个内容 ` : '';
                const excerpt = `${subtitleInfo}点击查看`;

                return {
                    id: title,
                    title: title,
                    excerpt: excerpt,
                    avatarUrl: avatarUrl,
                    type: 'more_tab',
                    actionName: "的更多",
                    metrics: { likes: 0, comments: 0 }
                };
            });
            res.paging = {}
            res.paging.is_end = true
        } else {
            const rawList = res.data || [];

            processedItems = rawList.map(item => {
                const targetItem = item.target || item;
                const type = targetItem.type === 'moments_pin' ? 'pin' : targetItem.type;

                const likes = targetItem.voteup_count || targetItem.like_count || 0;
                const comments = targetItem.comment_count || targetItem.items_count || 0;

                let title = targetItem.title || targetItem.name;
                let id = targetItem.id;
                let excerpt = targetItem.excerpt;
                let actionName = item?.source?.action_text;
                switch (type) {
                    case "answer":
                        title = targetItem.question?.title || "无标题";
                        actionName = actionName || "发布了回答";
                        break;

                    case "topic":
                        title = title || "未知话题";
                        actionName = actionName || "发布了话题";
                        excerpt = "无预览内容";
                        break;

                    case "question":
                        title = title || "未知问题";
                        actionName = actionName || "发布了问题";
                        excerpt = "无预览内容";
                        break;

                    case "column":
                        title = title || "未知专栏";
                        actionName = actionName || "发布了专栏";
                        excerpt = item.intro || "无介绍";
                        break;

                    case "collection":
                        title = `关注了${title}`
                        break;

                    case "people":
                        title = `关注了${title}`
                        break;

                    case "pin":
                        const firstContent = item.content?.[0];
                        if (item.content?.length > 0 && firstContent?.title && firstContent.title !== "") {
                            title = firstContent.title;
                        } else {
                            title = "一个想法";
                        }
                        actionName = actionName || "发布了想法";
                        excerpt = item.content_html || "";
                        break;

                    case "article":
                        title = title || "未知文章";
                        actionName = actionName || "发布了文章";
                        break;

                    case "zvideo":
                        title = title || "未知视频";
                        actionName = actionName || "发布了视频";
                        break;

                    case "roundtable":
                        title = title || "未知圆桌";
                        actionName = actionName || "关注了圆桌";
                        excerpt = item.description || "无描述";
                        break;

                    case "special":
                        title = item.title || "未知专题";
                        actionName = actionName || "关注了专题";
                        excerpt = item.description || "无描述";
                        break;

                    default:
                        console.log(item)
                        title = "未知";
                        actionName = "未知";
                        break;
                }

                return {
                    title,
                    excerpt,
                    actionName,
                    avatarUrl,
                    type,
                    id,
                    type,
                    metrics: {
                        likes,
                        comments,
                    }
                };
            });
        }

        if (isRefresh) {
            dataState.list = processedItems;
        } else {
            dataState.list.push(...processedItems);
        }

        dataState.lastResult = res;
        dataState.hasMore = !res.paging?.is_end;


    } catch (e) {
        console.error(`Failed to fetch content for ${tabId}`, e);
        dataState.hasMore = false;
    } finally {
        dataState.loading = false;
    }
};

const headerHeight = ref(0);
const headerRef = ref(null);

onMounted(() => {
    if (!hasHistory) {
        fetchUserInfo();
        fetchTabs().then(() => {
            if (activeTab.value) fetchContent(activeTab.value);
        });
    }

    nextTick(() => {
        if (headerRef.value) {
            headerHeight.value = headerRef.value.offsetHeight;
        }
    });
});

watch(activeTab, (newId) => {
    if (newId) fetchContent(newId);
});

watch(answerSort, () => {
    if (tabData['answer']) {
        tabData['answer'].list = [];
        tabData['answer'].lastResult = null;
        fetchContent('answer', true);
    }
});

const onRefresh = async (tabId, done) => {
    const id = tabId || activeTab.value;
    if (id) {
        await fetchContent(id, true);
    }
    if (done) done();
};

const onLoadMore = (tabId) => {
    const id = tabId || activeTab.value;
    if (id) {
        const dataState = tabData[id];
        if (dataState && dataState.hasMore) {
            fetchContent(id, false);
        }
    }
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
        window.$handleCardClick(f7router, item)
    }
};

const navigateToPeopleList = (type) => {
    props.f7router.navigate(`/people-list/${type}/${userId}`);
};

const toggleFollow = async () => {
    if (!userInfo.value) return;
    const isFollowing = userInfo.value.isFollowing;
    const url = `https://api.zhihu.com/people/${userId}/followers`;

    try {
        if (!isFollowing) {
            await $http.post(url, "", { encryptHead: true });
            f7.toast.show({ text: '关注成功' });
            userInfo.value.isFollowing = true;
            userInfo.value.metrics.follower++;
        } else {
            const currentUserId = currentUser.value?.id || 'self';
            await $http.delete(`${url}/${currentUserId}`, "", { encryptHead: true });
            f7.toast.show({ text: '已取消关注' });
            userInfo.value.isFollowing = false;
            userInfo.value.metrics.follower--;
        }
    } catch (e) {
        f7.toast.show({ text: '操作失败' });
    }
};

const toggleBlock = async () => {
    if (!userInfo.value) return;
    const isBlocking = userInfo.value.isBlocking;

    try {
        if (!isBlocking) {
            await $http.post(`https://api.zhihu.com/settings/blocked_users`, `people_id=${userId}`, { encryptHead: true, encryptBody: false });
            f7.toast.show({ text: '已拉黑' });
            userInfo.value.isBlocking = true;
        } else {
            await $http.delete(`https://api.zhihu.com/settings/blocked_users/${userId}`, "", { encryptHead: true, encryptBody: false });
            f7.toast.show({ text: '已取消拉黑' });
            userInfo.value.isBlocking = false;
        }
    } catch (e) {
        f7.toast.show({ text: '操作失败' });
    }
};

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
    <f7-page class="user-profile" :ref="(el) => pageRef = el">
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
                                    @click="props.f7router.navigate(`/messages/${userId}`)">
                                    私信
                                </f7-button>
                                <f7-button class="follow-btn" :fill="!(userInfo.isFollowing)" outline
                                    :color="userInfo.isFollowing ? 'gray' : undefined" small @click="toggleFollow">
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
                <TabLayout v-if="tabs.length > 0" :tabs="tabs" :active-id="activeTab" :onChange="(id) => activeTab = id"
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
                                        <f7-link :class="{ 'active-sort': answerSort === 'voteups' }"
                                            @click="answerSort = 'voteups'">最热</f7-link>
                                    </div>
                                </div>
                                <div v-if="!tabData[tab.id]?.list || tabData[tab.id]?.list.length === 0"
                                    class="empty-state">
                                    暂无内容
                                </div>

                                <f7-card class="profile-content-card" v-for="(item, index) in tabData[tab.id]?.list"
                                    :key="index" :item="item" @click="handleItemClick(f7router, item)">
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
                                        <div class="content-metrics">
                                            <span class="metric-item" v-if="item.metrics?.likes !== undefined">
                                                <f7-icon ios="f7:hand_thumbsup" md="material:thumb_up" size="14" />
                                                {{
                                                    item.metrics.likes }}
                                            </span>
                                            <span class="metric-item" v-if="item.metrics?.comments !== undefined">
                                                <f7-icon ios="f7:bubble_left" md="material:chat_bubble" size="14" />
                                                {{
                                                    item.metrics.comments }}
                                            </span>
                                            <span class="metric-item" v-if="item.metrics?.views !== undefined">
                                                <f7-icon ios="f7:eye" md="material:visibility" size="14" /> {{
                                                    item.metrics.views }}
                                            </span>
                                        </div>
                                    </f7-card-footer>
                                </f7-card>

                                <div v-if="!tabData[tab.id]?.hasMore && tabData[tab.id]?.list.length > 0"
                                    class="end-text text-align-center padding-vertical text-color-gray">
                                    已加载全部内容
                                </div>
                            </div>
                        </f7-page-content>
                    </template>
                </TabLayout>
            </div>
        </div>

        <f7-popover class="user-actions-popover">
            <f7-list>
                <f7-list-item title="搜索内容" link popover-close @click="showSearchPrompt" />
                <f7-list-item v-if="userInfo" :title="userInfo.isBlocking ? '取消拉黑' : '拉黑'" color="red" link
                    popover-close @click="toggleBlock" />
                <f7-list-item v-if="userInfo" title="举报" link popover-close
                    @click="$openLink(`https://www.zhihu.com/report?id=${userId}&type=member&source=android&ab_signature=`)" />
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
    border: 4px solid #fff;
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
    color: #444;
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
    color: #666;
    margin-left: 4px;
}

.content-list {
    padding: 0;
}

.loading-state {
    display: flex;
    justify-content: center;
    padding: 32px;
}

.load-more {
    display: flex;
    justify-content: center;
    padding: 16px;
}

.end-text {
    font-size: 0.8rem;
}

.tab-sort-bar {
    background: #fdfdfd;
    height: 36px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.sort-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
}

.sort-selector .f7-link {
    color: #999;
}

.sort-selector .f7-link.active-sort {
    color: var(--f7-theme-color);
    font-weight: bold;
}

.sort-selector .divider {
    color: #eee;
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
    border-bottom: 1px solid var(--f7-border-color);
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
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
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
    color: var(--f7-text-color-tertiary);
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

.content-image-container {
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--f7-bg-color);
    margin-bottom: 0;
}

.content-img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    display: block;
}

.profile-content-card .card-footer {
    background-color: var(--f7-list-bg-color);
    border-top: 1px solid var(--f7-border-color);
    padding: 10px 16px;
    margin: 0;
}

.content-metrics {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: var(--f7-text-color-tertiary);
    margin: 0;
}

.metric-item {
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
    margin: 0;
}

.empty-state {
    padding: 100px 32px;
    text-align: center;
    color: #999;
}
</style>
