// src/utils/format.js
// 展示层数值/时间格式化。

/** 计数展示：万以上折算为「x.x万」，否则原样 */
export function formatCount(count) {
    const n = Number(count) || 0;
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return String(n);
}

/** 相对时间：1 小时内按分钟、24 小时内按小时，更早按 MM-DD（跨年带 YYYY）；秒/毫秒时间戳均可 */
export function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const ts0 = Number(timestamp);
    if (!Number.isFinite(ts0)) return '';
    let ts = ts0 > 1e11 ? Math.floor(ts0 / 1000) : ts0;
    const diff = Date.now() / 1000 - ts;
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60 + 0.5);
        return minutes <= 0 ? '刚刚' : `${minutes} 分钟前`;
    }
    if (diff < 86400) return `${Math.floor(diff / 3600 + 0.5)} 小时前`;
    const d = new Date(ts * 1000);
    const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return d.getFullYear() === new Date().getFullYear() ? md : `${d.getFullYear()}-${md}`;
}
