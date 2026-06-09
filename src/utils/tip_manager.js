// 示例获取时间戳 new Date().getTime()
/**
 * 检查指定 ID 的提示是否需要更新（基于时间戳）
 * @param {string} id 提示的唯一标识
 * @param {number|string} timestamp 当前提示的版本时间戳
 * @param {Function} callback 需要执行的各种提示逻辑
 */
export function checkTipVersion(id, timestamp, callback) {
    const storageKey = `zhihu_tip_${id}`;
    const lastTimestamp = localStorage.getItem(storageKey);

    // 如果时间戳不一致（包括第一次为 null 的情况），则执行回调并更新时间戳
    if (lastTimestamp !== String(timestamp)) {
        callback();
        localStorage.setItem(storageKey, timestamp);
    }
}
