// src/services/feed-dedup.js
// 推荐流去重：记录已展示条目的 type:id，过滤掉后续重复项，落盘 localStorage。
import { KEYS, getJSON, setJSON } from '@/services/storage.js';

let cache = (() => {
    const arr = getJSON(KEYS.dedup, []);
    return Array.isArray(arr) ? arr : [];
})();
let flushTimer = null;

// 合并落盘：一页解析会连续追加多条键，攒到下一个 tick 只写一次
function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
        flushTimer = null;
        setJSON(KEYS.dedup, cache);
    }, 0);
}

const seen = new Set(cache);

function keyOf(item) {
    return item && item.id != null ? `${item.type || ''}:${item.id}` : null;
}

/**
 * 过滤已展示过的条目，并把留下的记入窗口。
 * @param {object} item 带 type/id 的条目
 * @param {number} limit 窗口条数，0 为关闭去重
 */
export function dedupFilter(item, limit = 0) {
    const key = keyOf(item);
    if (!key || !(limit > 0)) return true;
    if (seen.has(key)) return false;

    seen.add(key);
    cache.push(key);
    if (cache.length > limit) {
        const removed = cache.splice(0, cache.length - limit);
        removed.forEach((k) => seen.delete(k));
    }
    scheduleFlush();
    return true;
}

/**
 * 清空去重窗口。整表重取（下拉刷新、切栏目）前调用：
 * 接口重复回同一批内容时，否则整页都会被判成"已展示"，列表直接被刷空。
 */
export function resetDedup() {
    cache.length = 0;
    seen.clear();
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    setJSON(KEYS.dedup, []);
}
