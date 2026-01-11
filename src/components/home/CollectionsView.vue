<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '../../api/http.js';
import { useUser } from '@/composables/userManager';

const props = defineProps({
    f7router: Object,
    f7route: Object
});

const activeTab = ref(props.f7route?.params?.defaultTab || 'mine');
const { currentUser } = useUser();
const routeUserId = props.f7route?.params?.userId;
const effectiveUserId = computed(() => routeUserId || currentUser.value?.id || '');
const isOwnProfile = computed(() => !routeUserId || routeUserId === currentUser.value?.id);

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

const tabData = reactive({});

// Initialize state for each tab
const initTabs = () => {
    tabs.value.forEach(tab => {
        tabData[tab.id] = {
            list: [],
            loading: false,
            hasMore: true,
            lastResult: null
        };
    });
};

initTabs();

const showCreatePopup = ref(false);
const createData = reactive({
    title: '',
    isPublic: true,
    isSubmitting: false
});



const fetchTabData = async (tabId, isRefresh = false) => {
    const state = tabData[tabId];
    if (state.loading) return;
    if (!isRefresh && !state.hasMore) return;

    state.loading = true;
    try {
        let res;
        if (isRefresh || !state.lastResult) {
            const tab = tabs.value.find(t => t.id === tabId);
            const url = tab.url + '?limit=20';
            res = await $http.get(url, { isWWW: tabId !== 'recommend' });
        } else {
            res = await state.lastResult.next();
        }

        const rawList = res.data || [];
        const mappedItems = rawList.map(item => mapItem(tabId, item));

        if (isRefresh) {
            state.list = mappedItems;
        } else {
            state.list.push(...mappedItems);
        }

        state.lastResult = res;
        state.hasMore = !res.paging?.is_end;
    } catch (e) {
        console.error(`Failed to fetch ${tabId} collections`, e);
    } finally {
        state.loading = false;
    }
};

const mapItem = (tabId, item) => {
    switch (tabId) {
        case 'mine':
            return {
                id: item.id,
                title: item.title,
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
    await fetchTabData(tabId, true);
    if (done) done();
};

const onInfinite = (tabId) => {
    fetchTabData(tabId);
};

const handleCollectionClick = (item) => {
    props.f7router.navigate(`/collection/${item.id}`);
};

const createNewCollection = () => {
    createData.title = '';
    createData.isPublic = true;
    showCreatePopup.value = true;
};

const doCreate = async () => {
    if (!createData.title.trim()) {
        f7.dialog.alert('请输入标题');
        return;
    }
    createData.isSubmitting = true;
    try {
        const url = 'https://api.zhihu.com/collections';
        const params = new URLSearchParams();
        params.append('title', createData.title);
        params.append('description', '');
        params.append('is_public', String(createData.isPublic));
        params.append('is_default', 'false');

        const result = await $http.post(url, params.toString(), { encryptBody: false, encryptHead: true });

        if (result && result.id) {
            f7.toast.show({ text: '创建成功', closeTimeout: 2000 });
            tabData.mine.list.unshift(mapItem('mine', result));
            showCreatePopup.value = false;
        }
    } catch (e) {
        console.error('Failed to create collection:', e);
    } finally {
        createData.isSubmitting = false;
    }
};

onMounted(() => {
    if (effectiveUserId.value) {
        fetchTabData(activeTab.value, true);
    }
});

watch(effectiveUserId, (newId) => {
    if (newId) {
        initTabs();
        fetchTabData(activeTab.value, true);
    }
});

watch(activeTab, (newTab) => {
    if (tabData[newTab].list.length === 0) {
        fetchTabData(newTab, true);
    }
});

const showSearchPrompt = () => {
    f7.dialog.prompt(
        '请输入搜索关键词',
        '搜索内容',
        (value) => {
            if (value.trim()) {
                props.f7router.navigate(`/search-result/collection/${value}/${effectiveUserId.value}`);
            } else {
                f7.toast.show({ text: '搜索关键词不能为空', closeTimeout: 2000 });
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
                    @infinite="onInfinite(tab.id)" class="tab-scroll-content">

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
                    <div v-if="!tabData[tab.id].hasMore && tabData[tab.id].list.length > 0"
                        class="padding text-align-center text-color-gray">
                        没有更多了
                    </div>
                    <div v-if="!tabData[tab.id].loading && tabData[tab.id].list.length === 0" class="empty-state">
                        <f7-icon f7="folder_badge_plus" size="48" color="gray" />
                        <p>还没有收藏任何内容</p>
                    </div>
                </f7-page-content>
            </f7-tab>
        </f7-tabs>

        <f7-sheet class="create-collection-sheet" :opened="showCreatePopup" @sheet:closed="showCreatePopup = false"
            style="height: auto; border-radius: 24px 24px 0 0;" swipe-to-close backdrop>
            <div class="sheet-modal-inner">
                <div class="sheet-header">
                    <span class="sheet-title">新建收藏夹</span>
                    <f7-link @click="showCreatePopup = false">取消</f7-link>
                </div>
                <div class="sheet-content padding-bottom">
                    <f7-list no-hairlines-md>
                        <f7-list-input label="标题" type="text" placeholder="收藏夹名称" clear-button
                            v-model:value="createData.title" />
                        <f7-list-item title="公开收藏夹" footer="公开收藏夹可以让其他人看到你收藏的内容">
                            <template #after>
                                <f7-toggle v-model:checked="createData.isPublic" />
                            </template>
                        </f7-list-item>
                    </f7-list>
                    <div class="padding">
                        <f7-button fill large class="confirm-btn" @click="doCreate" :loading="createData.isSubmitting">
                            提交
                        </f7-button>
                    </div>
                </div>
            </div>
        </f7-sheet>

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
    --f7-toolbar-background-color: #fff;
    z-index: 100;
}

.create-collection-sheet {
    max-width: 600px;
    left: 0 !important;
    right: 0 !important;
    margin: 0 auto !important;
}

.sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.sheet-title {
    font-size: 1.1em;
    font-weight: bold;
}

.header-text {
    font-size: 12px;
    color: #999;
    margin-bottom: 2px;
}

.confirm-btn {
    width: 100%;
    border-radius: 12px;
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
    color: #8e8e93;
    flex-shrink: 0;
}

.collection-title {
    font-weight: 700;
    font-size: 16px;
    line-height: 1.4;
}

.collection-subtitle {
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
}

.collection-footer {
    font-size: 12px;
    color: #999;
}

.creator-media {
    flex-shrink: 0;
}

.avatar-small {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
    color: #8e8e93;
}
</style>
