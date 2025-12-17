<script setup>
import RenderStyledText from './RenderStyledText.vue';
import MaterialSymbol from './MaterialSymbol.vue';

defineProps({
    segments: {
        type: Array,
        default: () => []
    }
});

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
                    <MaterialSymbol icon="format_quote" :size="24" fill />
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

            <!-- Image -->
            <figure v-else-if="segment.type === 'image'" class="image-figure">
                <img :src="segment.image.urls?.[0]" :alt="segment.image.description || 'Article Image'"
                    class="article-image" loading="lazy" />
                <figcaption v-if="segment.image.description" class="image-caption">
                    {{ segment.image.description }}
                </figcaption>
            </figure>

            <!-- Card -->
            <a v-else-if="segment.type === 'card'" :href="getCardInfo(segment).url" target="_blank" rel="noopener"
                class="link-card group">
                <div class="card-content">
                    <h4 class="card-title">{{ getCardInfo(segment).title }}</h4>
                    <p class="card-desc">{{ getCardInfo(segment).desc }}</p>
                    <div class="card-meta">
                        <MaterialSymbol icon="open_in_new" :size="12" />
                        <span>Link Card</span>
                    </div>
                </div>
                <img v-if="getCardInfo(segment).cover" :src="getCardInfo(segment).cover" class="card-cover" />
            </a>

            <!-- Video -->
            <div v-else-if="segment.type === 'video'" class="video-container">
                <video controls class="video-player" :src="segment.video.url" :poster="segment.video.poster">
                    Your browser does not support the video tag.
                </video>
            </div>

            <!-- MyAppTip -->
            <div v-else-if="segment.type === 'myapptip'" class="app-tip">
                <div class="tip-icon">
                    <MaterialSymbol icon="info" :size="20" />
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
    color: var(--md-sys-color-on-surface);
    line-height: 1.8;
}

.paragraph {
    font-size: 17px;
    line-height: 1.8;
    color: rgba(var(--md-sys-color-on-surface), 0.9);
    margin-bottom: 24px;
    letter-spacing: 0.01em;
}

.heading {
    scroll-margin-top: 80px;
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    margin-top: 32px;
    margin-bottom: 16px;
    border-left: 4px solid var(--md-sys-color-primary);
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
    color: rgba(var(--md-sys-color-primary), 0.2);
}

.blockquote {
    font-size: 1.125rem;
    font-style: italic;
    color: var(--md-sys-color-on-surface-variant);
    border-left: 2px solid rgba(var(--md-sys-color-primary), 0.3);
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

.list-node::marker {
    color: var(--md-sys-color-primary);
}

.image-figure {
    margin: 24px 0;
}

.article-image {
    width: 100%;
    border-radius: 12px;
    background-color: var(--md-sys-color-surface-container);
    display: block;
}

.image-caption {
    text-align: center;
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
    margin-top: 8px;
}

.link-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
    padding: 12px;
    margin: 16px 0;
    border: 1px solid var(--md-sys-color-outline-variant);
    text-decoration: none;
    transition: background-color 0.2s;
}

.link-card:hover {
    background-color: var(--md-sys-color-surface-container);
}

.card-content {
    flex: 1;
    min-width: 0;
}

.card-title {
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 1rem;
}

.link-card:hover .card-title {
    color: var(--md-sys-color-primary);
}

.card-desc {
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
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
    color: var(--md-sys-color-outline);
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
    align-items: flex-start;
    gap: 12px;
    background-color: rgba(var(--md-sys-color-secondary-container), 0.3);
    color: var(--md-sys-color-secondary);
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    font-size: 0.875rem;
}

.tip-icon {
    margin-top: 2px;
}

.hr-divider {
    margin: 32px 0;
    border: none;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    opacity: 0.5;
}
</style>
