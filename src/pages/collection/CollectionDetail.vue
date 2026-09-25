<script setup>
import { ref, onMounted } from 'vue';
import { destroyOnClosed } from '@/utils/modal.js';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import CollectionSheet from '@/components/CollectionSheet.vue';
import CollectionEditSheet from '@/components/CollectionEditSheet.vue';
import { useUser } from '@/composables/userManager';
import { usePageState } from '@/composables/usePageState.js';
import { usePagedList } from '@/composables/usePagedList.js';
import { useFollowToggle } from '@/composables/useFollowToggle.js';
import { useContentMenu } from '@/composables/useContentMenu.js';
import { unwrap, normalizeType, titleOf, excerptOf, voteupOf, commentCountOf } from '@/mappers/zhihu-item.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const collectionId = props.f7route.params.id;

const { currentUser } = useUser();
const isOwner = ref(false);

const collectionInfo = ref(null);
const showCollectionSheet = ref(false);
const showEditSheet = ref(false);
const activeItem = ref(null);

const { page, loading, refresh, loadMore, ensureLoaded } = usePagedList({
    name: '收藏夹内容',
    fetch: (signal) => $http.get(`https://api.zhihu.com/collections/${collectionId}/contents?with_deleted=1&limit=20`, { signal }),
    map: (item) => mapContentItem(item),
});

const { hasCache } = usePageState({
    state: {
        collectionInfo,
        page,
        isOwner
    },
    loading,
});

const fetchCollectionInfo = async () => {
    try {
        const url = `https://api.zhihu.com/collections/${collectionId}?with_deleted=1&censor=1`;
        const res = await $http.get(url);
        const data = res.collection || res;
        collectionInfo.value = {
            id: collectionId,
            title: data.title || '',
            description: data.description || '',
            isPublic: data.is_public !== false,
            itemCount: data.item_count || 0,
            followerCount: data.follower_count || 0,
            isFollowing: data.is_following || false,
        };

        if (data.creator && currentUser.value) {
            isOwner.value = String(data.creator.id) === String(currentUser.value.id);
        }
    } catch (e) {
        console.error('Failed to fetch collection info:', e);
    }
};

const mapContentItem = (item) => {
    const targetItem = unwrap(item);
    const type = normalizeType(targetItem.type);
    const votes = voteupOf(targetItem) || targetItem.collection_count || 0;
    const comments = commentCountOf(targetItem);

    return {
        id: targetItem.id,
        type,
        title: titleOf(targetItem),
        preview: excerptOf(targetItem),
        metrics: {
            votes,
            comments
        },
    };
};

const openActionSheet = (item) => {
    activeItem.value = item;
    const menu = f7.actions.create({
        buttons: [
            [
                {
                    text: item.title,
                    label: true
                },
                {
                    text: '移动到其他收藏夹',
                    onClick: () => {
                        showCollectionSheet.value = true;
                    }
                },
                {
                    text: '从当前收藏夹移除',
                    color: 'red',
                    onClick: () => {
                        deleteFromCollection(item);
                    }
                }
            ],
            [
                {
                    text: '取消',
                    color: 'red'
                }
            ]
        ]
    });
    destroyOnClosed(menu).open();
};

const deleteFromCollection = (item) => {
    f7.dialog.confirm(`确定要从该收藏夹移除“${item.title}”吗？`, '提示', async () => {
        try {
            const url = `https://api.zhihu.com/collections/${collectionId}/contents/${item.id}?content_type=${item.type}`;
            await $http.delete(url, { encryptHead: true });
            f7.toast.show({ text: '已移除' });
            page.list = page.list.filter(i => i.id !== item.id);
        } catch (e) {
            console.error('Failed to delete item:', e);
            f7.toast.show({ text: '移除失败' });
        }
    });
};

const deleteEntireCollection = () => {
    f7.dialog.confirm(`确定要删除整个收藏夹“${collectionInfo.value.title}”吗？此操作不可撤销！`, '危险操作', async () => {
        try {
            const url = `https://api.zhihu.com/collections/${collectionId}`;
            await $http.delete(url, { encryptHead: true });
            f7.toast.show({ text: '已删除收藏夹' });
            props.f7router.back();
        } catch (e) {
            console.error('Failed to delete collection:', e);
            f7.toast.show({ text: '删除失败' });
        }
    });
};

const onRefresh = async (done) => {
    await fetchCollectionInfo();
    await refresh();
    if (done) done();
};

const onInfinite = () => {
    loadMore();
};

const { copyLink: copyCollectionLink, share: shareCollection, report: reportCollection } = useContentMenu({
    url: () => `https://www.zhihu.com/collection/${collectionId}`,
    title: () => collectionInfo.value?.title,
    reportType: 'collection',
    reportId: collectionId,
});

const refreshCollection = () => onRefresh();

const { toggle: toggleFollowCollection } = useFollowToggle({
    url: () => `https://api.zhihu.com/collections/${collectionId}/followers`,
    isFollowing: () => collectionInfo.value?.isFollowing || false,
    setFollowing: (v) => { if (collectionInfo.value) collectionInfo.value.isFollowing = v; },
    deleteWithUserId: true,
    encryptHead: true,
    postBody: '',
    toast: ['已关注收藏夹', '已取消关注'],
});

onMounted(() => {
    if (!hasCache.value) {
        fetchCollectionInfo();
        ensureLoaded();
    }
});
</script>

<template>
    <f7-page name="collection-detail" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite">
        <f7-navbar :title="collectionInfo?.title || '收藏夹详情'" back-link="返回">
            <f7-nav-right>
                <f7-link icon-only popover-open=".collection-menu-popover">
                    <f7-icon ios="f7:ellipsis_circle" md="material:more_horiz" />
                </f7-link>
                <f7-link v-if="isOwner" icon-only @click="deleteEntireCollection">
                    <f7-icon ios="f7:trash" md="material:delete" />
                </f7-link>
                <f7-link v-else-if="collectionInfo" @click="toggleFollowCollection">
                    {{ collectionInfo.isFollowing ? '取消关注' : '关注' }}
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-popover class="collection-menu-popover">
            <f7-list>
                <f7-list-item v-if="isOwner" title="编辑收藏夹" link popover-close @click="showEditSheet = true" />
                <f7-list-item title="刷新" link popover-close @click="refreshCollection" />
                <f7-list-item title="分享" link popover-close @click="shareCollection" />
                <f7-list-item title="复制链接" link popover-close @click="copyCollectionLink" />
                <f7-list-item title="举报" link popover-close @click="reportCollection" />
            </f7-list>
        </f7-popover>

        <CollectionEditSheet v-model="showEditSheet" :collection="collectionInfo"
            @saved="fetchCollectionInfo" />

        <f7-block v-if="collectionInfo" class="collection-header-meta">
            <div class="collection-desc">{{ collectionInfo.description }}</div>
            <div class="collection-stats text-color-gray">
                {{ collectionInfo.itemCount }} 个内容 · {{ collectionInfo.followerCount }} 人关注
            </div>
        </f7-block>

        <f7-list v-if="page.list.length > 0" no-hairlines-md class="content-list">
            <f7-card v-for="item in page.list" :key="item.id" @click="$handleCardClick(f7router, item)"
                class="content-card">
                <f7-card-content>
                    <div class="card-header-row">
                        <f7-chip outline class="content-type-badge">{{ item.type === 'answer' ? '回答' : (item.type ===
                            'article' ?
                            '文章'
                            : (item.type === 'pin' ? '想法' : '视频')) }}</f7-chip>
                        <f7-link icon-only @click.stop="openActionSheet(item)" class="more-btn">
                            <f7-icon f7="ellipsis" size="20" color="gray" />
                        </f7-link>
                    </div>
                    <div class="content-title">{{ item.title }}</div>
                    <div class="content-preview">{{ item.preview }}</div>
                    <div class="content-metrics">
                        <span>{{ item.metrics.votes }} 赞同</span>
                        <span class="dot">·</span>
                        <span>{{ item.metrics.comments }} 评论</span>
                    </div>
                </f7-card-content>
            </f7-card>
        </f7-list>
        <LoadMoreFooter :has-more="page.hasMore" :length="page.list.length" />
        <EmptyState v-if="!loading && page.list.length === 0" icon="folder_badge_minus" text="收藏夹空空如也" />

        <CollectionSheet v-if="activeItem" v-model="showCollectionSheet" :contentId="activeItem.id"
            :contentType="activeItem.type" />
    </f7-page>
</template>

<style scoped>
.collection-header-meta {
    margin-top: 16px;
    margin-bottom: 8px;
}

.collection-desc {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 8px;
}

.collection-stats {
    font-size: 13px;
}

.content-list {
    margin: 8px 0;
}

.content-card {
    margin: 8px 12px !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.content-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 6px;
    color: var(--f7-text-color);
}

.content-preview {
    font-size: 14px;
    color: var(--app-sub-text);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.6;
    margin-bottom: 10px;
}

.content-metrics {
    font-size: 12px;
    color: var(--app-sub-text);
}

.dot {
    margin: 0 4px;
}

</style>
