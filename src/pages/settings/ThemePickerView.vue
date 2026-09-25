<script setup>
import { computed } from 'vue';
import { f7 } from 'framework7-vue';
import { themeSettings, activeThemeHex, resetThemeSettings } from '@/composables/useThemeSettings.js';
import { MD_SCHEMES } from '@/composables/useTheme.js';
import { destroyOnClosed } from '@/utils/modal.js';

// 预览的角色色条：配色方案直接改写这几个变量，切一眼就能看出方案生效
const ROLE_VARS = ['--f7-md-primary', '--f7-md-primary-container', '--f7-md-secondary-container',
    '--f7-md-surface-2', '--f7-md-surface-4'];

const colors = Object.keys(f7.colors).filter((c) => c !== 'primary' && c !== 'white' && c !== 'black');

const currentColor = computed(() => themeSettings.color);
const currentHex = computed(() => activeThemeHex());
const isMd = computed(() => f7.theme === 'md');
const schemeLabel = computed(() => MD_SCHEMES.find((s) => s.value === themeSettings.mdScheme)?.label || '');
const schemeText = computed(() => MD_SCHEMES.find((s) => s.value === themeSettings.mdScheme)?.text || '');

// 方案名只在 Material 下有意义，iOS 主题只显示色值
const captionLine = computed(() => (isMd.value ? `${schemeLabel.value} · ${currentHex.value}` : currentHex.value));

const setColorTheme = (color) => {
    if (themeSettings.useCustomColor) {
        f7.dialog.alert('请先关闭自定义颜色开关，才能设置预设主题色。');
        return;
    }
    themeSettings.color = color;
};

const customColorValue = computed(() => ({ hex: themeSettings.customColor || '#000000' }));

// 浮层关掉后 F7 只隐藏不摘节点，每次重开留一份；关掉即销毁。
// 自己接管 change：colorPickerParams 里的 on 会整体覆盖组件内置的那个，不补回来就收不到值。
const colorPickerParams = {
    modules: ['sb-spectrum', 'hsb-sliders', 'alpha-slider'],
    targetEl: '.custom-color-target',
    on: {
        change: (picker, value) => {
            if (value?.hex) themeSettings.customColor = value.hex;
        },
        opened: (picker) => picker.modal && destroyOnClosed(picker.modal),
    },
};

// 关掉自定义后由 applyThemeConfig 回落到预设色，这里只记开关
const toggleCustomColor = (checked) => {
    if (checked && !themeSettings.customColor) themeSettings.customColor = '#007aff';
    themeSettings.useCustomColor = checked;
};

const restoreDefault = () => {
    resetThemeSettings(['color', 'customColor', 'useCustomColor', 'mdScheme']);
    f7.toast.show({ text: '已恢复默认', closeTimeout: 2000 });
};
</script>

<template>
    <f7-page name="settings-theme">
        <f7-navbar title="主题设置" back-link="返回">
            <f7-nav-right>
                <f7-link @click="restoreDefault">恢复默认</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-block-title>主题色</f7-block-title>
        <f7-block strong inset>
            <div class="color-theme-container">
                <f7-button v-for="color in colors" :key="color" fill round small class="color-picker-button"
                    :class="`color-${color}`" @click="setColorTheme(color)"
                    :style="{ opacity: themeSettings.useCustomColor ? 0.4 : 1 }">
                    <f7-icon f7="checkmark_alt" size="16" color="white" v-if="currentColor === color" />
                </f7-button>
            </div>
        </f7-block>

        <f7-block-title>预览</f7-block-title>
        <f7-block strong inset>
            <div class="display-flex justify-content-space-between align-items-center">
                <span class="font-size-17">示例文本</span>
                <div class="display-flex align-items-center" style="gap: 6px;">
                    <span class="role-dot" style="background: var(--f7-md-primary-container, var(--f7-theme-color));"></span>
                    <span class="role-dot" style="background: var(--f7-md-secondary-container, var(--f7-theme-color));"></span>
                </div>
            </div>
            <p class="text-color-gray font-size-13 margin-top-half">预览当前主题的文字与按钮效果</p>
            <div class="display-flex align-items-center margin-top" style="gap: 8px;">
                <f7-button fill round small>主要按钮</f7-button>
                <f7-button round outline small>取消</f7-button>
                <f7-link href="#">文字链接</f7-link>
            </div>
            <p class="text-color-gray font-size-13 margin-top">{{ captionLine }}</p>
            <div v-if="isMd" class="display-flex role-swatches margin-top-half">
                <span v-for="v in ROLE_VARS" :key="v" :style="{ background: `var(${v})` }"></span>
            </div>
        </f7-block>

        <f7-block-title>自定义颜色</f7-block-title>
        <f7-block strong inset>
            <div class="display-flex justify-content-space-between align-items-center">
                <span>使用自定义主题色</span>
                <f7-toggle :checked="themeSettings.useCustomColor"
                    @change="toggleCustomColor($event.target.checked)" />
            </div>
            <div v-if="themeSettings.useCustomColor" class="display-flex align-items-center margin-top-half">
                <div class="custom-color-target margin-right"
                    :style="{ backgroundColor: themeSettings.customColor || '#007aff' }"></div>
                <f7-input type="colorpicker" placeholder="点击选择颜色" readonly
                    :value="customColorValue" :color-picker-params="colorPickerParams" />
            </div>
        </f7-block>

        <template v-if="isMd">
            <f7-block-title>配色方案</f7-block-title>
            <f7-block strong inset>
                <div class="display-flex scheme-chips">
                    <f7-button v-for="scheme in MD_SCHEMES" :key="scheme.value" round small
                        :fill="themeSettings.mdScheme === scheme.value"
                        :outline="themeSettings.mdScheme !== scheme.value"
                        @click="themeSettings.mdScheme = scheme.value">{{ scheme.label }}</f7-button>
                </div>
                <p class="text-color-gray font-size-13 margin-top-half">{{ schemeText }}</p>
            </f7-block>
            <f7-block-footer class="font-size-13">配色方案只作用于 Material 主题，iOS 主题下界面不变。
                对比度在 Framework7 里写死为标准档，故不提供。</f7-block-footer>
        </template>
    </f7-page>
</template>

<style scoped>
.color-picker-button {
    height: 32px;
    width: 32px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: unset;
}

.color-theme-container {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    padding: 10px 0;
}

.custom-color-target {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid var(--app-divider-color);
    flex-shrink: 0;
}

.role-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: block;
}

.role-swatches {
    gap: 8px;
    flex-wrap: wrap;
}

.role-swatches span {
    width: 40px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--app-divider-color);
}

.scheme-chips {
    flex-wrap: wrap;
    gap: 8px;
}
</style>
