// src/composables/useReaction.js
// 赞同 / 喜欢 / 收藏：按资源类型拼 reaction 接口，请求成功后同步标记与计数。
import { unref } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { requireLogin } from '@/composables/userManager.js';

/**
 * @param {import('vue').Ref<object>} target 承载 isUpvoted / isLiked / isFavorited 与 metrics 的响应式对象
 * @param {object} options
 * @param {string} options.type 资源单数名（answer / article / zvideo），用于拼 reaction 与收藏接口
 * @param {string|import('vue').Ref<string>} options.id 资源 id
 * @param {Function} [options.onCollectSwap] 收藏后点「更换」的回调，通常打开收藏夹弹层
 */
export function useReaction(target, options) {
    const resourceId = () => unref(options.id);
    const reactionUrl = (action) => `https://api.zhihu.com/reaction/${options.type}s/${resourceId()}/${action}`;
    const collectionUrl = () => `https://api.zhihu.com/collections/contents/${options.type}/${resourceId()}`;

    // 请求成功才改动本地标记与计数，失败保持原状
    // 在途期间短路后续点击：请求未回时再点会读到老状态，两次请求只记一笔却被本地加两次
    let pending = false;
    const toggle = async ({ flag, count, on, off, onToggled }) => {
        const data = target.value;
        if (!data || pending) return;
        if (!requireLogin()) return;

        pending = true;
        const isActive = data[flag] === true;
        try {
            await (isActive ? off() : on());
            data[flag] = !isActive;
            data.metrics[count] += isActive ? -1 : 1;
            onToggled?.(!isActive);
        } catch (e) {
            console.error(`${options.name || options.type}操作失败`, e);
            f7.toast.show({ text: '操作失败，请重试', closeTimeout: 1500 });
        } finally {
            pending = false;
        }
    };

    const toggleVote = () => toggle({
        flag: 'isUpvoted',
        count: 'votes',
        on: () => $http.post(reactionUrl('vote/up')),
        off: () => $http.delete(reactionUrl('vote/up')),
    });

    const toggleLike = () => toggle({
        flag: 'isLiked',
        count: 'likes',
        on: () => $http.post(reactionUrl('like')),
        off: () => $http.delete(reactionUrl('like')),
    });

    const toggleFavorite = () => toggle({
        flag: 'isFavorited',
        count: 'favorites',
        on: () => $http.post(collectionUrl(), null, { encryptHead: true }),
        off: () => $http.delete(`${collectionUrl()}?failed_multi=1`, { encryptHead: true }),
        onToggled: (isFavorited) => {
            if (!isFavorited) {
                f7.toast.show({ text: '已取消收藏' });
                return;
            }
            f7.toast.show({
                text: '已收藏至默认收藏夹',
                closeButton: true,
                closeButtonText: '更换',
                on: {
                    closeButtonClick() {
                        options.onCollectSwap?.();
                    },
                },
            });
        },
    });

    // 收藏夹弹层操作完成后同步标记与计数，不再发请求
    const onCollectionSuccess = (isFavorited) => {
        const data = target.value;
        if (!data || isFavorited === data.isFavorited) return;
        data.isFavorited = isFavorited;
        data.metrics.favorites += isFavorited ? 1 : -1;
    };

    return { toggleVote, toggleLike, toggleFavorite, onCollectionSuccess };
}
