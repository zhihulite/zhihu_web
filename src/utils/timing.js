// src/utils/timing.js
// 定时器工具：防抖与节流。

/** 延迟执行，重复调用重置计时 */
export function debounce(fn, wait) {
    let timer = null;
    const debounced = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

/** wait 内最多执行一次（首次立即执行） */
export function throttle(fn, wait) {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last < wait) return;
        last = now;
        fn(...args);
    };
}
