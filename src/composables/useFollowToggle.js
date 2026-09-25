// src/composables/useFollowToggle.js
// 关注 / 取消关注：请求成功后翻转关注标记，可选同步关注数与 toast。
import { ref, unref } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { useUser, requireLogin } from '@/composables/userManager.js';

const FOLLOW_BASE = 'https://api.zhihu.com/people';

/** 关注用户 */
export async function followUser(userId) {
    await $http.post(`${FOLLOW_BASE}/${userId}/followers`, '', { encryptHead: true, encryptBody: false });
}

/** 取关用户：知乎取关接口在 url 尾拼当前用户 id */
export async function unfollowUser(userId, selfId = 'self') {
    await $http.delete(`${FOLLOW_BASE}/${userId}/followers/${selfId}`, { encryptHead: true });
}

/**
 * @param {object} options
 * @param {string|import('vue').Ref<string>|(() => string)} options.url followers 接口基址
 * @param {() => boolean} options.isFollowing 读当前关注态
 * @param {(v:boolean) => void} options.setFollowing 写关注态
 * @param {boolean} [options.deleteWithUserId] 取关是否在 url 后拼当前用户 id
 * @param {boolean} [options.encryptHead] 请求是否加密头
 * @param {string} [options.postBody] 关注请求体，默认无
 * @param {() => number} [options.followerCount] 读关注数（提供则自动 ±1）
 * @param {(n:number) => void} [options.setFollowerCount] 写关注数
 * @param {[string,string]} [options.toast] [关注提示, 取关提示]，提供则弹 toast
 */
export function useFollowToggle(options) {
    const { currentUser } = useUser();
    const loading = ref(false);
    const baseUrl = () => {
        const u = unref(options.url);
        return typeof u === 'function' ? u() : u;
    };
    const reqOpts = options.encryptHead ? { encryptHead: true } : undefined;

    const toggle = async () => {
        if (loading.value) return;
        if (!requireLogin()) return;
        loading.value = true;

        const wasFollowing = options.isFollowing();
        try {
            if (!wasFollowing) {
                await $http.post(baseUrl(), options.postBody ?? undefined, reqOpts);
            } else {
                const url = options.deleteWithUserId
                    ? `${baseUrl()}/${currentUser.value?.id || 'self'}`
                    : baseUrl();
                await $http.delete(url, reqOpts);
            }

            options.setFollowing(!wasFollowing);

            if (options.followerCount) {
                const n = options.followerCount();
                options.setFollowerCount(wasFollowing ? Math.max(0, n - 1) : n + 1);
            }
            if (options.toast) {
                f7.toast.show({ text: wasFollowing ? options.toast[1] : options.toast[0] });
            }
        } catch (e) {
            console.error('关注操作失败', e);
            if (options.toast) f7.toast.show({ text: '操作失败' });
        } finally {
            loading.value = false;
        }
    };

    return { loading, toggle };
}
