<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import ContentRenderer from './ContentRenderer.vue';
import CommentsSheet from './CommentsSheet.vue';
import $http from '../api/http.js';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const item = ref(null);
const loading = ref(true);
const showComments = ref(false);
const showToc = ref(false);
const tocItems = ref([]);
const isTocExpanded = ref(false);
const scrollRef = ref(null);
const imageList = ref([]);
const activeImage = ref(0);
const photoBrowserPhotos = ref([]);
const photoBrowserRef = ref(null);

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

const type = props.f7route?.params?.type;
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
        const apiType = type === 'p' ? 'article' : type;

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
            author: data.author?.fullname || '匿名用户',
            authorId: data.author?.id,
            avatarUrl: data.author.avatar?.avatar_image?.day || '',
            imageUrl: data.image_url || data.title_image || '',
            structured_content: segs,
            content: data.content || '',
            metrics: {
                votes: data.reaction.statistics.up_vote_count || 0,
                comments: data.reaction.statistics.comment_count || 0
            }
        };

        if (type === 'p') {
            tocItems.value = extractTOC(segs);
        }

        if (data.image_list?.images) {
            imageList.value = data.image_list.images;
        }

        item.value = mappedItem;

    } catch (e) {
        console.error('Failed to fetch article', e);
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

onMounted(() => {
    if (id) {
        fetchData();
    }
});

</script>

<template>
    <f7-page class="article-detail">
        <f7-navbar>
            <f7-nav-left>
                <f7-link icon-only @click="f7router.back()">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="item">{{ item.title }}</f7-nav-title>
            <f7-nav-right>
                <f7-link icon-only>
                    <f7-icon ios="f7:ellipsis_circle" md="material:more_horiz" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <div v-if="loading" class="loading-container display-flex justify-content-center align-items-center"
            style="height: 100%;">
            <f7-preloader />
        </div>

        <f7-page-content v-else-if="item" class="padding-bottom full-content">

            <div v-if="item.imageUrl" class="hero-image-container">
                <img :src="item.imageUrl" class="hero-image" />
                <div class="hero-gradient"></div>
            </div>

            <div class="content-wrapper">
                <f7-card class="author-card" @click="f7router.navigate(`/user/${item.authorId}`)">
                    <f7-card-content class="display-flex align-items-center padding">
                        <img :src="item.avatarUrl" class="card-avatar" />
                        <div class="card-info margin-left">
                            <div class="card-name">{{ item.author }}</div>
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
                                class="toggle-icon" />
                        </div>
                    </f7-card-content>
                </f7-card>

                <ContentRenderer :segments="item.structured_content" @imageClick="handleImageClick" />

                <div v-if="imageList.length > 0" class="image-gallery margin-top">
                    <f7-swiper pagination>
                        <f7-swiper-slide v-for="(img, index) in imageList" :key="index">
                            <img :src="img.url" style="width:100%; object-fit:contain; cursor: pointer;"
                                @click="handleGalleryImageClick(index)" />
                        </f7-swiper-slide>
                    </f7-swiper>
                </div>
            </div>
        </f7-page-content>

        <!-- Bottom Float Bar logic inside page to float -->
        <div v-if="item" class="bottom-float-container">
            <div class="float-bar glass">
                <div class="action-group">
                    <f7-link icon-only>
                        <f7-icon ios="f7:hand_thumbsup" md="material:thumb_up" size="20" />
                    </f7-link>
                    <span class="action-count">{{ formatCount(item.metrics.votes) }}</span>
                </div>

                <div class="vertical-divider"></div>

                <div class="action-group" @click="showComments = true">
                    <f7-link icon-only>
                        <f7-icon ios="f7:bubble_left" md="material:chat_bubble" size="20" />
                    </f7-link>
                    <span class="action-count">{{ formatCount(item.metrics.comments) }}</span>
                </div>

                <div class="vertical-divider"></div>

                <f7-link icon-only>
                    <f7-icon ios="f7:bookmark" md="material:bookmark" size="20" />
                </f7-link>
            </div>
        </div>

        <CommentsSheet v-model="showComments" :resourceId="id" :resourceType="type" />

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
    background-color: var(--md-sys-color-surface);
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
    border: 1px solid rgba(var(--md-sys-color-outline-variant), 0.1);
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
    background-color: var(--md-sys-color-surface-container-low);
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

.toc-item:hover {
    background-color: var(--md-sys-color-surface-container);
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
    background: linear-gradient(to top, var(--md-sys-color-surface), transparent);
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
    color: var(--md-sys-color-on-surface);
}

.meta-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.875rem;
    margin-bottom: 24px;
}

.article-content {
    font-size: 1.125rem;
    line-height: 1.8;
    color: var(--md-sys-color-on-surface);
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
    color: var(--md-sys-color-on-surface-variant);
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
    color: var(--md-sys-color-on-surface-variant);
    margin-left: 2px;
    min-width: 20px;
}

.vertical-divider {
    width: 1px;
    height: 20px;
    background-color: var(--md-sys-color-outline-variant);
    margin: 0 4px;
}

.toc-card {
    background-color: var(--md-sys-color-surface-container-low);
    padding: 16px;
    border-radius: 12px;
    margin: 16px 0 24px 0;
    max-width: none;
    min-width: 100%;
}

.toc-header {
    font-weight: bold;
    margin-bottom: 12px;
    font-size: 1rem;
    color: var(--md-sys-color-on-surface);
}

.toc-link {
    padding: 8px 0;
    font-size: 0.9rem;
    color: var(--md-sys-color-primary);
    cursor: pointer;
    border-bottom: 1px solid rgba(var(--md-sys-color-outline-variant), 0.2);
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
    color: var(--md-sys-color-primary);
    cursor: pointer;
    border-top: 1px solid rgba(var(--md-sys-color-outline-variant), 0.2);
    margin-top: 8px;
    transition: background-color 0.2s;
}

.toc-toggle:hover {
    background-color: var(--md-sys-color-surface-container);
    border-radius: 8px;
}

.toggle-icon {
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
