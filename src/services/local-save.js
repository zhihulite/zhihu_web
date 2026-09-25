// src/services/local-save.js
// 正文本地存档：分段与少量元数据落 localStorage，配图分段不入档。
// 索引（saved_content）只放列表页要显示的字段，正文按条目单独成键。
import {
    KEYS,
    SAVED_KEY_PREFIX,
    getJSON,
    setJSON,
    removeKeys,
    trySetJSON,
    keysWithPrefix,
} from '@/services/storage.js';

const IMAGE_SEGMENT_TYPE = 'image';

const entryKey = (type, id) => `${type}_${String(id)}`;
const contentKey = (type, id) => `${SAVED_KEY_PREFIX}${entryKey(type, id)}`;

const sameEntry = (entry, type, id) => entry.type === type && String(entry.id) === String(id);

// 只有配图没有文字的分段集合不值得入档
const keepSegments = (segments) => (segments || []).filter((seg) => seg?.type !== IMAGE_SEGMENT_TYPE);

export function listSaved() {
    const entries = getJSON(KEYS.savedContent, []);
    return Array.isArray(entries) ? entries : [];
}

/**
 * 保存一条正文。图片分段整段丢弃，其余分段原样入档（段落里的行内图片只是 URL，不落字节）。
 * @returns {{ok: boolean, reason?: 'empty'|'quota', record?: object}}
 */
export function saveContent({ type, id, title, authorName, questionID, segments }) {
    const kept = keepSegments(segments);
    if (!kept.length) return { ok: false, reason: 'empty' };

    const savedAt = Date.now();
    const droppedImages = (segments?.length || 0) - kept.length;
    const record = {
        type,
        id: String(id),
        title: title || '无标题',
        authorName: authorName || '匿名用户',
        questionID: questionID || null,
        savedAt,
        droppedImages,
        segments: kept.map((seg, index) => ({ ...seg, _index: index })),
    };

    if (!trySetJSON(contentKey(type, id), record)) return { ok: false, reason: 'quota' };

    const entry = {
        type,
        id: record.id,
        title: record.title,
        authorName: record.authorName,
        savedAt,
        segCount: kept.length,
        droppedImages,
    };
    const rest = listSaved().filter((e) => !sameEntry(e, type, id));
    setJSON(KEYS.savedContent, [entry, ...rest]);
    return { ok: true, record };
}

export function getSaved(type, id) {
    const record = getJSON(contentKey(type, id), null);
    return record && Array.isArray(record.segments) ? record : null;
}

/** 删一条，返回删除后剩下的索引 */
export function removeSaved(type, id) {
    const rest = listSaved().filter((e) => !sameEntry(e, type, id));
    setJSON(KEYS.savedContent, rest);
    removeKeys(contentKey(type, id));
    return rest;
}

export function clearSaved() {
    // 键名前缀扫描为准，索引里记着的条目再补一遍：
    // 两处取并集才能兼顾索引写入失败留下的野键，以及枚举不可用的存储实现
    const keys = new Set(keysWithPrefix(SAVED_KEY_PREFIX));
    listSaved().forEach((entry) => keys.add(contentKey(entry.type, entry.id)));
    removeKeys(...keys);
    setJSON(KEYS.savedContent, []);
}
