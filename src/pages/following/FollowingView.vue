<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { useUser, requireLogin } from '@/composables/userManager';
import { usePageState } from '@/composables/usePageState.js';
import { useTabbedPagedList } from '@/composables/useTabbedPagedList.js';
import { followUser, unfollowUser } from '@/composables/useFollowToggle.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7router: Object,
    tab: String
});
const { currentUser } = useUser();
const userId = computed(() => currentUser.value?.id || '');
const activeTab = ref(props.tab || 'questions');

const tabs = computed(() => [
    { id: 'questions', label: '问题', url: `https://api.zhihu.com/people/${userId.value}/following_questions` },
    { id: 'collections', label: '收藏夹', url: `https://api.zhihu.com/people/${userId.value}/following_collections` },
    { id: 'topics', label: '话题', url: `https://api.zhihu.com/people/${userId.value}/following_topics` },
    { id: 'columns', label: '专栏', url: `https://api.zhihu.com/people/${userId.value}/following_columns` },
    { id: 'users', label: '用户', url: `https://api.zhihu.com/people/${userId.value}/followees` },
    { id: 'specials', label: '专题', url: `https://api.zhihu.com/people/${userId.value}/following_news_specials` },
    { id: 'roundtables', label: '圆桌', url: `https://api.zhihu.com/people/${userId.value}/following_roundtables` }
]);

const urlFor = (tabId) => tabs.value.find(t => t.id === tabId).url;

const { tabs: tabData, loading: tabLoading, ensure, refresh, loadMore, ensureLoaded, reset } = useTabbedPagedList({
    name: '关注列表',
    tabs: () => tabs.value.map(t => t.id),
    fillEl: (tabId) => scrollElements[tabId],
    fetch: (tabId, signal) => $http.get(`${urlFor(tabId)}?limit=20`, { signal }),
    map: (item, tabId) => mapItem(tabId, item),
});

ensure();

const scrollElements = {};
const setScrollRef = (elRef, id) => {
    if (elRef) scrollElements[id] = elRef.$el;
};

const { hasCache } = usePageState({
    state: {
        tabData,
        activeTab
    },
    scroll: (main) => ({ main, ...scrollElements })
});

const mapItem = (tabId, item) => {
    switch (tabId) {
        case 'questions':
            return {
                id: item.id,
                title: item.title,
                subtitle: `${item.answer_count} 个回答 · ${item.follower_count} 个关注`,
                type: 'question'
            };
        case 'collections':
            return {
                id: item.id,
                title: item.title,
                subtitle: `由 ${item.creator?.name} 创建`,
                after: `${item.follower_count}人关注`,
                image: item.creator?.avatar_url,
                type: 'collection'
            };
        case 'topics':
            return {
                id: item.id,
                title: item.name,
                subtitle: item.excerpt || '无介绍',
                type: 'topic'
            };
        case 'columns':
            return {
                id: item.id,
                title: item.title,
                subtitle: item.description || '无介绍',
                footer: `${item.items_count} 篇内容 · ${item.voteup_count} 个赞同`,
                type: 'column'
            };
        case 'users': {
            // followees 返回可能带 member 包装，取值口径与 PeopleListView 一致
            const member = item.member || item;
            return {
                id: member.id,
                title: member.name,
                subtitle: member.headline || '无签名',
                image: member.avatar_url,
                isFollowing: item.is_following || member.is_following || false,
                type: 'people'
            };
        }
        case 'specials':
        case 'roundtables': {
            // 外链要的是 url 里的 slug，数字 id 拼出来会 404
            const kind = tabId === 'specials' ? 'special' : 'roundtable';
            return {
                id: item.url?.match(new RegExp(`${kind}/(.+)`))?.[1] || item.id,
                title: item.title,
                subtitle: item.subtitle?.content || '无介绍',
                footer: item.footline?.content,
                type: kind
            };
        }
        default:
            return item;
    }
};

const onRefresh = async (tabId, done) => {
    await refresh(tabId);
    if (done) done();
};

const onInfinite = (tabId) => {
    loadMore(tabId);
};
const handleFollowClick = async (item) => {
    if (!requireLogin()) return;
    try {
        if (item.isFollowing) {
            await unfollowUser(item.id, userId.value);
            item.isFollowing = false;
            f7.toast.create({ text: '取关成功' }).open();
        } else {
            await followUser(item.id);
            item.isFollowing = true;
            f7.toast.create({ text: '关注成功' }).open();
        }
    } catch (e) {
        f7.toast.create({ text: '操作失败' }).open();
    }
};

// currentUser 由 App 异步刷新填充，冷启动直达本页时 id 尚为空，直接请求会打出 people//xxx 的坏请求
const loadTab = (tabId) => {
    if (userId.value) ensureLoaded(tabId);
};

onMounted(() => {
    if (!hasCache.value) loadTab(activeTab.value);
});

watch(activeTab, loadTab);

watch(userId, (newId) => {
    if (!newId) return;
    tabs.value.forEach(tab => reset(tab.id));
    ensureLoaded(activeTab.value);
});
</script>

<template>
    <f7-page class="following-view">
        <f7-navbar title="我的关注" back-link="返回" />

        <!-- Tabbar (Toolbar) -->
        <f7-toolbar tabbar top scrollable class="following-tabbar">
            <f7-link v-for="tab in tabs" :key="tab.id" :tab-link="`#tab-${tab.id}`"
                :tab-link-active="activeTab === tab.id" @click="activeTab = tab.id">
                {{ tab.label }}
            </f7-link>
        </f7-toolbar>

        <!-- Tabs Content -->
        <f7-tabs class="tabs-auto-page-content" swipeable animated>
            <f7-tab v-for="tab in tabs" :key="tab.id" :id="`tab-${tab.id}`" :tab-active="activeTab === tab.id"
                class="following-tab-content" @tab:show="activeTab = tab.id">
                <f7-page-content ptr @ptr:refresh="(done) => onRefresh(tab.id, done)" infinite
                    @infinite="onInfinite(tab.id)" :ref="(el) => setScrollRef(el, tab.id)"
                    class="tab-scroll-content">
                    <div class="card-list-container">
                        <f7-card v-for="item in tabData[tab.id].list" :key="item.id" class="following-item-card"
                            @click="$handleCardClick(f7router, item)">
                            <div class="card-flex-layout">
                                <div v-if="item.image" class="media-side">
                                    <img :src="item.image" class="item-image" />
                                </div>

                                <div class="content-side">
                                    <div class="title-row">
                                        <span class="item-title">{{ item.title }}</span>
                                        <f7-button v-if="tab.id === 'users'" small outline class="follow-btn"
                                            @click.stop="handleFollowClick(item)">
                                            {{ item.isFollowing ? '取关' : '关注' }}
                                        </f7-button>
                                    </div>
                                    <div class="subtitle-text">{{ item.subtitle }}</div>
                                    <div v-if="item.footer || item.after" class="card-footer-info">
                                        <span v-if="item.footer">{{ item.footer }}</span>
                                        <span v-if="item.after" class="after-tag">{{ item.after }}</span>
                                    </div>
                                </div>
                            </div>
                        </f7-card>
                    </div>

                    <LoadMoreFooter :has-more="tabData[tab.id].hasMore" :length="tabData[tab.id].list.length" />
                    <EmptyState v-if="!tabLoading[tab.id] && tabData[tab.id].list.length === 0"
                        icon="tray" text="暂无关注内容" />
                </f7-page-content>
            </f7-tab>
        </f7-tabs>
    </f7-page>
</template>

<style scoped>
.following-tabbar {
    z-index: 100;
}

.card-list-container {
    padding: 8px 0;
}

.following-item-card {
    margin: 12px 16px !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
    cursor: pointer;
    transition: transform 0.2s;
}

.card-flex-layout {
    display: flex;
    padding: 16px;
    gap: 12px;
    align-items: flex-start;
}

.media-side {
    flex-shrink: 0;
}

.item-image {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--app-divider-color);
}

.content-side {
    flex: 1;
    min-width: 0;
}

.title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
}

.item-title {
    font-weight: 700;
    font-size: 16px;
    line-height: 1.3;
}

.subtitle-text {
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer-info {
    margin-top: 8px;
    font-size: 12px;
    color: var(--app-sub-text);
    display: flex;
    justify-content: space-between;
}

.after-tag {
    font-weight: 500;
}

.follow-btn {
    margin-left: 8px;
    font-size: 12px;
    height: 26px;
    padding: 0 10px;
}

</style>
