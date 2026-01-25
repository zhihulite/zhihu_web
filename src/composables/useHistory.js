import { onMounted, onBeforeUnmount, nextTick, isRef, unref } from 'vue';
import store from '@/store';

/**
 * useHistory Composable
 * 用于在页面组件中记录和恢复状态及滚动位置
 * 
 * @param {Object} props - 组件的 props，必须包含 routeId (Route Instance ID)
 * @param {string} key - 默认为 'default'，用于手动保存滚动位置时的标识
 */
export function useHistory(props, key = 'default') {

    /**
     * 保存状态到 Framework7 Store 缓存
     */
    const saveState = (data) => {
        if (props.routeId) {
            store.dispatch('saveRouteCache', { routeId: props.routeId, data });
        }
    };

    /**
     * 从 Framework7 Store 缓存恢复状态
     * @param {Function} callback - 恢复后的回调函数
     */
    const restoreState = (callback) => {
        if (props.routeId) {
            const cache = store.getters.routeCache;
            // 获取缓存值，兼容 Framework7 Store 的不同访问方式
            const stateValues = (cache && cache.value) ? cache.value : (cache || {});

            const data = stateValues[props.routeId];

            if (data && callback) {
                callback(data);
            }
            return data;
        }
    };

    /**
     * 注册自动保存和恢复逻辑
     * @param {Object} config - 配置项
     * @param {Object} config.state - 需要保存响应式变量映射 { key: ref|reactive }
     * @param {Function} config.scroll - 返回滚动元素映射的函数 () => { key: Element }
     */
    const register = (config = {}) => {
        // config.state: { key: ref|reactive }
        // config.scroll: () => ({ main: el, tab1: el })
        // 多滚动区域记录建议使用函数返回元素映射

        // 组件卸载前保存状态
        onBeforeUnmount(() => {
            if (!props.routeId) return;
            const dataToSave = {};

            // 1. 保存普通响应式状态
            if (config.state) {
                for (const [k, v] of Object.entries(config.state)) {
                    dataToSave[k] = unref(v);
                }
            }

            // 2. 保存滚动高度
            if (config.scroll) {
                const scrollMap = {};
                // 如果是函数，执行并获取元素映射
                if (typeof config.scroll === 'function') {
                    const elements = config.scroll();
                    for (const [k, el] of Object.entries(elements)) {
                        if (el) scrollMap[k] = el.scrollTop;
                    }
                }
                // 兼容带 getScrollMap 方法的对象
                else if (config.scroll.getScrollMap) {
                    const elements = config.scroll.getScrollMap();
                    for (const [k, el] of Object.entries(elements)) {
                        if (el) scrollMap[k] = el.scrollTop;
                    }
                }
                dataToSave._scrollMap = scrollMap;
            }

            saveState(dataToSave);
        });

        // 组件挂载时恢复状态
        onMounted(() => {
            restoreState((data) => {
                // 1. 恢复普通响应式状态
                if (config.state) {
                    for (const [k, v] of Object.entries(config.state)) {
                        if (data[k] !== undefined) {
                            if (isRef(v)) {
                                v.value = data[k];
                            } else {
                                // 处理 reactive 对象，使用 Object.assign 覆盖
                                Object.assign(v, data[k]);
                            }
                        }
                    }
                }

                // 2. 恢复滚动高度
                if (config.scroll && data._scrollMap) {
                    // 内部恢复逻辑，支持重试
                    const tryRestore = () => {
                        let elements = {};
                        if (typeof config.scroll === 'function') elements = config.scroll();
                        else if (config.scroll.getScrollMap) elements = config.scroll.getScrollMap();

                        let restoredAny = false;
                        for (const [k, val] of Object.entries(data._scrollMap)) {
                            if (elements[k]) {
                                elements[k].scrollTop = val;
                                restoredAny = true;
                            }
                        }
                        return restoredAny;
                    };

                    // 在下次 DOM 更新后尝试恢复
                    nextTick(() => {
                        if (!tryRestore()) {
                            // 如果立即恢复失败（元素可能还在渲染），100ms 后重试一次
                            setTimeout(tryRestore, 100);
                        }
                    });
                }
            });
        });
    };

    /**
     * 手动保存某个元素的滚动位置
     */
    const saveScroll = (el) => {
        if (!el) return;
        saveState({ [`scroll_${key}`]: el.scrollTop });
    };

    /**
     * 手动恢复某个元素的滚动位置
     */
    const restoreScroll = (el) => {
        if (!el || !props.routeId) return;
        const cache = store.getters.routeCache;
        const stateValues = (cache && cache.value) ? cache.value : (cache || {});
        const data = stateValues[props.routeId];

        if (data && data[`scroll_${key}`]) {
            el.scrollTop = data[`scroll_${key}`];
        }
    };

    return {
        saveState,
        restoreState,
        saveScroll,
        restoreScroll,
        register
    };
}
