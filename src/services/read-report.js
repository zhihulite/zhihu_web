// src/services/read-report.js
// 推荐流已读上报：把条目自带的 brief 回给知乎 lastread 接口，服务端据此标记已读并调整后续推荐。
import $http from '@/services/http.js';
import { tokenManager } from '@/services/auth.js';

const READ_URL = 'https://api.zhihu.com/lastread/touch/v2';

/**
 * @param {string|object} brief 推荐接口随条目下发的已读凭证，缺失或游客态时跳过
 */
export async function reportRead(brief) {
    if (!brief || !tokenManager.isLogin()) return;
    const payload = typeof brief === 'string' ? brief : JSON.stringify(brief);
    try {
        await $http.post(READ_URL, `targets=${encodeURIComponent(`[["r",${payload}]]`)}`, {
            encryptHead: true,
            encryptBody: false,
        });
    } catch (e) {
        console.warn('已读上报失败', e);
    }
}
