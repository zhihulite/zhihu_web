<script setup>
import { computed } from 'vue';
import { f7 } from 'framework7-vue';
import { settings, resetSettings } from '@/core/settings.js';
import { themeSettings, resetThemeSettings } from '@/composables/useThemeSettings.js';

const LAYOUT_KEYS = ['pageMargin', 'cardGap', 'cardPadding'];
const fontSizePx = computed(() => parseInt(themeSettings.fontSize, 10) || 16);

const setFontSize = (px) => { themeSettings.fontSize = `${px}px`; };

const restoreDefault = () => {
    resetThemeSettings(['fontSize']);
    resetSettings(LAYOUT_KEYS);
    f7.toast.show({ text: '已恢复默认' });
};

// 预览卡直接吃这几个值：边距、间距、内距与字号在这里当场可见
const previewStyle = computed(() => ({
    paddingLeft: `${settings.pageMargin}px`,
    paddingRight: `${settings.pageMargin}px`,
    fontSize: `${fontSizePx.value}px`,
}));
const cardStyle = computed(() => ({
    marginTop: `${settings.cardGap}px`,
    padding: `${settings.cardPadding}px`,
}));
</script>

<template>
    <f7-page name="settings-page-layout">
        <f7-navbar title="页面布局" back-link="返回"></f7-navbar>

        <f7-block-title>预览</f7-block-title>

        <div class="layout-preview" :style="previewStyle">
            <div class="layout-preview-card" :style="cardStyle">
                <p class="preview-title">如何评价这次的布局调整？</p>
                <p class="preview-excerpt">拖动下方滑块，这张卡片会同步显示字号与边距的效果。</p>
                <p class="preview-metrics">1024 赞同 · 36 评论</p>
            </div>
            <div class="layout-preview-card" :style="cardStyle">
                <p class="preview-title">相邻卡片的间距同样实时更新</p>
                <p class="preview-metrics">256 赞同 · 12 评论</p>
            </div>
        </div>

        <f7-block-title>间距与字号</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="字体大小" text="同时影响列表、卡片与网页正文" :after="`${fontSizePx} px`">
                <f7-range :min="12" :max="30" :step="1" :value="fontSizePx" @range:changed="setFontSize($event)" />
            </f7-list-item>
            <f7-list-item title="页边距" text="卡片距屏幕左右两侧的距离" :after="`${settings.pageMargin} px`">
                <f7-range :min="0" :max="32" :step="2" :value="settings.pageMargin"
                    @range:changed="settings.pageMargin = $event" />
            </f7-list-item>
            <f7-list-item title="卡片间距" text="相邻卡片之间的留白" :after="`${settings.cardGap} px`">
                <f7-range :min="0" :max="24" :step="2" :value="settings.cardGap"
                    @range:changed="settings.cardGap = $event" />
            </f7-list-item>
            <f7-list-item title="卡片内边距" text="卡片边框到文字的距离" :after="`${settings.cardPadding} px`">
                <f7-range :min="8" :max="28" :step="2" :value="settings.cardPadding"
                    @range:changed="settings.cardPadding = $event" />
            </f7-list-item>
        </f7-list>

        <f7-block strong inset>
            <f7-button fill round @click="restoreDefault">恢复默认</f7-button>
        </f7-block>
    </f7-page>
</template>

<style scoped>
.layout-preview {
    padding-top: 8px;
    padding-bottom: 16px;
}

.layout-preview-card {
    border-radius: 8px;
    background-color: var(--f7-card-bg-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, .1);
}

.preview-title {
    font-weight: 600;
    line-height: 1.4;
}

.preview-excerpt {
    margin-top: .4em;
    font-size: .92em;
    color: var(--f7-text-color);
    opacity: .75;
    line-height: 1.5;
}

.preview-metrics {
    margin-top: .8em;
    font-size: .82em;
    color: var(--app-sub-text);
}
</style>
