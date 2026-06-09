<script setup>
import { ref, computed, onMounted } from 'vue';
import { f7 } from 'framework7-vue';
import { HistoryService } from '../services/historyService.js';
import CommentsSheet from './CommentsSheet.vue';
import CollectionSheet from './CollectionSheet.vue';
import $http from '../api/http.js';
import { useHistory } from '../composables/useHistory.js';

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});

const { register, restoreState } = useHistory(props, 'zvideo_detail');
const hasHistory = !!restoreState();

const videoId = computed(() => props.f7route?.params?.id);
const videoData = ref(null);
const isLoading = ref(true);
const selectedQuality = ref('hd');
const showComments = ref(false);
const showCollection = ref(false);
const pageRef = ref(null);

register({
    state: {
        videoData,
        isLoading,
        selectedQuality,
        showComments,
        showCollection
    },
    scroll: () => ({
        main: pageRef.value?.$el?.querySelector('.page-content')
    })
});

const fetchVideoData = async () => {
    if (!videoId.value) return;

    isLoading.value = true;
    try {
        const res = await $http.get(`https://api.zhihu.com/video-feed/immersion?object_id=${videoId.value}&object_type=zvideo`);
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatCount = (count) => {
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toString();
};

const toggleVote = async () => {
    if (!videoData.value) return;
    const isUpvoted = videoData.value.isUpvoted === true;
    const url = `https://api.zhihu.com/reaction/zvideos/${videoId.value}/vote/up`;

    try {
        if (!isUpvoted) {
            await $http.post(url);
            videoData.value.isUpvoted = true;
            videoData.value.metrics.votes++;
        } else {
            await $http.delete(url);
            videoData.value.isUpvoted = false;
            videoData.value.metrics.votes--;
        }
    } catch (e) {
        console.error('Failed to toggle vote', e);
    }
};

const toggleLike = async () => {
    if (!videoData.value) return;
    const isLiked = videoData.value.isLiked;
    const url = `https://api.zhihu.com/reaction/zvideos/${videoId.value}/like`;

    try {
        if (!isLiked) {
            await $http.post(url);
            videoData.value.isLiked = true;
            videoData.value.metrics.likes++;
        } else {
            await $http.delete(url);
            videoData.value.isLiked = false;
            videoData.value.metrics.likes--;
        }
    } catch (e) {
        console.error('Failed to toggle thank', e);
    }
};

const toggleFavorite = async () => {
    if (!videoData.value) return;
    const isFavorited = videoData.value.isFavorited;
    const url = `https://api.zhihu.com/collections/contents/zvideo/${videoId.value}`;

    try {
        if (!isFavorited) {
            await $http.post(url, null, { encryptHead: true });
            videoData.value.isFavorited = true;
            videoData.value.metrics.favlists++;

            f7.toast.show({
                text: '已收藏至默认收藏夹',
                closeButton: true,
                closeButtonText: '更换',
                on: {
                    closeButtonClick() {
                        showCollection.value = true;
                    },
                },
            });
        } else {
            await $http.delete(`${url}?failed_multi=1`, { encryptHead: true });
            videoData.value.isFavorited = false;
            videoData.value.metrics.favlists--;
            f7.toast.show({ text: '已取消收藏' });
        }
    } catch (e) {
        console.error('Failed to toggle favorite', e);
        f7.toast.show({ text: '操作失败' });
    }
};

const onCollectionSuccess = (isFavorited) => {
    const wasFavorited = videoData.value.isFavorited;
    videoData.value.isFavorited = isFavorited;

    if (isFavorited && !wasFavorited) {
        videoData.value.metrics.favlists++;
    } else if (!isFavorited && wasFavorited) {
        videoData.value.metrics.favlists--;
    }
};

const handleAuthorClick = () => {
    if (videoData.value?.author.urlToken) {
        props.f7router?.navigate(`/user/${videoData.value.author.urlToken}`);
    }
};

onMounted(() => {
    if (!hasHistory) {
        fetchVideoData();
    }
});
</script>

<template>
    <f7-page class="video-detail" :ref="(el) => pageRef = el">
        <f7-navbar title="视频" back-link="返回" />

        <div v-if="isLoading" class="loading-state">
            <f7-preloader />
        </div>

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
                    <span>{{ new Date(videoData.publishedAt * 1000).toLocaleDateString() }}</span>
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

            <f7-toolbar bottom class="video-toolbar">
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
        </div>

        <div v-else class="empty-state">
            <f7-icon f7="exclamationmark_triangle" size="48" color="gray" />
            <p>视频加载失败</p>
        </div>

        <CommentsSheet v-model="showComments" :resourceId="videoId" resourceType="zvideo" :f7router="f7router" />
        <CollectionSheet v-model="showCollection" :contentId="videoId" contentType="zvideo"
            @success="onCollectionSuccess" />
    </f7-page>
</template>

<style scoped>
.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
}

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
    color: #666;
}

.quality-selector {
    padding: 12px 16px;
    background: #fff;
}

.video-info {
    padding: 16px;
    background: #fff;
    margin-bottom: 8px;
}

.video-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 8px;
    line-height: 1.4;
    color: #000;
}

.video-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #999;
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
    color: #999;
}

.description-card {
    margin: 8px 16px !important;
}

.description-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
}

.video-toolbar {
    background: #fff;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.video-toolbar .f7-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #666;
}

.video-toolbar .f7-link.active-action {
    color: var(--f7-theme-color);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 32px;
    color: #8e8e93;
}
</style>
