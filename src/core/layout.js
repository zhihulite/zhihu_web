// src/core/layout.js
// 外壳装配：双栏断点与侧栏常驻取自设置项，卡片留白与无图模式映射到根元素。
import { watch } from 'vue';
import { f7 } from 'framework7-vue';
import { settings } from '@/core/settings.js';

// 侧栏常驻的起始宽度
export const PANEL_BREAKPOINT = 768;
// 平行世界的起始宽度：窄于此宽度两栏放不下，开了也不分栏
export const PARALLEL_BREAKPOINT = 600;

/**
 * 交给 View 的 masterDetailBreakpoint：0 表示关掉双栏。
 * View 只在创建时读一次，所以开关要重启才生效。
 */
export function parallelBreakpoint() {
    return settings.parallelWorld ? PARALLEL_BREAKPOINT : 0;
}

// 卡片留白与无图模式都是「设置项 → 根元素」的映射：页面与卡片只认 CSS 变量和 html 类名
function applySettingsToRoot() {
    const root = document.documentElement;
    root.style.setProperty('--app-page-margin', `${settings.pageMargin}px`);
    root.style.setProperty('--app-card-gap', `${settings.cardGap}px`);
    root.style.setProperty('--app-card-padding', `${settings.cardPadding}px`);
    root.classList.toggle('no-image', !!settings.noImage);
}

// F7 自己不记侧栏偏好（panel 没有 store 类参数），关掉的状态靠这个开关位维持
function applyPanelPin() {
    const panel = f7?.panel?.get('left');
    if (!panel) return;
    if (settings.panelPinned) panel.enableVisibleBreakpoint();
    else panel.disableVisibleBreakpoint();
}

/** 左上菜单键：宽屏切换常驻侧栏并记住，窄屏只是开合覆盖层，不写偏好 */
export function toggleSidePanel() {
    const panel = f7?.panel?.get('left');
    if (!panel) return;
    f7.panel.toggle('left');
    if (f7.width >= PANEL_BREAKPOINT) settings.panelPinned = !panel.visibleBreakpointDisabled;
}

export function installLayout() {
    applyPanelPin();

    applySettingsToRoot();
    watch(
        () => [settings.pageMargin, settings.cardGap, settings.cardPadding, settings.noImage],
        applySettingsToRoot,
    );
}
