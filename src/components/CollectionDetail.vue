<script setup>
import { ref, onMounted, reactive } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '../api/http.js';
import CollectionSheet from './CollectionSheet.vue';
import { useUser } from '@/composables/userManager';
import { useHistory } from '../composables/useHistory.js';

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});
const { register, restoreState } = useHistory(props, 'collection_detail');
const hasHistory = !!restoreState();

const collectionId = props.f7route.params.id;

const { currentUser } = useUser();
const isOwner = ref(false);

const collectionInfo = ref(null);
const items = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const lastResult = ref(null);

const showCollectionSheet = ref(false);
const activeItem = ref(null);
const pageRef = ref(null);

register({
    state: {
        collectionInfo,
        items,
        isLoading,
        hasMore,
        lastResult,
        isOwner
    },
    scroll: () => ({
        main: pageRef.value?.$el?.querySelector('.page-content')
    })
});

const fetchCollectionInfo = async () => {
    try {
        const url = `https://api.zhihu.com/collections/${collectionId}?with_deleted=1&censor=1`;
        const res = await $http.get(url);
        const data = res.collection || res;
        collectionInfo.value = {
            title: data.title || '',
            description: data.description || '',
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

const fetchContents = async (isRefresh = false) => {
    if (isLoading.value) return;
    if (!isRefresh && !hasMore.value) return;

    isLoading.value = true;
    try {
        let res;
        if (isRefresh || !lastResult.value) {
            const url = `https://api.zhihu.com/collections/${collectionId}/contents?with_deleted=1&limit=20`;
            res = await $http.get(url);
        } else {
            res = await lastResult.value.next();
        }

        const rawList = res.data || [];

        const mappedItems = rawList.map(item => mapContentItem(item));
        if (isRefresh) {
            items.value = mappedItems;
        } else {
            items.value.push(...mappedItems);
        }
        lastResult.value = res;
        hasMore.value = !res.paging?.is_end;
    } catch (e) {
        console.error('Failed to fetch collection contents:', e);
    } finally {
        isLoading.value = false;
    }
};

const mapContentItem = (item) => {
    const targetItem = item.target || item;
    const type = targetItem.type;
    const id = targetItem.id;
    let title = targetItem.title || '';
    let preview = targetItem.excerpt || targetItem.excerpt_title || '';
    const votes = targetItem.voteup_count || targetItem.collection_count || 0;
    const comments = targetItem.comment_count || 0;

    switch (type) {
        case 'answer':
            title = targetItem.question?.title || title;
            break;
        case 'pin':
            title = '一个想法';
            preview = targetItem.excerpt_title || preview;
            break;
    }

    return {
        id,
        type,
        title,
        preview,
        metrics: {
            votes,
            comments
        },
    };
};

const openActionSheet = (item) => {
    activeItem.value = item;
    f7.actions.create({
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
    }).open();
};

const deleteFromCollection = (item) => {
    f7.dialog.confirm(`确定要从该收藏夹移除“${item.title}”吗？`, '提示', async () => {
        try {
            const url = `https://api.zhihu.com/collections/${collectionId}/contents/${item.id}?content_type=${item.type}`;
            await $http.delete(url, { encryptHead: true });
            f7.toast.show({ text: '已移除' });
            items.value = items.value.filter(i => i.id !== item.id);
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
    await fetchContents(true);
    if (done) done();
};

const onInfinite = () => {
    fetchContents();
};

const toggleFollowCollection = async () => {
    if (!collectionInfo.value) return;
    const isFollowing = collectionInfo.value.isFollowing;
    const url = `https://api.zhihu.com/collections/${collectionId}/followers`;

    try {
        if (!isFollowing) {
            await $http.post(url, "", { encryptHead: true });
            collectionInfo.value.isFollowing = true;
            f7.toast.show({ text: '已关注收藏夹' });
        } else {
            await $http.delete(`${url}/${currentUser.value.id}`, "", { encryptHead: true });
            collectionInfo.value.isFollowing = false;
            f7.toast.show({ text: '已取消关注' });
        }
    } catch (e) {
        console.error('Failed to toggle follow collection:', e);
        f7.toast.show({ text: '操作失败' });
    }
};

onMounted(() => {
    if (!hasHistory) {
        fetchCollectionInfo();
        fetchContents(true);
    }
});
</script>

<template>
    <f7-page name="collection-detail" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite"
        :ref="(el) => pageRef = el">
        <f7-navbar :title="collectionInfo?.title || '收藏夹详情'" back-link="返回">
            <f7-nav-right>
                <f7-link v-if="isOwner" icon-only @click="deleteEntireCollection">
                    <f7-icon ios="f7:trash" md="material:delete" />
                </f7-link>
                <f7-link v-else-if="collectionInfo" @click="toggleFollowCollection">
                    {{ collectionInfo.isFollowing ? '取消关注' : '关注' }}
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-block v-if="collectionInfo" class="collection-header-meta">
            <div class="collection-desc">{{ collectionInfo.description }}</div>
            <div class="collection-stats text-color-gray">
                {{ collectionInfo.itemCount }} 个内容 · {{ collectionInfo.followerCount }} 人关注
            </div>
        </f7-block>

        <f7-list v-if="items.length > 0" no-hairlines-md class="content-list">
            <f7-card v-for="item in items" :key="item.id" @click="$handleCardClick(f7router, item)"
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
        <div v-if="!hasMore && items.length > 0" class="padding text-align-center text-color-gray no-more">
            没有更多了
        </div>
        <div v-if="!isLoading && items.length === 0" class="empty-state">
            <f7-icon f7="folder_badge_minus" size="48" color="gray" />
            <p>收藏夹空空如也</p>
        </div>

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
    color: #333;
}

.content-preview {
    font-size: 14px;
    color: #666;
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
    color: #999;
}

.dot {
    margin: 0 4px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
    color: #8e8e93;
}

.no-more {
    font-size: 13px;
}
</style>
