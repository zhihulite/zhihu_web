// src/composables/useBlockToggle.js
// 屏蔽 / 解除屏蔽用户（/settings/blocked_users）。
import { ref } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { requireLogin } from '@/composables/userManager.js';

const BASE = 'https://api.zhihu.com/settings/blocked_users';

/** 直接按 id 屏蔽 */
export async function blockUser(userId) {
    await $http.post(BASE, `people_id=${userId}`, { encryptHead: true, encryptBody: false });
}

/** 直接按 id 解除屏蔽 */
export async function unblockUser(userId) {
    await $http.delete(`${BASE}/${userId}`, { encryptHead: true });
}

/**
 * @param {() => {id:string, isBlocked?:boolean}} getTarget 读目标用户
 * @param {(blocked:boolean)=>void} setBlocked 写屏蔽态
 */
export function useBlockToggle(getTarget, setBlocked) {
    const loading = ref(false);

    const run = async (id, shouldBlock) => {
        loading.value = true;
        try {
            if (shouldBlock) {
                await blockUser(id);
                setBlocked(true);
                f7.toast.show({ text: '已屏蔽' });
            } else {
                await unblockUser(id);
                setBlocked(false);
                f7.toast.show({ text: '已解除屏蔽' });
            }
        } catch (e) {
            console.error('屏蔽操作失败', e);
            f7.toast.show({ text: '操作失败' });
        } finally {
            loading.value = false;
        }
    };

    const toggle = () => {
        if (loading.value) return;
        if (!requireLogin()) return;
        const target = getTarget();
        if (!target?.id) return;

        const shouldBlock = !target.isBlocked;
        f7.dialog.confirm(
            shouldBlock ? '确定要拉黑该用户吗？' : '确定要取消拉黑该用户吗？',
            shouldBlock ? '拉黑用户' : '取消拉黑',
            () => run(target.id, shouldBlock)
        );
    };

    return { loading, toggle };
}
