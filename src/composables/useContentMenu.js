// src/composables/useContentMenu.js
// 详情页弹层菜单公共动作：复制链接 / 分享 / 举报。刷新由各页已有回调承担。
import { f7 } from 'framework7-vue';
import { copyText, shareText } from '@/utils/share.js';
import { openLink } from '@/core/navigation.js';

/**
 * @param {object} opts
 * @param {() => string} opts.url 站外主站链接
 * @param {() => string} [opts.title] 分享面板标题
 * @param {string} opts.reportType 举报内容类型（question/topic/collection…）
 * @param {string} opts.reportId 举报目标 id
 */
export function useContentMenu({ url, title, reportType, reportId }) {
    const copyLink = async () => {
        const ok = await copyText(url());
        f7.toast.show({ text: ok ? '链接已复制到剪贴板' : '复制失败', closeTimeout: 2000 });
    };

    const share = async () => {
        if (await shareText(url(), title?.()) === 'copied') {
            f7.toast.show({ text: '链接已复制到剪贴板', closeTimeout: 2000 });
        }
    };

    const report = () => {
        openLink(`https://www.zhihu.com/report?id=${reportId}&type=${reportType}&source=android&ab_signature=`);
    };

    return { copyLink, share, report };
}
