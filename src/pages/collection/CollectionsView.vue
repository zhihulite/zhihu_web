<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { useUser } from '@/composables/userManager';
import { usePageState } from '@/composables/usePageState.js';
import { useTabbedPagedList } from '@/composables/useTabbedPagedList.js';
import EmptyState from '@/components/EmptyState.vue';
import CollectionEditSheet from '@/components/CollectionEditSheet.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7router: Object,
    f7route: Object
});

const activeTab = ref(props.f7route?.params?.defaultTab || 'mine');
const { currentUser } = useUser();
const routeUserId = props.f7route?.params?.userId;
const effectiveUserId = computed(() => routeUserId || currentUser.value?.id || '');
const isOwnProfile = computed(() => !routeUserId || routeUserId === currentUser.value?.id);

const scrollElements = {};
const setScrollRef = (elRef, id) => {
    if (elRef) scrollElements[id] = elRef.$el;
};

const tabs = computed(() => {
    const uid = effectiveUserId.value;
    const baseTabs = [
        { id: 'mine', label: "收藏", url: `https://api.zhihu.com/people/${uid}/collections_v2` },
        { id: 'following', label: "关注", url: `https://api.zhihu.com/people/${uid}/following_collections` }
    ];
    if (isOwnProfile.value) {
        baseTabs.push({ id: 'recommend', label: '推荐内容', url: 'https://api.zhihu.com/explore/collections' });
    }
    return baseTabs;
});

const urlFor = (tabId) => tabs.value.find(t => t.id === tabId).url;

const { tabs: tabData, loading: tabLoading, ensure, refresh, loadMore, ensureLoaded, reset } = useTabbedPagedList({
    name: '收藏夹列表',
    tabs: () => tabs.value.map(t => t.id),
    fillEl: (tabId) => scrollElements[tabId],
    fetch: (tabId, signal) => $http.get(`${urlFor(tabId)}?limit=20`, { isWWW: tabId !== 'recommend', signal }),
    map: (item, tabId) => mapItem(tabId, item),
});

ensure();

// 主页收藏的 tab 内容随登录账号变化，不参与状态恢复
const { hasCache } = usePageState({
    enabled: Boolean(props.f7route?.params?.defaultTab),
    state: {
        activeTab,
        tabData
    },
    scroll: (main) => ({ main, ...scrollElements })
});

const editSheet = reactive({ open: false, collection: null });
const mapItem = (tabId, item) => {
    switch (tabId) {
        case 'mine':
            return {
                id: item.id,
                title: item.title,
                description: item.description || '',
                isPublic: item.is_public !== false,
                subtitle: `${item.item_count || 0} 个内容`,
                footer: `${item.follower_count || 0}人关注 · ${item.comment_count || 0}条评论`,
                type: 'mine'
            };

        case 'recommend':
            return {
                id: item.id,
                title: item.title,
                creatorName: item.creator?.name,
                creatorAvatar: item.creator?.avatar_url,
                subtitle: item.description || '无介绍',
                footer: `${item.item_count || 0}个内容 · ${item.follower_count || 0}个关注${item.is_following ? ' · 已关注' : ''}`,
                header: `由 ${item.creator?.name} 创建`,
                type: 'recommend'
            };

        default:
            return {
                id: item.id,
                title: item.title,
                creatorName: item.creator?.name,
                creatorAvatar: item.creator?.avatar_url,
                subtitle: `由 ${item.creator?.name} 创建 · ${item.item_count || 0}个内容`,
                footer: `${item.follower_count || 0}人关注`,
                type: 'following'
            };
    }
};

const onRefresh = async (tabId, done) => {
    await refresh(tabId);
    if (done) done();
};

const onInfinite = (tabId) => {
    loadMore(tabId);
};

const handleCollectionClick = (item) => {
    props.f7router.navigate(`/collection/${item.id}`);
};

const createNewCollection = () => {
    editSheet.collection = null;
    editSheet.open = true;
};

const editCollection = (item) => {
    editSheet.collection = { id: item.id, title: item.title, description: item.description, isPublic: item.isPublic };
    editSheet.open = true;
};

// 创建/保存后重取「我的」列表，拿到服务端权威的标题/隐私/条数
const onEditSaved = () => {
    if (tabs.value.some((t) => t.id === 'mine')) {
        reset('mine');
        refresh('mine');
    }
};

onMounted(() => {
    if (!hasCache.value && effectiveUserId.value) {
        ensureLoaded(activeTab.value);
    }
});

watch(effectiveUserId, (newId) => {
    if (newId) {
        tabs.value.forEach(tab => reset(tab.id));
        ensureLoaded(activeTab.value);
    }
});

watch(activeTab, (newTab) => {
    ensureLoaded(newTab);
});

const showSearchPrompt = () => {
    f7.dialog.prompt(
        '请输入搜索关键词',
        '搜索内容',
        (value) => {
            if (value.trim()) {
                props.f7router.navigate(`/search-result/collection/${value}/${effectiveUserId.value}`);
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
    <f7-page class="collections-view">
        <f7-navbar title="收藏" back-link="返回">
            <f7-nav-right>
                <f7-link v-if="isOwnProfile" icon-only popover-open=".collection-actions-popover">
                    <f7-icon ios="f7:ellipsis_vertical" md="material:more_vert" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-toolbar tabbar top class="collections-tabbar">
            <f7-link v-for="tab in tabs" :key="tab.id" :tab-link="`#col-tab-${tab.id}`"
                :tab-link-active="activeTab === tab.id" @click="activeTab = tab.id">
                {{ tab.label }}
            </f7-link>
        </f7-toolbar>

        <f7-tabs class="tabs-auto-page-content" swipeable animated>
            <f7-tab v-for="tab in tabs" :key="tab.id" :id="`col-tab-${tab.id}`" :tab-active="activeTab === tab.id"
                class="collections-tab-content" @tab:show="activeTab = tab.id">
                <f7-page-content ptr @ptr:refresh="(done) => onRefresh(tab.id, done)" infinite
                    @infinite="onInfinite(tab.id)" class="tab-scroll-content" :ref="(el) => setScrollRef(el, tab.id)">

                    <div class="card-list-container">
                        <!-- Create New Card for 'mine' tab (only for own profile) -->
                        <f7-card v-if="tab.id === 'mine' && isOwnProfile" class="create-collection-card"
                            @click="createNewCollection">
                            <div class="create-content">
                                <f7-icon ios="f7:plus_circle_fill" md="material:add_circle" size="28" />
                                <span>新建收藏夹</span>
                            </div>
                        </f7-card>

                        <f7-card v-for="item in tabData[tab.id].list" :key="item.id" class="collection-item-card"
                            @click="handleCollectionClick(item)">
                            <div class="card-inner">
                                <div class="card-main">
                                    <div v-if="item.header" class="header-text">{{ item.header }}</div>
                                    <div class="title-row">
                                        <f7-icon v-if="tab.id === 'mine' && !item.isPublic" ios="f7:lock_fill"
                                            md="material:lock" size="14" class="lock-icon" />
                                        <span class="collection-title">{{ item.title }}</span>
                                        <f7-link v-if="tab.id === 'mine'" icon-only class="collection-edit"
                                            @click.stop="editCollection(item)">
                                            <f7-icon ios="f7:pencil" md="material:edit" size="16" />
                                        </f7-link>
                                    </div>
                                    <div class="collection-subtitle">{{ item.subtitle }}</div>
                                    <div class="collection-footer">{{ item.footer }}</div>
                                </div>
                                <div v-if="item.creatorAvatar" class="creator-media">
                                    <img :src="item.creatorAvatar" class="avatar-small" />
                                </div>
                            </div>
                        </f7-card>
                    </div>
                    <LoadMoreFooter :has-more="tabData[tab.id].hasMore" :length="tabData[tab.id].list.length" />
                    <EmptyState v-if="!tabLoading[tab.id] && tabData[tab.id].list.length === 0"
                        icon="folder_badge_plus" text="还没有收藏任何内容" />
                </f7-page-content>
            </f7-tab>
        </f7-tabs>

        <CollectionEditSheet v-model="editSheet.open" :collection="editSheet.collection" @saved="onEditSaved" />

        <f7-popover v-if="isOwnProfile" class="collection-actions-popover">
            <f7-list>
                <f7-list-item title="搜索收藏内容" link popover-close @click="showSearchPrompt" />
                <f7-list-item title="新建收藏夹" link popover-close @click="createNewCollection" />
            </f7-list>
        </f7-popover>
    </f7-page>
</template>

<style scoped>
.collections-tabbar {
    z-index: 100;
}

.header-text {
    font-size: 12px;
    color: var(--app-sub-text);
    margin-bottom: 2px;
}

.collection-edit {
    margin-left: auto;
    flex-shrink: 0;
}

.card-list-container {
    padding: 8px 0;
}

.create-collection-card {
    margin: 12px 16px !important;
    border-radius: 12px !important;
    border: 1px dashed var(--f7-theme-color) !important;
    background: rgba(var(--f7-theme-color-rgb), 0.03) !important;
    box-shadow: none !important;
    cursor: pointer;
}

.create-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--f7-theme-color);
    font-weight: 600;
}

.collection-item-card {
    margin: 12px 16px !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
    cursor: pointer;
}

.card-inner {
    display: flex;
    padding: 16px;
    gap: 16px;
    align-items: center;
}

.card-main {
    flex: 1;
    min-width: 0;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.lock-icon {
    color: var(--app-sub-text);
    flex-shrink: 0;
}

.collection-title {
    font-weight: 700;
    font-size: 16px;
    line-height: 1.4;
}

.collection-subtitle {
    font-size: 13px;
    color: var(--app-sub-text);
    margin-bottom: 8px;
}

.collection-footer {
    font-size: 12px;
    color: var(--app-sub-text);
}

.creator-media {
    flex-shrink: 0;
}

.avatar-small {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--app-divider-color);
}

</style>
