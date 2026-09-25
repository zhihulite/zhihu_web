// src/composables/useResource.js
// 单资源请求生命周期：加载/错误/重载 + 卸载后不写状态。
// 列表侧对应 usePagedList。
import { ref } from 'vue';
import { useAlive } from '@/composables/useAlive.js';

/**
 * @param {import('vue').computed|(() => Promise<any>)} fetchResource 取原始资源；接收随卸载 abort 的 signal
 * @param {object} [options]
 * @param {(raw:any) => any} [options.transform] 原始资源 → 视图模型
 * @param {(e:Error) => void} [options.onError] 失败回调，缺省 console.error
 */
export function useResource(fetchResource, options = {}) {
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const { isAlive, acquireSignal } = useAlive();

    const reload = async () => {
        loading.value = true;
        error.value = null;
        try {
            const raw = await fetchResource(acquireSignal());
            if (!isAlive()) return;
            data.value = options.transform ? options.transform(raw) : raw;
        } catch (e) {
            if (!isAlive()) return;
            error.value = e;
            if (options.onError) options.onError(e);
            else console.error('资源加载失败', e);
        } finally {
            if (isAlive()) loading.value = false;
        }
    };

    return { data, loading, error, reload };
}
