// src/services/negative-feedback.js
// 推荐流负反馈：拉取「不感兴趣」面板并回传选项。
import $http from '@/services/http.js';

const PANEL_URL = 'https://api.zhihu.com/negative-feedback/panel';

/**
 * 拉取某条内容的负反馈选项。
 * @returns {Promise<Array<{label:string,toast:string,backendUrl:string|null,intentUrl:string|null}>>}
 */
export async function fetchDislikeOptions(type, id) {
    const url = `${PANEL_URL}?scene_code=RECOMMEND&content_type=${type}&content_token=${id}`;
    const res = await $http.get(url);
    const items = res?.data?.items || [];
    return items
        .map((v) => v.raw_button)
        .filter((b) => b && b.text && b.action)
        .map((b) => ({
            label: b.text.panel_text,
            toast: b.text.toast_text || '操作成功',
            backendUrl: b.action.backend_url || null,
            intentUrl: b.action.intent_url || null,
        }));
}

/** 回传负反馈选项，返回是否成功 */
export async function submitDislike(backendUrl) {
    try {
        await $http.post(backendUrl, '', { encryptHead: true, encryptBody: false });
        return true;
    } catch (e) {
        return false;
    }
}
