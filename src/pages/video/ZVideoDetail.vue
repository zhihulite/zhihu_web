<script setup>
import { ref, computed, onMounted } from 'vue';
import { f7 } from 'framework7-vue';
import { HistoryService } from '@/services/history.js';
import CommentsSheet from '@/components/CommentsSheet.vue';
import CollectionSheet from '@/components/CollectionSheet.vue';
import $http from '@/services/http.js';
import { usePageState } from '@/composables/usePageState.js';
import { useAlive } from '@/composables/useAlive.js';
import { useContentMenu } from '@/composables/useContentMenu.js';
import { openLink } from '@/core/navigation.js';
import { useReaction } from '@/composables/useReaction.js';
import { formatCount } from '@/utils/format.js';
import EmptyState from '@/components/EmptyState.vue';
import PageLoader from '@/components/PageLoader.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const videoId = computed(() => props.f7route?.params?.id);
const videoData = ref(null);
const isLoading = ref(true);
const selectedQuality = ref('hd');
const showComments = ref(false);
const showCollection = ref(false);

const { isAlive, acquireSignal } = useAlive();

const { copyLink: copyVideoLink, share: shareVideo, report: reportVideo } = useContentMenu({
    url: () => `https://www.zhihu.com/zvideo/${videoId.value}`,
    title: () => videoData.value?.title,
    reportType: 'zvideo',
    reportId: videoId.value,
});

const { hasCache } = usePageState({
    state: {
        videoData,
        selectedQuality,
        showComments,
        showCollection
    },
    loading: isLoading,
});

const fetchVideoData = async () => {
    if (!videoId.value) return;

    isLoading.value = true;
    try {
        const res = await $http.get(`https://api.zhihu.com/video-feed/immersion?object_id=${videoId.value}&object_type=zvideo`, {
            signal: acquireSignal(),
        });
        if (!isAlive()) return;
        const data = res?.data?.[0];
        if (data) {
            const content = data?.content?.content;
            const videoPlay = data?.content?.video?.video_play || {};
            const zvideo = content?.zvideo || {};
            const reactions = content?.reactions || {};
            const stats = content?.stats || {};
            const unintegratedReactions = content?.unintegrated_reactions || {};

            videoData.value = {
                id: zvideo.id,
                contentId: content?.content_id,
                title: zvideo.title,
                description: zvideo.description || zvideo.excerpt || '',
                publishedAt: zvideo.published_at,
                updatedAt: zvideo.updated_at,
                playCount: videoPlay.play_count || 0,

                author: {
                    id: zvideo.author?.id,
                    uid: zvideo.author?.uid,
                    name: zvideo.author?.name || '未知用户',
                    urlToken: zvideo.author?.url_token,
                    avatarUrl: zvideo.author?.avatar_url,
                    headline: zvideo.author?.headline || ''
                },

                video: {
                    videoId: videoPlay.video_id,
                    width: videoPlay.width,
                    height: videoPlay.height,
                    duration: videoPlay.duration,
                    thumbnail: videoPlay.thumbnail,
                    playlist: videoPlay.playlist || {}
                },

                metrics: {
                    votes: reactions.VOTE?.options?.UP?.count || 0,
                    likes: reactions.LIKE?.count || 0,
                    comments: stats.comment_count || 0,
                    forwards: stats.forward_count || 0,
                    favorites: unintegratedReactions.FAVORITE?.count || 0
                },

                isUpvoted: reactions.VOTE?.options?.UP?.reacted || false,
                isLiked: reactions.LIKE?.reacted || false,
                isFavorited: unintegratedReactions.FAVORITE?.reacted || false
            };

            HistoryService.addRecord({
                id: videoData.value.id,
                type: 'zvideo',
                title: videoData.value.title,
                preview: videoData.value.description.substring(0, 100)
            });
        }
    } catch (e) {
        if (e?.name === 'AbortError') return;
        console.error('Failed to fetch video data:', e);
        f7.toast.create({ text: '加载失败' }).open();
    } finally {
        isLoading.value = false;
    }
};

const videoUrl = computed(() => {
    if (!videoData.value?.video.playlist) return '';

    const playlist = videoData.value.video.playlist;
    switch (selectedQuality.value) {
        case 'fhd':
            return playlist.fhd?.url || playlist.hd?.url || playlist.sd?.url || '';
        case 'hd':
            return playlist.hd?.url || playlist.sd?.url || '';
        case 'sd':
            return playlist.sd?.url || '';
        default:
            return playlist.hd?.url || playlist.sd?.url || '';
    }
});

const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatDate = (timestamp) => (timestamp ? new Date(timestamp * 1000).toLocaleDateString() : '');


const { toggleVote, toggleLike, toggleFavorite, onCollectionSuccess } = useReaction(videoData, {
    name: '视频',
    type: 'zvideo',
    id: videoId,
    onCollectSwap: () => { showCollection.value = true; },
});

const handleAuthorClick = () => {
    if (videoData.value?.author.urlToken) {
        props.f7router?.navigate(`/user/${videoData.value.author.urlToken}`);
    }
};

onMounted(() => {
    if (!hasCache.value) {
        fetchVideoData();
    }
});
</script>

<template>
    <f7-page class="video-detail">
        <f7-navbar title="视频" back-link="返回">
            <f7-nav-right>
                <f7-link icon-only popover-open=".video-actions-popover">
                    <f7-icon ios="f7:ellipsis_circle" md="material:more_horiz" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <!-- 内容页操作菜单：刷新/分享/复制链接/打开原始链接/举报 -->
        <f7-popover class="video-actions-popover">
            <f7-list>
                <f7-list-item title="刷新" link popover-close @click="fetchVideoData" />
                <f7-list-item title="分享" link popover-close @click="shareVideo" />
                <f7-list-item title="复制链接" link popover-close @click="copyVideoLink" />
                <f7-list-item title="打开原始知乎网页" link popover-close
                    @click="openLink(`https://www.zhihu.com/zvideo/${videoId}`)" />
                <f7-list-item title="举报" link popover-close @click="reportVideo" />
            </f7-list>
        </f7-popover>

        <PageLoader v-if="isLoading" height="100dvh" />

        <div v-else-if="videoData" class="video-content">
            <div class="video-player-container">
                <video v-if="videoUrl" :src="videoUrl" :poster="videoData.video.thumbnail" controls playsinline
                    class="video-player">
                    您的浏览器不支持视频播放
                </video>
                <div v-else class="video-placeholder">
                    <f7-icon f7="play_circle" size="64" color="gray" />
                    <p>视频加载失败</p>
                </div>
            </div>

            <div class="quality-selector">
                <f7-segmented strong>
                    <f7-button :active="selectedQuality === 'sd'" @click="selectedQuality = 'sd'">标清</f7-button>
                    <f7-button :active="selectedQuality === 'hd'" @click="selectedQuality = 'hd'">高清</f7-button>
                    <f7-button :active="selectedQuality === 'fhd'" @click="selectedQuality = 'fhd'"
                        v-if="videoData.video.playlist.fhd">超清</f7-button>
                </f7-segmented>
            </div>

            <div class="video-info">
                <h2 class="video-title">{{ videoData.title }}</h2>
                <div class="video-stats">
                    <span>{{ formatCount(videoData.playCount) }} 播放</span>
                    <span>{{ formatDuration(videoData.video.duration) }}</span>
                    <span>{{ formatDate(videoData.publishedAt) }}</span>
                </div>
            </div>

            <f7-card class="author-card" @click="handleAuthorClick">
                <div class="author-info">
                    <img :src="videoData.author.avatarUrl" class="author-avatar" />
                    <div class="author-details">
                        <div class="author-name">{{ videoData.author.name }}</div>
                        <div class="author-headline">{{ videoData.author.headline }}</div>
                    </div>
                </div>
            </f7-card>

            <f7-card v-if="videoData.description" class="description-card">
                <f7-card-content>
                    <div class="description-text">{{ videoData.description }}</div>
                </f7-card-content>
            </f7-card>

        </div>

        <EmptyState v-else icon="exclamationmark_triangle" text="视频加载失败" />

        <!-- 只有 f7-page 的直接子节点会被归入固定层，嵌在正文容器内会随内容滚动 -->
        <f7-toolbar v-if="videoData" bottom class="video-toolbar">
            <f7-link @click="toggleVote" :class="{ 'active-action': videoData.isUpvoted }">
                <f7-icon :ios="videoData.isUpvoted ? 'f7:hand_thumbsup_fill' : 'f7:hand_thumbsup'"
                    :md="videoData.isUpvoted ? 'material:thumb_up' : 'material:thumb_up_off_alt'" size="18" />
                <span>{{ formatCount(videoData.metrics.votes) }}</span>
            </f7-link>
            <f7-link @click="toggleLike" icon-only>
                <f7-icon :ios="videoData.isLiked ? 'f7:heart_fill' : 'f7:heart'"
                    :md="videoData.isLiked ? 'material:favorite' : 'material:favorite_border'" size="18" />
                <span>{{ formatCount(videoData.metrics.likes) }}</span>
            </f7-link>
            <f7-link @click="toggleFavorite" :class="{ 'active-action': videoData.isFavorited }">
                <f7-icon :ios="videoData.isFavorited ? 'f7:bookmark_fill' : 'f7:bookmark'"
                    :md="videoData.isFavorited ? 'material:bookmark' : 'material:bookmark_border'" size="18" />
                <span>{{ formatCount(videoData.metrics.favorites) }}</span>
            </f7-link>
            <f7-link @click="showComments = true">
                <f7-icon ios="f7:bubble_left" md="material:chat_bubble_outline" size="18" />
                <span>{{ formatCount(videoData.metrics.comments) }}</span>
            </f7-link>
        </f7-toolbar>

        <CommentsSheet v-model="showComments" :resourceId="videoId" resourceType="zvideo" :f7router="f7router" />
        <CollectionSheet v-model="showCollection" :contentId="videoId" contentType="zvideo"
            @success="onCollectionSuccess" />
    </f7-page>
</template>

<style scoped>
.video-content {
    padding-bottom: 60px;
}

.video-player-container {
    width: 100%;
    background: #000;
    position: relative;
}

.video-player {
    width: 100%;
    max-height: 60vh;
    display: block;
}

.video-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 32px;
    color: var(--app-sub-text);
}

.quality-selector {
    padding: 12px 16px;
    background: var(--f7-page-bg-color);
}

.video-info {
    padding: 16px;
    background: var(--f7-page-bg-color);
    margin-bottom: 8px;
}

.video-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 8px;
    line-height: 1.4;
    color: var(--f7-text-color);
}

.video-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--app-sub-text);
}

.author-card {
    margin: 8px 16px !important;
    cursor: pointer;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
}

.author-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.author-details {
    flex: 1;
}

.author-name {
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 4px;
}

.author-headline {
    font-size: 13px;
    color: var(--app-sub-text);
}

.description-card {
    margin: 8px 16px !important;
}

.description-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--f7-text-color);
    white-space: pre-wrap;
}

.video-toolbar {
    background: var(--f7-bars-bg-color);
    border-top: 1px solid var(--app-divider-color);
}

.video-toolbar .link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--app-sub-text);
}

.video-toolbar .link.active-action {
    color: var(--f7-theme-color);
}

</style>
