// src/composables/useTheme.js
// 主题配置的读写与应用：App 启动时套用已保存配置并监听系统深色，设置页增量修改。
import { KEYS, getJSON, setJSON } from '@/services/storage.js';

export function loadThemeConfig() {
    return getJSON(KEYS.theme, null);
}

// 主题配置由设置页、主题子页、布局子页各写自己那几项，合并不覆盖整份
export function saveThemeConfig(patch) {
    setJSON(KEYS.theme, { ...loadThemeConfig(), ...patch });
}

// OLED 纯黑：在 html 上加 oled class，配合 app.css 里 .dark.oled 的变量覆盖生效
export function applyOled(enabled) {
    document.documentElement.classList.toggle('oled', !!enabled);
}

/** Material 主题下的配色方案，value 即 setMdColorScheme 的取值 */
export const MD_SCHEMES = [
    { value: 'default', label: '标准', text: '默认色调，强调色与表面色同色系' },
    { value: 'vibrant', label: '鲜明', text: '强调色更饱和，表面色带彩色倾向' },
    { value: 'monochrome', label: '单色', text: '表面与背景去色，只保留强调色' },
];

/** 方案取值收敛：含 monochrome 的组合格一律落到单色，未知值落到标准 */
export function normalizeMdScheme(value) {
    if (typeof value === 'string' && value.includes('monochrome')) return 'monochrome';
    return MD_SCHEMES.some((s) => s.value === value) ? value : 'default';
}

// 把配置整体套用到 Framework7 实例；systemDark 用于 followSystem 时的即时深色态
export function applyThemeConfig(f7, config, systemDark) {
    if (!config) return;

    if (config.followSystem) {
        const dark = systemDark ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
        f7.setDarkMode(dark);
    } else if (config.darkMode !== undefined) {
        f7.setDarkMode(config.darkMode);
    }

    applyOled(config.oledMode);

    if (config.fontSize) {
        document.documentElement.style.setProperty('--f7-font-size', config.fontSize);
    }

    if (config.useCustomColor && typeof config.customColor === 'string' && config.customColor.trim()) {
        f7.setColorTheme(config.customColor);
    } else if (config.color && f7.colors[config.color]) {
        f7.setColorTheme(f7.colors[config.color]);
    }

    // Material 配色方案：只影响 .md 下的 M3 调色板，iOS 主题下无副作用
    f7.setMdColorScheme(normalizeMdScheme(config.mdScheme));
}

/** App 启动：套用配置并在 followSystem 下随系统深色切换，返回清理函数 */
export function installThemeSync(f7) {
    const config = loadThemeConfig();
    applyThemeConfig(f7, config);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
        const latest = loadThemeConfig();
        if (latest?.followSystem) f7.setDarkMode(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
}
