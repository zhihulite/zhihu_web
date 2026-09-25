<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { useTabbedPagedList } from '@/composables/useTabbedPagedList.js';
import { usePageState } from '@/composables/usePageState.js';
import { handleCardClick, openLink } from '@/core/navigation.js';
import { formatRelativeTime } from '@/utils/format.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7router: Object
});

const activeTab = ref('all');
const tabs = [
    { id: 'all', label: '全部', entryName: null },
    { id: 'follow', label: '关注我的', entryName: 'follow' },
    { id: 'like', label: '赞同与喜欢', entryName: 'like' },
    { id: 'comment', label: '评论与回复', entryName: 'comment' },
    { id: 'invite', label: '邀请', entryName: 'invite' },
    { id: 'mention', label: '提到我的', entryName: 'mention' },
    { id: 'system', label: '系统通知', entryName: 'system' }
];

const entryNameFor = (tabId) => tabs.find(t => t.id === tabId).entryName;

const { tabs: tabData, loading: tabLoading, ensure, refresh, loadMore, ensureLoaded } = useTabbedPagedList({
    name: '通知',
    tabs: () => tabs.map(t => t.id),
    fillEl: (tabId) => scrollElements[tabId],
    fetch: (tabId, signal) => {
        const entryName = entryNameFor(tabId);
        const baseUrl = 'https://www.zhihu.com/api/v4/notifications/v2/recent';
        return $http.get(`${baseUrl}?limit=20${entryName ? `&entry_name=${entryName}` : ''}`, { signal });
    },
    map: (item) => mapNotification(item),
    onError: () => f7.toast.create({ text: '加载失败' }).open(),
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

const mapNotification = (item) => {
    const content = item.content || {};
    const actors = Array.isArray(content.actors)
        ? content.actors
        : (content.actors ? [content.actors] : []);
    const targetItem = item.target;
    const contentTarget = content.target;

    const actorNames = (() => {
        const names = actors.map(a => a.name).filter(Boolean).join('、');
        if (item.merge_count > 1 && actors.length !== item.merge_count) {
            return names ? `${names} 等${item.merge_count}人` : `${item.merge_count}人`;
        }
        return names || '';
    })();

    const targetInfo = {
        type: null,
        id: null,
        title: null,
        content: null,
        url: null,
        urlToken: null,
        actualType: null,
        actualId: null,
        link: null
    };

    if (targetItem) {
        targetInfo.id = targetItem.id;
        targetInfo.type = targetItem.type;

        switch (targetItem.type) {
            case 'comment':
                targetInfo.content = targetItem.content || targetItem.excerpt;
                targetInfo.url = targetItem.url;

                if (targetItem.target) {
                    const actualTarget = targetItem.target;
                    targetInfo.actualId = actualTarget.id;

                    if (actualTarget.type === 'answer') {
                        targetInfo.actualType = 'answer';
                        targetInfo.title = actualTarget.question?.title;
                    } else if (actualTarget.type === 'article') {
                        targetInfo.actualType = 'article';
                        targetInfo.title = actualTarget.title;
                    }
                }
                break;

            case 'question':
                targetInfo.title = targetItem.title;
                targetInfo.content = targetItem.excerpt;
                break;

            case 'people':
                targetInfo.title = targetItem.name;
                targetInfo.content = targetItem.headline;
                targetInfo.urlToken = targetItem.url_token || targetItem.urlToken;
                break;

            case 'answer':
                targetInfo.title = targetItem.question?.title;
                targetInfo.content = targetItem.excerpt;
                targetInfo.url = targetItem.url;
                break;

            case 'article':
                targetInfo.title = targetItem.title;
                targetInfo.content = targetItem.excerpt;
                targetInfo.url = targetItem.url;
                break;
        }
    } else if (contentTarget) {
        targetInfo.type = 'system';
        targetInfo.link = contentTarget.link;
        targetInfo.content = contentTarget.text;
    }


    const id = item.id;
    const createTime = item.create_time;
    const icon = content.extend?.icon || actors[0]?.avatar_url || '';
    const verb = content.verb || '';
    const targetText = contentTarget?.text || '';
    const isRead = item.is_read || false;
    const mergeCount = item.merge_count || 1;

    return {
        id,
        isRead,
        createTime,
        mergeCount,
        actors,
        actorNames,
        verb,
        targetText,
        targetInfo,
        icon
    };
};

const markAllAsRead = async () => {
    try {
        await $http.post('https://www.zhihu.com/api/v4/notifications/v2/default/actions/readall');
        f7.toast.create({ text: '已全部标记为已读' }).open();

        Object.values(tabData).forEach(state => {
            state.list.forEach(item => {
                item.isRead = true;
            });
        });
    } catch (e) {
        console.error('Failed to mark all as read', e);
        f7.toast.create({ text: '操作失败' }).open();
    }
};

const handleNotificationClick = (notification) => {
    const { targetInfo } = notification;
    const f7router = props.f7router;

    if (!targetInfo || !targetInfo.type) return;

    switch (targetInfo.type) {
        case 'comment':
            if (targetInfo.actualType && targetInfo.actualId) {
                if (targetInfo.actualType === 'answer') {
                    f7router.navigate(`/article/answer/${targetInfo.actualId}`);
                } else if (targetInfo.actualType === 'article') {
                    f7router.navigate(`/article/article/${targetInfo.actualId}`);
                }
            } else {
                f7.toast.create({ text: '暂不支持跳转到评论' }).open();
            }
            break;
        case 'system':
            if (targetInfo.link) {
                openLink(targetInfo.link);
            }
            break;
        default:
            handleCardClick(f7router, targetInfo);
            break;
    }
};

const onRefresh = async (tabId, done) => {
    await refresh(tabId);
    if (done) done();
};

const onInfinite = (tabId) => {
    loadMore(tabId);
};

// 全部已读是全局动作（readall 不区分 entry_name），入口显隐也按所有已加载 tab 的未读数
const unreadCount = computed(() =>
    Object.values(tabData).reduce((sum, state) => sum + (state.list?.filter(n => !n.isRead).length || 0), 0)
);

onMounted(() => {
    if (!hasCache.value) ensureLoaded(activeTab.value);
});

watch(activeTab, (newTab) => {
    ensureLoaded(newTab);
});
</script>

<template>
    <f7-page class="notifications-view">
        <f7-navbar title="通知" back-link="返回">
            <f7-nav-right>
                <f7-link icon-only @click="markAllAsRead" v-if="unreadCount > 0">
                    <f7-icon ios="f7:checkmark_circle" md="material:done_all" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-toolbar tabbar top scrollable class="notifications-tabbar">
            <f7-link v-for="tab in tabs" :key="tab.id" :tab-link="`#tab-${tab.id}`"
                :tab-link-active="activeTab === tab.id" @click="activeTab = tab.id">
                {{ tab.label }}
            </f7-link>
        </f7-toolbar>

        <f7-tabs class="tabs-auto-page-content" swipeable animated>
            <f7-tab v-for="tab in tabs" :key="tab.id" :id="`tab-${tab.id}`" :tab-active="activeTab === tab.id"
                @tab:show="activeTab = tab.id">
                <f7-page-content ptr @ptr:refresh="(done) => onRefresh(tab.id, done)" infinite
                    @infinite="onInfinite(tab.id)" :ref="(el) => setScrollRef(el, tab.id)">
                    <div class="notifications-list">
                        <f7-card v-for="notification in tabData[tab.id].list" :key="notification.id"
                            class="notification-card" :class="{ 'unread': !notification.isRead }"
                            @click="handleNotificationClick(notification)">
                            <div class="notification-content">
                                <div class="notification-header">
                                    <div class="header-left">
                                        <img v-if="notification.icon" :src="notification.icon"
                                            class="notification-icon" />
                                        <f7-icon v-else f7="bell_fill" size="40" color="gray" />
                                        <div class="notification-text">
                                            <span class="actor-names">{{ notification.actorNames }}</span>
                                            <span class="verb">{{ notification.verb }}</span>
                                            <span v-if="notification.targetText" class="target-text">{{
                                                notification.targetText }}</span>
                                        </div>
                                    </div>
                                    <f7-icon v-if="!notification.isRead" f7="circle_fill" size="8" class="unread-dot" />
                                </div>

                                <div v-if="notification.targetInfo.title || notification.targetInfo.content"
                                    class="target-preview">
                                    <div v-if="notification.targetInfo.title" class="target-title">{{
                                        notification.targetInfo.title }}</div>
                                    <div v-if="notification.targetInfo.content" class="target-content"
                                        v-html="notification.targetInfo.content.replace(/<[^>]*>/g, '')"></div>
                                </div>

                                <div class="notification-time">{{ formatRelativeTime(notification.createTime) }}</div>
                            </div>
                        </f7-card>
                    </div>

                    <LoadMoreFooter :has-more="tabData[tab.id].hasMore" :length="tabData[tab.id].list.length" />
                    <EmptyState v-if="!tabLoading[tab.id] && tabData[tab.id].list.length === 0"
                        icon="bell_slash" text="暂无通知" />
                </f7-page-content>
            </f7-tab>
        </f7-tabs>
    </f7-page>
</template>

<style scoped>
.notifications-tabbar {
    z-index: 100;
}

.notifications-list {
    padding: 8px 0;
}

.notification-card {
    margin: 8px 16px !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
    cursor: pointer;
    transition: all 0.2s;
}

.notification-card.unread {
    background: rgba(var(--f7-theme-color-rgb), 0.05);
    border-left: 3px solid var(--f7-theme-color) !important;
}

.notification-content {
    padding: 12px;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.header-left {
    display: flex;
    gap: 12px;
    flex: 1;
    align-items: flex-start;
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.notification-text {
    flex: 1;
    line-height: 1.5;
    font-size: 15px;
}

.actor-names {
    font-weight: 700;
}

.verb {
    margin-left: 4px;
}

.target-text {
    color: var(--f7-theme-color);
    margin-left: 4px;
}

.unread-dot {
    flex-shrink: 0;
    margin-top: 4px;
}

.target-preview {
    background: var(--app-placeholder-bg);
    border-radius: 8px;
    padding: 10px;
    margin: 8px 0;
}

.target-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.target-content {
    font-size: 13px;
    color: var(--app-sub-text);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.notification-time {
    font-size: 12px;
    color: var(--app-sub-text);
    margin-top: 4px;
}

</style>
