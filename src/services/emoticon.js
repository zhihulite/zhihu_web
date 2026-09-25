// src/services/emoticon.js
// 表情包：懒加载知乎 emoticon 库，把文本里的 [名称] 占位符映射为表情图 URL。
// 库地址由使用者指定，加载后挂在 window.zh_emoticon（groups → stickers），只取第一组（默认）。
import { ref } from 'vue';

const LIB_URL = 'https://unpkg.zhimg.com/@cfe/emoticon@1.5.0/lib/emoticon.js';

/** placeholder（"[感谢]"）→ 图片 URL，加载完成后填充；为响应式，供模板自动重渲染 */
export const emoticonMap = ref({});
/** 面板与映射共用的表情清单 */
export const emoticonStickers = ref([]);

let loading = null;

/** 懒加载表情库并构建映射；重复调用共用同一个 Promise */
export function loadEmoticons() {
    if (loading) return loading;

    loading = new Promise((resolve) => {
        if (window.zh_emoticon) {
            build();
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = LIB_URL;
        script.onload = () => {
            build();
            resolve();
        };
        script.onerror = () => {
            console.warn('表情包库加载失败');
            resolve();
        };
        document.head.appendChild(script);
    });

    function build() {
        // 只取第一组：两组里有同名占位符而图不同（[感谢]/[哇]/[蹲]），
        // 混用会让面板点出来的表情在框里与评论区画成另一套图
        const stickers = (window.zh_emoticon || [])[0]?.stickers || [];
        const map = {};
        stickers.forEach((s) => {
            if (s.placeholder && s.static_image_url) map[s.placeholder] = s.static_image_url;
        });
        emoticonStickers.value = stickers;
        emoticonMap.value = map;
    }

    return loading;
}

/**
 * 把 HTML 文本里的 [名称] 占位符替换为表情 <img>。读响应式 emoticonMap，
 * 库懒加载完成后在模板里调用会自动重渲染。未识别的占位符原样保留。
 */
export function injectEmoticons(html) {
    if (typeof html !== 'string') return html;
    const map = emoticonMap.value;
    if (!map || Object.keys(map).length === 0) return html;
    return html.replace(/\[[^\]]{1,12}\]/g, (token) => {
        const url = map[token];
        return url
            ? `<img class="emoticon-img" src="${url}" alt="${token}" />`
            : token;
    });
}


/**
 * 把文本切成片段，供输入区与预览逐段渲染：
 * { type:'text'|'emoticon'|'token', value|url, name, kind }。
 * 未识别的 [xxx] 原样作为文本保留；tokens 是账本里的字面量（@昵称 / 链接标题），
 * 按给定顺序各消耗一次出现，命中即成一段，段内不再切表情。
 */
export function tokenizeEmoticons(text, map = emoticonMap.value, tokens = []) {
    if (!text) return [];
    const parts = [];
    const tokenAt = /\[[^\]]{1,12}\]/y;
    let last = 0;
    let i = 0;
    const flush = (end) => {
        if (end > last) parts.push({ type: 'text', value: text.slice(last, end) });
    };
    while (i < text.length) {
        const hit = tokens.find((t) => t.text && (t.used || 0) < t.count
            && text.startsWith(t.text, i));
        if (hit) {
            hit.used = (hit.used || 0) + 1;
            flush(i);
            parts.push({ type: 'token', value: hit.text, kind: hit.kind });
            i += hit.text.length;
            last = i;
            continue;
        }
        tokenAt.lastIndex = i;
        const m = tokenAt.exec(text);
        const url = m && map[m[0]];
        if (url) {
            flush(i);
            parts.push({ type: 'emoticon', url, name: m[0] });
            i += m[0].length;
            last = i;
            continue;
        }
        i += 1;
    }
    flush(text.length);
    return parts;
}
