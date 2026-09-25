// src/services/storage.js
// localStorage 统一读写：JSON 容错 + 键名单点维护。
// 键值即线上数据格式，改名等于丢数据，只在此处集中定义。

export const KEYS = {
    settings: 'app_settings',
    history: 'zhihu_lite_history',
    dedup: 'recommend_history',
    theme: 'theme_config',
    searchHistory: 'searchHistory',
    auth: 'zhihu_auth',
    udid: 'zhihu_udid',
    zsts: 'zhihu_zsts',
    msid: 'zhihu_msid',
    appVersion: 'app_version',
    homeTabs: 'home_tabs_config',
    scrollPositions: 'scroll_positions',
    savedContent: 'saved_content',
};

// 提示版本号存储用前缀 + 动态 id，不进 KEYS 常量表
export const TIP_KEY_PREFIX = 'zhihu_tip_';

// 本地存档正文按条目一个键，索引只留列表页要显示的少量字段
export const SAVED_KEY_PREFIX = 'zhihu_saved_';

export function getString(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function setString(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error(`存储写入失败: ${key}`, e);
    }
}

export function removeKeys(...keys) {
    keys.forEach((k) => {
        try {
            localStorage.removeItem(k);
        } catch (e) {
            console.error(`存储删除失败: ${k}`, e);
        }
    });
}

/** 读 JSON，缺失或解析失败回 fallback（数组/对象默认值由调用方给新实例） */
export function getJSON(key, fallback = null) {
    const raw = getString(key);
    if (raw === null) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function setJSON(key, value) {
    try {
        setString(key, JSON.stringify(value));
    } catch (e) {
        console.error(`存储序列化失败: ${key}`, e);
    }
}

/** 写入并报告成败：配额满或序列化失败返回 false，供需要给用户回执的调用方判断 */
export function trySetJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/** 按前缀列出在用的键，清空一整族数据时用 */
export function keysWithPrefix(prefix) {
    const found = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(prefix)) found.push(k);
        }
    } catch {
        return found;
    }
    return found;
}
