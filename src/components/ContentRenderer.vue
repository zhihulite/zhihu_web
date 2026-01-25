<script setup>
import { computed } from 'vue';
import ZVideoPlayer from './ZVideoPlayer.vue';
import RenderStyledText from './RenderStyledText.vue';


const props = defineProps({
    segments: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['imageClick']);

const allImageUrls = computed(() => {
    return props.segments
        .filter(seg => seg.type === 'image')
        .map(seg => seg.image.urls?.[0])
        .filter(url => !!url);
});

const handleImageClick = (url) => {
    const index = allImageUrls.value.indexOf(url);
    emit('imageClick', { url, index, allUrls: allImageUrls.value });
};

const getCardInfo = (segment) => {
    if (!segment.card) return {};
    try {
        const extra = segment.card.extra_info ? JSON.parse(segment.card.extra_info) : {};
        return {
            title: segment.card.title,
            desc: extra.desc || extra.description || '',
            url: extra.url || '#',
            cover: segment.card.cover
        };
    } catch (e) {
        return { title: segment.card.title, desc: '', url: '#' };
    }
};
</script>

<template>
    <div class="content-renderer">
        <template v-for="(segment, index) in segments" :key="index">

            <!-- Paragraph -->
            <p v-if="segment.type === 'paragraph'" class="paragraph">
                <RenderStyledText :text="segment.paragraph.text" :marks="segment.paragraph.marks" />
            </p>

            <!-- Heading -->
            <h3 v-else-if="segment.type === 'heading'" :id="`heading-${index}`" class="heading">
                {{ segment.heading.text }}
            </h3>

            <!-- Blockquote -->
            <div v-else-if="segment.type === 'blockquote'" class="blockquote-wrapper">
                <div class="quote-icon">
                    <f7-icon ios="f7:quote_bubble_fill" md="material:format_quote" size="24" />
                </div>
                <blockquote class="blockquote">
                    <RenderStyledText :text="segment.blockquote.text" :marks="segment.blockquote.marks" />
                </blockquote>
            </div>

            <!-- Code Block -->
            <div v-else-if="segment.type === 'code_block'" class="code-block">
                <pre class="code-content"><code>{{ segment.code_block.content }}</code></pre>
            </div>

            <!-- List Node -->
            <component :is="segment.list_node.ordered ? 'ol' : 'ul'" v-else-if="segment.type === 'list_node'"
                class="list-node" :class="{ 'ordered': segment.list_node.ordered }">
                <li v-for="(item, i) in segment.list_node.items" :key="i" class="list-item">
                    <RenderStyledText :text="item.text" :marks="item.marks" />
                </li>
            </component>

            <figure v-else-if="segment.type === 'image'" class="image-figure">
                <div class="image-wrapper" :style="{
                    aspectRatio: (segment.image.width && segment.image.height) ? `${segment.image.width} / ${segment.image.height}` : 'auto',
                    backgroundColor: '#f5f5f5'
                }">
                    <img :src="segment.image.urls?.[0]" :alt="segment.image.description || 'Article Image'"
                        class="article-image" loading="lazy" @click="handleImageClick(segment.image.urls?.[0])" />
                </div>
                <figcaption v-if="segment.image.description" class="image-caption">
                    {{ segment.image.description }}
                </figcaption>
            </figure>

            <!-- Card -->
            <f7-card v-else-if="segment.type === 'card'" @click="$openLink(getCardInfo(segment).url)"
                class="link-card group">
                <div class="card-content">
                    <h4 class="card-title">{{ getCardInfo(segment).title }}</h4>
                    <p class="card-desc">{{ getCardInfo(segment).desc }}</p>
                    <div class="card-meta">
                        <f7-icon ios="f7:arrow_up_right_square" md="material:open_in_new" size="12" />
                        <span>Link Card</span>
                    </div>
                </div>
                <img v-if="getCardInfo(segment).cover" :src="getCardInfo(segment).cover" class="card-cover" />
            </f7-card>

            <!-- Video -->
            <ZVideoPlayer v-else-if="segment.type === 'video'" :video-id="segment.video.id"
                :poster="segment.video.poster" />

            <!-- MyAppTip -->
            <div v-else-if="segment.type === 'myapptip'" class="app-tip">
                <div class="tip-icon">
                    <f7-icon ios="f7:info_circle" md="material:info" size="20" />
                </div>
                <div>{{ segment.myapptip.text }}</div>
            </div>

            <!-- HR -->
            <hr v-else-if="segment.type === 'hr'" class="hr-divider" />

        </template>
    </div>
</template>

<style scoped>
.content-renderer {
    line-height: 1.8;
}

.paragraph {
    font-size: 17px;
    line-height: 1.8;
    margin-bottom: 24px;
    letter-spacing: 0.01em;
}

.heading {
    scroll-margin-top: 80px;
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 32px;
    margin-bottom: 16px;
    padding-left: 12px;
}

.blockquote-wrapper {
    position: relative;
    padding-left: 24px;
    margin: 24px 0;
}

.quote-icon {
    position: absolute;
    top: 0;
    left: 0;
}

.blockquote {
    font-size: 1.125rem;
    font-style: italic;
    padding-left: 16px;
    margin: 0;
}

.code-block {
    background-color: #1e1e1e;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    overflow-x: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.code-lang {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 8px;
    text-transform: uppercase;
    font-family: monospace;
}

.code-content {
    margin: 0;
}

.code-content code {
    font-family: monospace;
    font-size: 0.875rem;
    color: #e5e7eb;
}

.list-node {
    padding-left: 24px;
    margin: 16px 0;
}

.list-item {
    margin-bottom: 8px;
    padding-left: 8px;
}

.list-node ul {
    list-style-type: disc;
}

.list-node ol {
    list-style-type: decimal;
}

.image-figure {
    margin: 24px 0;
}

.article-image {
    width: 100%;
    border-radius: 12px;
    display: block;
    cursor: pointer;
}

.image-caption {
    text-align: center;
    font-size: 0.875rem;
    margin-top: 8px;
}

.link-card {
    display: flex;
    align-items: center;
    gap: 16px;
    border-radius: 12px;
    padding: 12px;
    margin: 16px 0;
    text-decoration: none;
    transition: background-color 0.2s;
}

.card-content {
    flex: 1;
    min-width: 0;
}

.card-title {
    font-weight: bold;
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 1rem;
}

.card-desc {
    font-size: 0.875rem;
    margin: 4px 0 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
}

.card-cover {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    object-fit: cover;
    background-color: #eee;
}

.video-container {
    margin: 24px 0;
    border-radius: 12px;
    overflow: hidden;
    background-color: black;
    aspect-ratio: 16 / 9;
}

.video-player {
    width: 100%;
    height: 100%;
}

.app-tip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    margin: 24px 0;
    font-size: 14px;
    border-left: 3px solid var(--f7-theme-color);
    color: var(--f7-text-color);
    opacity: 0.8;
}

.tip-icon {
    display: flex;
    align-items: center;
    color: var(--f7-theme-color);
}

.hr-divider {
    margin: 32px 0;
    border: none;
    opacity: 0.5;
}
</style>
