// src/utils/comment-content.js
// 评论正文的纯文本↔锚点换算：@用户 与 URL→链接卡片在提交时要写成知乎评论接受的锚点 HTML。
// 纯函数、无依赖，可单独验证。

// URL 匹配：协议可选，末尾遇空白或串尾截断
export const URL_PATTERN = /((?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+[\/#?]?.*?)(?=\s|$)/gi;

export const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * 取光标前文本里最后一个 URL，且该 URL 必须正好结束在光标前一位（即刚敲下结尾空格）。
 * @returns {{url:string,start:number,end:number}|null}
 */
export function findUrlToken(before) {
    let last = null;
    for (const match of before.matchAll(URL_PATTERN)) {
        last = { url: match[1], start: match.index, end: match.index + match[1].length };
    }
    return last && last.end === before.length - 1 ? last : null;
}

const replaceOnce = (text, needle, html) => {
    if (!needle) return text;
    const index = text.indexOf(needle);
    return index === -1 ? text : text.slice(0, index) + html + text.slice(index + needle.length);
};

export const mentionHtml = ({ id, name }) =>
    `<a data-hash="${escapeHtml(id)}" href="/people/${escapeHtml(id)}" class="member_mention">@${escapeHtml(name)} </a>`;

export const linkCardHtml = ({ url, title, iconName }) => {
    const icon = iconName ? ` data-icon-name="${escapeHtml(iconName)}"` : '';
    const safeTitle = escapeHtml(title);
    return `<a href="${escapeHtml(url)}" data-insert-way="url" data-draft-type="text-link"${icon} data-draft-title="${safeTitle}">${safeTitle}</a>`;
};

/**
 * 附带图片的锚点。宽高缺省时上送 0，由知乎侧自行排版。
 */
export const imageAnchorHtml = ({ url, isGif, width = 0, height = 0 }) => {
    const cls = isGif ? 'comment_gif' : 'comment_img';
    const label = isGif ? '查看动图' : '查看图片';
    return `<a href="${escapeHtml(url)}" class="${cls}" data-width="${Number(width) || 0}" data-height="${Number(height) || 0}">${label}</a>`;
};

/**
 * 输入框里的字面量 → 提交用的评论正文。
 * 评论列表按 HTML 渲染，故先整体转义再替换锚点，正文里的标签不会漏进 DOM；
 * 锚点自身已在各自函数内转义，needle 也按转义后的形态匹配。
 */
export function composeCommentContent(text, mentions = [], linkCards = []) {
    let out = escapeHtml(text);
    for (const mention of mentions) {
        out = replaceOnce(out, escapeHtml(`@${mention.name} `), mentionHtml(mention));
    }
    for (const card of linkCards) {
        out = replaceOnce(out, escapeHtml(card.title), linkCardHtml(card));
    }
    return out;
}
