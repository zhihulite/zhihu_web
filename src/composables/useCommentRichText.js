// src/composables/useCommentRichText.js
// 评论输入区的 @用户 与 URL→链接卡片记账：输入阶段写可见字面量，
// 发送时交给 utils/comment-content.js 换成锚点 HTML。
import { ref, nextTick } from 'vue';
import $http from '@/services/http.js';
import { useAlive } from '@/composables/useAlive.js';
import { findUrlToken, composeCommentContent } from '@/utils/comment-content.js';

/**
 * @param {import('vue').Ref<string>} contentRef 输入区绑定的文本
 * @param {import('vue').Ref<object>} editor 输入区组件实例，字面量经它在光标处落字
 */
export function useCommentRichText(contentRef, editor) {
    const mentions = ref([]);
    const linkCards = ref([]);
    const converting = ref(false);
    const { isAlive, acquireSignal } = useAlive();

    /**
     * @param {number|null} dropAt 触发选人的 '@' 所在偏移，选中后由 @昵称 顶替它
     * 每次选人各记一条：正文里出现几次 @昵称，账本就得有几条，
     * 否则 composeCommentContent 的 replaceOnce 只换掉第一个，剩下的以纯文本发出去
     */
    const addMention = (user, dropAt = null) => {
        if (!user?.id || !user?.name) return;
        mentions.value.push({ id: String(user.id), name: user.name });
        const text = `@${user.name} `;
        if (dropAt === null) editor?.value?.insertText(text);
        else editor?.value?.replaceRange(dropAt, dropAt + 1, text);
        contentRef.value = editor?.value?.text() ?? contentRef.value;
    };

    // 接口异常或非 0 code 时按原始链接兜底
    const fetchLinkInfo = async (url) => {
        try {
            const res = await $http.get(
                `https://api.zhihu.com/content/publish/parse_url?url=${encodeURIComponent(url)}&scene=editor`,
                { signal: acquireSignal() }
            );
            const info = res?.code === 0 ? res?.data?.[url] : null;
            return { title: info?.title || url, iconName: info?.icon_name || '' };
        } catch (e) {
            if (e?.name === 'AbortError') return { title: null, iconName: '' };
            return { title: url, iconName: '' };
        }
    };

    const convertUrlAtCaret = async (el) => {
        if (converting.value || !el?.value) return;
        const caret = el.selectionStart ?? el.value.length;
        if (caret <= 0 || el.value[caret - 1] !== ' ') return;

        const token = findUrlToken(el.value.slice(0, caret));
        if (!token) return;

        converting.value = true;
        try {
            const { title, iconName } = await fetchLinkInfo(token.url);
            if (!title || !isAlive()) return;
            // 请求往返期间用户可能已改动文本，原文不在了就放弃替换
            if (el.value.slice(token.start, token.end) !== token.url) return;

            if (!linkCards.value.some((c) => c.url === token.url)) {
                linkCards.value.push({ url: token.url, title, iconName });
            }
            contentRef.value = el.value.slice(0, token.start) + title + el.value.slice(token.end);

            const pos = token.start + title.length;
            await nextTick();
            el.focus();
            el.setSelectionRange(pos, pos);
        } finally {
            converting.value = false;
        }
    };

    const buildContent = () => composeCommentContent(contentRef.value, mentions.value, linkCards.value);

    const reset = () => {
        mentions.value = [];
        linkCards.value = [];
    };

    return { mentions, linkCards, addMention, convertUrlAtCaret, buildContent, reset };
}
