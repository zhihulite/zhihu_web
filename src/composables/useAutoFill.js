// src/composables/useAutoFill.js
// 满屏自动续拉：一次加载结束后若容器还能「看到底」，说明内容没撑出可滚动余量，
// 而 Framework7 的 infinite 只在 scroll 事件里判定（components/infinite-scroll/infinite-scroll.js:45），
// 不产生滚动就永远等不到下一次加载。
import { getCurrentInstance, onUnmounted } from 'vue';

// 等布局与图片占位稳定后再量高度
const CHECK_DELAY = 50;
// 距底小于该值视为「能看到底」，继续补拉
const SCROLL_EDGE = 20;

/**
 * @param {object} opts
 * @param {(ctx:any) => HTMLElement|null} opts.getEl 取当前要判断的滚动容器，null 表示跳过
 * @param {(ctx:any) => void} opts.onLoad 需要补拉时调用
 */
export function useAutoFill({ getEl, onLoad }) {
    const instance = getCurrentInstance();
    let timer = null;
    let context = null;

    // 组件内首个可见 .page-content；多 Tab 页里隐藏 tab 的 clientHeight 为 0，会被跳过
    const defaultEl = () => {
        const root = instance?.proxy?.$el;
        const nodes = root?.querySelectorAll ? [...root.querySelectorAll('.page-content')] : [];
        return nodes.find((el) => el.clientHeight > 0) || null;
    };

    const check = () => {
        timer = null;
        const el = getEl ? getEl(context) : defaultEl();
        // clientHeight 为 0 说明该容器不可见（多 Tab 页的隐藏 tab），跳过避免空转拉完整页
        if (!el || !el.clientHeight) return;
        if (el.scrollHeight - el.clientHeight <= SCROLL_EDGE) onLoad(context);
    };

    const schedule = (ctx = null) => {
        if (timer !== null) return;
        context = ctx;
        timer = setTimeout(check, CHECK_DELAY);
    };

    onUnmounted(() => {
        if (timer !== null) clearTimeout(timer);
    });

    return { schedule };
}
