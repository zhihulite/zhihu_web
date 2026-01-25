<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import ContentRenderer from './ContentRenderer.vue';
import CommentsSheet from './CommentsSheet.vue';
import CollectionSheet from './CollectionSheet.vue';
import { HistoryService } from '../services/historyService.js';
import { f7 } from 'framework7-vue';
import html2canvas from 'html2canvas-pro';
import { useHistory } from '../composables/useHistory.js';

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String,
});


const { register, restoreState } = useHistory(props, 'article_detail');
const hasHistory = !!restoreState();

const item = ref(null);
const loading = ref(true);
const showComments = ref(false);
const showCollection = ref(false);
const showToc = ref(false);
const tocItems = ref([]);
const isTocExpanded = ref(false);
const imageList = ref([]);
const activeImage = ref(0);
const photoBrowserPhotos = ref([]);
const photoBrowserRef = ref(null);
const pageContentRef = ref(null);

register({
    state: {
        item,
        loading,
        showComments,
        showCollection,
        showToc,
        tocItems,
        isTocExpanded,
        imageList,
        activeImage
    },
    scroll: () => ({
        main: pageContentRef.value?.$el
    })
});

const handleImageClick = (data) => {
    const urls = data.allUrls || [data.url];
    photoBrowserPhotos.value = urls.map(url => ({
        url: url,
        caption: ''
    }));

    // Use nextTick to ensure the ref is updated if needed, 
    // although for Photo Browser we usually just call .open(index)
    nextTick(() => {
        if (photoBrowserRef.value) {
            photoBrowserRef.value.open(data.index || 0);
        }
    });
};

const handleGalleryImageClick = (index) => {
    handleImageClick({
        url: imageList.value[index].url,
        index: index,
        allUrls: imageList.value.map(img => img.url)
    });
};

let type = props.f7route?.params?.type;
switch (type) {
    case "pin_general":
        type = "pin";
        break;
    case "p":
        type = "article";
        break;
    default:
        break;
}

const id = props.f7route?.params?.id;

const visibleTocItems = computed(() => {
    if (tocItems.value.length <= 3 || isTocExpanded.value) {
        return tocItems.value;
    }
    return tocItems.value.slice(0, 3);
});

const fetchData = async () => {
    loading.value = true;
    try {
        const apiType = type;

        const data = await $http.get(`https://api.zhihu.com/${apiType}s/v2/${id}`);

        let segs = data.structured_content?.segments ? [...data.structured_content.segments] : [];
        if (data.relationship_tips) segs.unshift({ type: 'myapptip', myapptip: { text: data.relationship_tips.text } });
        if (data.video) segs.unshift({ type: 'video', video: { id: data.video.attachment_id, title: data.video.title } });

        let bottomText = '未知';
        const info = data.content_end_info;
        if (info) {
            bottomText = info.update_time_text || info.create_time_text || '未知';
            if (info.ip_info) bottomText += ` · ${info.ip_info}`;
        }
        segs.push({ type: 'myapptip', myapptip: { text: bottomText } });

        const mappedItem = {
            id: data.id,
            title: data.header?.text || '无标题',
            authorName: data.author?.fullname || '匿名用户',
            authorId: data.author?.id,
            avatarUrl: data.author.avatar?.avatar_image?.day || '',
            imageUrl: data.image_url || data.title_image || '',
            structured_content: segs,
            content: data.content || '',
            metrics: {
                votes: data.reaction.statistics.up_vote_count || 0,
                likes: data.reaction.statistics.like_count || 0,
                favlists: data.reaction.statistics.favorites || 0,
                comments: data.reaction.statistics.comment_count || 0
            },
            isUpvoted: data.reaction?.relation?.vote === "UP" ? true : false,
            isLiked: data.reaction?.relation?.liked || false,
            isFavorited: data.reaction?.relation?.faved || false
        };


        if (data.settings?.table_of_contents?.enabled) {
            tocItems.value = extractTOC(segs);
        }

        if (type === 'answer') {
            mappedItem.questionID = data.question.id;
        }

        if (data.image_list?.images) {
            imageList.value = data.image_list.images;
        }

        item.value = mappedItem;

        HistoryService.addRecord({
            id: mappedItem.id,
            type: type,
            title: mappedItem.title,
            preview: mappedItem.content?.substring(0, 100).replace(/<[^>]+>/g, '')
        });

    } catch (e) {
        f7.dialog.alert(`文章加载失败，请稍后重试 ${e}`, () => {
            props.f7router.back();
        });
    } finally {
        loading.value = false;
    }
};

const extractTOC = (segs) => {
    const items = [];
    segs.forEach((seg, idx) => {
        if (seg.type === 'heading' && seg.heading?.text) {
            items.push({ id: `heading-${idx}`, text: seg.heading.text });
        }
    });
    return items;
};

const formatCount = (count) => {
    if (!count) return 0;
    return count > 1000 ? `${(count / 1000).toFixed(1)}k` : count;
};


const scrollToHeading = (elementId) => {
    showToc.value = false;
    nextTick(() => {
        const el = document.getElementById(elementId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
};

const toggleVote = async () => {
    if (!item.value) return;
    const isUpvoted = item.value.isUpvoted === true;
    const apiType = type;
    const url = `https://api.zhihu.com/reaction/${apiType}s/${id}/vote/up`;

    try {
        if (!isUpvoted) {
            await $http.post(url);
            item.value.isUpvoted = true;
            item.value.metrics.votes++;
        } else {
            await $http.delete(url);
            item.value.isUpvoted = false;
            item.value.metrics.votes--;
        }
    } catch (e) {
        console.error('Failed to toggle vote', e);
    }
};

const toggleLike = async () => {
    if (!item.value) return;
    const isLiked = item.value.isLiked;
    const apiType = type;
    const url = `https://api.zhihu.com/reaction/${apiType}s/${id}/like`;

    try {
        if (!isLiked) {
            await $http.post(url);
            item.value.isLiked = true;
            item.value.metrics.likes++;
        } else {
            await $http.delete(url);
            item.value.isLiked = false;
            item.value.metrics.likes--;
        }
    } catch (e) {
        console.error('Failed to toggle thank', e);
    }
};

const toggleFavorite = async () => {
    if (!item.value) return;
    const isFavorited = item.value.isFavorited;
    const apiType = type;
    const url = `https://api.zhihu.com/collections/contents/${apiType}/${id}`;

    try {
        if (!isFavorited) {
            await $http.post(url, null, { encryptHead: true });
            item.value.isFavorited = true;
            item.value.metrics.favlists++;

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
            item.value.isFavorited = false;
            item.value.metrics.favlists--;
            f7.toast.show({ text: '已取消收藏' });
        }
    } catch (e) {
        console.error('Failed to toggle favorite', e);
    }
};

const navTitleClick = () => {
    if (type == "answer") props.f7router.navigate(`/question/${item.value.questionID}`);
}

const navigateToUser = (userId) => {
    props.f7router.navigate(`/user/${userId}`);
};

onMounted(() => {
    if (!hasHistory && id) {
        fetchData();
    }
});

const onCollectionSuccess = (isFavorited) => {
    const wasFavorited = item.value.isFavorited;
    item.value.isFavorited = isFavorited;

    if (isFavorited && !wasFavorited) {
        item.value.metrics.favlists++;
    } else if (!isFavorited && wasFavorited) {
        item.value.metrics.favlists--;
    }
};

// Save article as image
const saveAsImage = async () => {
    if (!item.value) return;

    f7.toast.show({ text: '正在生成截图...' });

    try {
        // Find the main content wrapper
        const contentWrapper = document.querySelector('.page-current .content-wrapper');
        if (!contentWrapper) {
            throw new Error('Content wrapper not found');
        }

        // Calculate actual content height by removing padding-bottom
        const computedStyle = window.getComputedStyle(contentWrapper);
        const paddingBottom = parseInt(computedStyle.paddingBottom, 10);
        const actualContentHeight = contentWrapper.scrollHeight - paddingBottom;

        // Use html2canvas-pro to capture the content
        const canvas = await html2canvas(contentWrapper, {
            width: contentWrapper.offsetWidth,
            height: actualContentHeight,
            scale: 2, // Higher scale for better quality
            useCORS: true, // Allow loading images from other domains
            logging: false, // Disable logging
            backgroundColor: '#ffffff', // Set white background
        });

        // Convert canvas to data URL for preview
        const dataURL = canvas.toDataURL('image/png', 0.95);

        // Create a custom dialog with image preview
        f7.dialog.create({
            title: '截图预览',
            content: `
                <div style="padding: 10px; text-align: center;">
                    <img src="${dataURL}" style="max-width: 100%; max-height: 60vh; border-radius: 8px;" />
                </div>
            `,
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    onClick: () => {
                        // No action needed for cancel
                    }
                },
                {
                    text: '保存',
                    onClick: () => {
                        // Convert canvas to blob for download
                        canvas.toBlob((blob) => {
                            if (blob) {
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');

                                // Clean up
                                URL.revokeObjectURL(url);

                                f7.toast.show({ text: '截图已保存' });
                            }
                        }, 'image/png', 0.95);
                    }
                }
            ],
            verticalButtons: false,
            on: {
                close: () => {
                    // Clean up resources when dialog closes
                    // Note: dataURL is a base64 string, no need to revoke
                }
            }
        }).open();

    } catch (error) {
        console.error('Failed to save as image:', error);
        f7.toast.show({ text: '截图失败，截图内容过长' });
    }
};

</script>

<template>
    <f7-page class="article-detail">
        <f7-navbar>
            <f7-nav-left>
                <f7-link icon-only @click="f7router.back()">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="item" @click="navTitleClick">{{ item.title }}</f7-nav-title>
            <f7-nav-right>
                <f7-link icon-only popover-open=".article-actions-popover">
                    <f7-icon ios="f7:ellipsis_circle" md="material:more_horiz" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <!-- Article Actions Popover -->
        <f7-popover class="article-actions-popover">
            <f7-list>
                <f7-list-item title="以图片形式保存" link popover-close @click="saveAsImage" />
                <f7-list-item title="举报" link popover-close
                    @click="$openLink(`https://www.zhihu.com/report?id=${id}&type=${type}&source=android&ab_signature=`)" />
            </f7-list>
        </f7-popover>

        <div v-if="loading" class="loading-container display-flex justify-content-center align-items-center"
            style="height: 100%;">
            <f7-preloader />
        </div>

        <f7-page-content v-else-if="item" class="padding-bottom full-content" :ref="(el) => pageContentRef = el">

            <div v-if="item.imageUrl" class="hero-image-container">
                <img :src="item.imageUrl" class="hero-image" />
                <div class="hero-gradient"></div>
            </div>

            <div class="content-wrapper">
                <f7-card class="author-card" @click="navigateToUser(item.authorId)">
                    <f7-card-content class="display-flex align-items-center padding">
                        <img :src="item.avatarUrl" class="card-avatar" />
                        <div class="card-info margin-left">
                            <div class="card-name">{{ item.authorName }}</div>
                            <div class="card-desc">知乎用户</div>
                        </div>
                    </f7-card-content>
                </f7-card>

                <!-- TOC Card -->
                <f7-card v-if="tocItems.length > 0" class="toc-card">
                    <f7-card-content>
                        <div class="toc-header">目录</div>
                        <div v-for="toc in visibleTocItems" :key="toc.id" class="toc-link"
                            @click="scrollToHeading(toc.id)">
                            {{ toc.text }}
                        </div>
                        <div v-if="tocItems.length > 3" class="toc-toggle" @click="isTocExpanded = !isTocExpanded">
                            <span>{{ isTocExpanded ? '收起' : '展开更多' }}</span>
                            <f7-icon :ios="isTocExpanded ? 'f7:chevron_up' : 'f7:chevron_down'"
                                :md="isTocExpanded ? 'material:expand_less' : 'material:expand_more'"
                                class="toc-toggle-icon" />
                        </div>
                    </f7-card-content>
                </f7-card>

                <ContentRenderer :segments="item.structured_content" @imageClick="handleImageClick" />

                <div v-if="imageList.length > 0" class="image-gallery margin-top">
                    <swiper-container pagination>
                        <swiper-slide v-for="(img, index) in imageList" :key="index">
                            <img :src="img.url" style="width:100%; object-fit:contain; cursor: pointer;"
                                @click="handleGalleryImageClick(index)" />
                        </swiper-slide>
                    </swiper-container>
                </div>
            </div>
        </f7-page-content>

        <div v-if="item" class="bottom-float-container">
            <div class="float-bar glass">
                <div class="action-group" @click="toggleVote" :class="{ 'active-primary': item.isUpvoted === true }">
                    <f7-link icon-only>
                        <f7-icon :ios="item.isUpvoted === true ? 'f7:hand_thumbsup_fill' : 'f7:hand_thumbsup'"
                            :md="item.isUpvoted === true ? 'material:thumb_up' : 'material:thumb_up_off_alt'"
                            size="18" />
                    </f7-link>
                    <span class="action-count">{{ formatCount(item.metrics.votes) }}</span>
                </div>

                <div class="vertical-divider"></div>

                <div class="action-group" @click="toggleLike" :class="{ 'active-primary': item.isLiked }">
                    <f7-link icon-only>
                        <f7-icon :ios="item.isLiked ? 'f7:heart_fill' : 'f7:heart'"
                            :md="item.isLiked ? 'material:favorite' : 'material:favorite_border'" size="18" />
                    </f7-link>
                    <span class="action-count">{{ formatCount(item.metrics.likes) }}</span>
                </div>

                <div class="vertical-divider"></div>

                <div class="action-group" @click="toggleFavorite" :class="{ 'active-primary': item.isFavorited }">
                    <f7-link icon-only>
                        <f7-icon :ios="item.isFavorited ? 'f7:bookmark_fill' : 'f7:bookmark'"
                            :md="item.isFavorited ? 'material:bookmark' : 'material:bookmark_border'" size="18" />
                    </f7-link>
                    <span class="action-count">{{ formatCount(item.metrics.favlists) }}</span>
                </div>

                <div class="vertical-divider"></div>

                <div class="action-group" @click="showComments = true">
                    <f7-link icon-only>
                        <f7-icon ios="f7:bubble_left" md="material:chat_bubble_outline" size="18" />
                    </f7-link>
                    <span class="action-count">{{ formatCount(item.metrics.comments) }}</span>
                </div>
            </div>
        </div>

        <CommentsSheet v-model="showComments" :resourceId="id" :resourceType="type" :f7router="f7router" />
        <CollectionSheet v-model="showCollection" :contentId="id" :contentType="type" @success="onCollectionSuccess" />

        <f7-popover class="toc-popover" :opened="showToc" @popover:closed="showToc = false">
            <div class="display-flex justify-content-between align-items-center padding">
                <div class="font-weight-bold">目录</div>
            </div>
            <f7-list>
                <f7-list-item v-for="toc in tocItems" :key="toc.id" :title="toc.text" link
                    @click="scrollToHeading(toc.id)" popover-close />
            </f7-list>
        </f7-popover>

        <f7-photo-browser ref="photoBrowserRef" :photos="photoBrowserPhotos" theme="dark" />
    </f7-page>
</template>

<style scoped>
.article-detail {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
}

.loading-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.glass {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
}

.top-bar {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 50;
    position: relative;
    flex-shrink: 0;
}

.left-actions,
.right-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.author-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.toc-popover {
    position: absolute;
    top: 70px;
    right: 16px;
    width: 200px;
    max-height: 50vh;
    z-index: 100;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.toc-title {
    padding: 12px 16px;
    font-size: 0.875rem;
    font-weight: bold;
}

.toc-list {
    flex: 1;
    overflow-y: auto;
}

.toc-item {
    padding: 8px 16px;
    font-size: 0.875rem;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.main-scroll {
    flex: 1;
    width: 100%;
}

.hero-image-container {
    position: relative;
    width: 100%;
    height: 250px;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    opacity: 0.8;
}

.content-wrapper {
    padding: 24px;
    padding-bottom: 120px;
    max-width: 800px;
    margin: auto;
}

.article-title {
    font-size: 1.2rem;
    font-weight: bold;
}

.meta-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    margin-bottom: 24px;
}

.article-content {
    font-size: 1.125rem;
    line-height: 1.8;
}

.article-content :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
}

.article-content :deep(p) {
    margin-bottom: 16px;
}

.author-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 16px;
    max-width: none;
}

.card-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

.card-info {
    flex: 1;
}

.card-name {
    font-weight: bold;
    font-size: 1rem;
}

.card-desc {
    font-size: 0.875rem;
}

.bottom-float-container {
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 40;
}

.float-bar {
    pointer-events: auto;
    display: flex;
    align-items: center;
    padding: 8px 24px;
    border-radius: 50px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    gap: 12px;
}

.action-group {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: opacity 0.2s;
}

.action-group:active {
    opacity: 0.6;
}

.action-count {
    font-size: 0.85rem;
    font-weight: 600;
    margin-left: 2px;
    min-width: 20px;
}

.action-group.active-primary {
    color: var(--f7-theme-color);
}

.action-group.active-primary :deep(.f7-icon) {
    color: var(--f7-theme-color);
}

.vertical-divider {
    width: 1px;
    height: 20px;
    margin: 0 4px;
}

.toc-header {
    font-weight: bold;
    margin-bottom: 12px;
    font-size: 1rem;
}

.toc-link {
    padding: 8px 0;
    font-size: 0.9rem;
    cursor: pointer;
}

.toc-link:last-child {
    border-bottom: none;
}

.toc-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 12px;
    font-size: 0.875rem;
    cursor: pointer;
    margin-top: 8px;
    transition: background-color 0.2s;
}

.toc-toggle-icon {
    font-size: 1.2rem;
    margin-left: 4px;
}

.image-gallery {
    margin-top: 32px;
    border-radius: 12px;
    overflow: hidden;
}

s-carousel-item {
    background-size: cover;
    background-position: center;
}
</style>
