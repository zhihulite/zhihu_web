// src/utils/share.js
// 分享 / 复制：优先系统分享面板与剪贴板 API，回退 execCommand 复制。

function legacyCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch (e) {
        ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
}

/** 复制到剪贴板，返回是否成功 */
export async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (e) {
        // 剪贴板 API 被拒时落到 execCommand 回退
    }
    return legacyCopy(text);
}

/**
 * 分享文本：支持 Web Share API 时调起系统面板，否则复制到剪贴板。
 * @returns {Promise<'shared'|'copied'|false>} shared 面板完成，copied 复制兜底成功，false 取消或失败
 */
export async function shareText(text, title) {
    if (navigator.share) {
        try {
            await navigator.share({ title, text });
            return 'shared';
        } catch (e) {
            // 用户取消面板不再回退复制，其余失败落到复制
            if (e && e.name === 'AbortError') return false;
        }
    }
    return (await copyText(text)) ? 'copied' : false;
}

/**
 * 分享文件（图片等）：需要浏览器支持 Web Share Level 2 的文件类型。
 * @param {File} file 待分享文件
 * @param {{title?: string, url?: string}} [meta] 面板标题与附带链接
 * @returns {Promise<'shared'|'cancelled'|'unsupported'>}
 */
export async function shareFile(file, { title, url } = {}) {
    const data = { files: [file], title };
    if (url) data.url = url;
    if (!navigator.canShare || !navigator.canShare(data)) return 'unsupported';
    try {
        await navigator.share(data);
        return 'shared';
    } catch (e) {
        return e && e.name === 'AbortError' ? 'cancelled' : 'unsupported';
    }
}

/** 触发浏览器下载并回收 object URL */
export function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    // Safari 在 click 之后才异步取 blob，同步撤销会得到 0 字节或干脆不下载
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}
