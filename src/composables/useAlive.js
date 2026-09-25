// src/composables/useAlive.js
// 生命周期安全：组件卸载后异步回调不再写响应式状态，避免过期写入。
// 另提供随卸载自动 abort 的 AbortSignal，用于取消在途 fetch。
import { onUnmounted, getCurrentInstance } from 'vue';

export function useAlive() {
    let alive = true;
    const controllers = new Set();

    const isAlive = () => alive;

    // 包裹回调：卸载后调用直接短路，不执行 fn
    const runIfAlive = (fn) => (...args) => {
        if (!alive) return undefined;
        return fn(...args);
    };

    // 领取一个随卸载自动 abort 的信号，传给 fetch/请求做取消
    const acquireSignal = () => {
        const ctrl = new AbortController();
        controllers.add(ctrl);
        return ctrl.signal;
    };

    if (getCurrentInstance()) {
        onUnmounted(() => {
            alive = false;
            controllers.forEach((c) => c.abort());
            controllers.clear();
        });
    }

    return { isAlive, runIfAlive, acquireSignal };
}
