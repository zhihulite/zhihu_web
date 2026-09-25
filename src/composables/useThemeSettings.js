// src/composables/useThemeSettings.js
// 主题与显示设置的全局单例：设置页与主题、布局子页共用同一份状态，改动即套用并落盘。
import { reactive, watch } from 'vue';
import { f7 } from 'framework7-vue';
import { loadThemeConfig, saveThemeConfig, applyThemeConfig, normalizeMdScheme } from '@/composables/useTheme.js';
import { debounce } from '@/utils/timing.js';

const DEFAULTS = {
    color: 'blue',
    customColor: '',
    useCustomColor: false,
    fontSize: '16px',
    darkMode: false,
    followSystem: false,
    // 默认开；只有深色下有可见差异（app.css 的 html.dark.oled 覆盖背景），所以不限制开关时机
    oledMode: true,
    // Material 配色方案，取值见 useTheme.js 的 MD_SCHEMES；iOS 主题下不生效
    mdScheme: 'default',
};

const stored = { ...loadThemeConfig() };
// 方案可能存成 monochrome / vibrant 两个布尔，先合成再收敛到支持的那三个取值
stored.mdScheme = normalizeMdScheme(stored.mdScheme
    || [stored.monochrome && 'monochrome', stored.vibrant && 'vibrant'].filter(Boolean).join('-'));

export const themeSettings = reactive({ ...DEFAULTS, ...stored });

// 套用走启动期同一函数，页面里不再各自拼 setDarkMode / setColorTheme 调用。
// 套用即时，落盘合批：滑块是逐帧改值，一次细滑写几十遍没有意义。
const persist = debounce(() => saveThemeConfig(themeSettings), 200);

watch(themeSettings, () => {
    applyThemeConfig(f7, themeSettings);
    persist();
}, { deep: true });

// 合批窗口内离开页面会丢掉最后一次改动，卸载前无条件补写
window.addEventListener('pagehide', () => saveThemeConfig(themeSettings));

/** 当前生效的主题色十六进制值 */
export function activeThemeHex() {
    if (themeSettings.useCustomColor && themeSettings.customColor) return themeSettings.customColor;
    return f7.colors[themeSettings.color] || '';
}

/** 把给定项写回默认值 */
export function resetThemeSettings(keys) {
    for (const key of keys) {
        if (key in DEFAULTS) themeSettings[key] = DEFAULTS[key];
    }
}
