// src/services/scroll-store.js
// 阅读位置持久化：按页面 URL 记住滚动偏移，供跨重启回到上次的阅读处；条目 10 天后失效。
import { KEYS, getJSON, setJSON } from '@/services/storage.js';

const EXPIRE_MS = 10 * 24 * 60 * 60 * 1000;

let entries = null;

function store() {
    if (entries) return entries;
    const raw = getJSON(KEYS.scrollPositions, {});
    const now = Date.now();
    entries = {};
    if (raw && typeof raw === 'object') {
        Object.entries(raw).forEach(([url, hit]) => {
            if (hit && typeof hit.position === 'number' && now - (hit.timestamp || 0) < EXPIRE_MS) {
                entries[url] = hit;
            }
        });
    }
    return entries;
}

/** 该 URL 的上次阅读位置，无记录返回 0 */
export function getScrollPosition(url) {
    if (!url) return 0;
    return store()[url]?.position || 0;
}

/** 记下该 URL 的滚动偏移 */
export function setScrollPosition(url, position) {
    if (!url) return;
    const all = store();
    all[url] = { position, timestamp: Date.now() };
    setJSON(KEYS.scrollPositions, all);
}

/** 丢弃该 URL 的记录（等待渲染超时等定位不到的情况） */
export function clearScrollPosition(url) {
    if (!url) return;
    const all = store();
    if (!(url in all)) return;
    delete all[url];
    setJSON(KEYS.scrollPositions, all);
}
