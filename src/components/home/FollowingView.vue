<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '../../api/http.js';
import { useUser } from '../../composables/userManager';

const props = defineProps(['tab']);
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

const tabData = reactive({});
const f7router = f7.view.main.router;

tabs.value.forEach(tab => {
    tabData[tab.id] = {
        list: [],
        loading: false,
        hasMore: true,
        nextUrl: tab.url + '?limit=10'
    };
});

const fetchTabData = async (tabId, isRefresh = false) => {
    const state = tabData[tabId];
    if (state.loading) return;
    if (!isRefresh && !state.hasMore) return;

    state.loading = true;
    try {
        let res;
        if (isRefresh || !state.lastResult) {
            const url = tabs.value.find(t => t.id === tabId).url + '?limit=10';
            res = await $http.get(url);
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
        console.error(`Failed to fetch ${tabId}`, e);
    } finally {
        state.loading = false;
    }
};

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
        case 'users':
            return {
                id: item.id,
                title: item.name,
                subtitle: item.headline || '无签名',
                image: item.avatar_url,
                isFollowing: item.isFollowing,
                type: 'user'
            };
        case 'specials':
        case 'roundtables':
            return {
                id: item.id || item.url?.match(/\/(?:special|roundtable)\/(.+)/)?.[1],
                title: item.title,
                subtitle: item.subtitle?.content || '无介绍',
                footer: item.footline?.content,
                type: tabId === 'specials' ? 'special' : 'roundtable'
            };
        default:
            return item;
    }
};

const onRefresh = async (tabId, done) => {
    await fetchTabData(tabId, true);
    if (done) done();
};

const onInfinite = (tabId) => {
    fetchTabData(tabId);
};
const handleFollowClick = async (item) => {
    try {
        if (item.isFollowing) {
            await $http.delete(`https://api.zhihu.com/people/${item.id}/followers/${userId.value}`);
            item.isFollowing = false;
            f7.toast.create({ text: '取关成功', closeTimeout: 2000 }).open();
        } else {
            await $http.post(`https://api.zhihu.com/people/${item.id}/followers`);
            item.isFollowing = true;
            f7.toast.create({ text: '关注成功', closeTimeout: 2000 }).open();
        }
    } catch (e) {
        f7.toast.create({ text: '操作失败', closeTimeout: 2000 }).open();
    }
};

onMounted(() => {
    fetchTabData(activeTab.value, true);
});

watch(activeTab, (newTab) => {
    if (tabData[newTab].list.length === 0) {
        fetchTabData(newTab, true);
    }
});

watch(userId, (newId) => {
    if (newId && newId !== 'self') {
        tabs.value.forEach(tab => {
            tabData[tab.id] = {
                list: [],
                loading: false,
                hasMore: true,
                nextUrl: tab.url + '?limit=10'
            };
        });
        fetchTabData(activeTab.value, true);
    }
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
                    @infinite="onInfinite(tab.id)" class="tab-scroll-content">
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

                    <div v-if="!tabData[tab.id].hasMore && tabData[tab.id].list.length > 0"
                        class="padding text-align-center text-color-gray">
                        没有更多了
                    </div>
                    <div v-if="!tabData[tab.id].loading && tabData[tab.id].list.length === 0" class="empty-state">
                        <f7-icon f7="tray" size="40" color="gray" />
                        <p>暂无关注内容</p>
                    </div>
                </f7-page-content>
            </f7-tab>
        </f7-tabs>
    </f7-page>
</template>

<style scoped>
.following-tabbar {
    --f7-toolbar-background-color: #fff;
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
    border: 1px solid rgba(0, 0, 0, 0.05);
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
    color: #999;
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

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
    color: #8e8e93;
}
</style>
