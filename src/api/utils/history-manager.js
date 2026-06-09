
import { f7 } from 'framework7-vue';

// 内部缓存存储
// 使用 Map 存储页面数据，key 为 "path::index"
const pageCache = new Map();

export const HistoryUtils = {
    // 生成唯一路由ID
    createRouteUid() {
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    },

    // 获取当前路由
    getCurrentRoute() {
        const view = f7.views.main;
        return view ? view.router.currentRoute : null;
    },

    // 获取历史记录列表
    getHistory() {
        const view = f7.views.main;
        return view ? view.router.history : [];
    },

    // 获取指定路径在历史记录中的最后一个位置（偏移量）
    getLastPathIndex(path) {
        const history = this.getHistory();
        if (!history || history.length === 0) return -1;
        
        // 从后往前查找
        for (let i = history.length - 1; i >= 0; i--) {
            // history[i] 可能是字符串路径或对象，取决于 push 的方式，通常是 path 字符串
            const item = history[i];
            const itemPath = typeof item === 'string' ? item : item?.path;
            
            if (itemPath === path) {
                return i;
            }
        }
        return -1;
    },

    // 生成缓存Key
    getCacheKey(path, offset) {
        return `${path}::${offset}`;
    },

    // 从缓存获取数据
    getFromCache(path, offset) {
        const key = this.getCacheKey(path, offset);
        return pageCache.get(key);
    },

    // 保存数据到缓存
    saveToCache(path, offset, data) {
        const key = this.getCacheKey(path, offset);
        pageCache.set(key, data);
        console.log(`[HistoryManager] Saved to cache: ${key}`, data);
    },

    // 删除缓存
    deleteFromCache(path, offset) {
        const key = this.getCacheKey(path, offset);
        if (pageCache.has(key)) {
            pageCache.delete(key);
            console.log(`[HistoryManager] Deleted from cache: ${key}`);
        }
    },

    // 清理无效缓存 (当路由销毁时调用)
    cleanupCache() {
        const history = this.getHistory();
        const validKeys = new Set();
        
        // 构建当前所有有效的 key
        history.forEach((item, index) => {
            const path = typeof item === 'string' ? item : item?.path;
            if (path) {
                validKeys.add(this.getCacheKey(path, index));
            }
        });

        // 遍历缓存，删除不在 history 中的条目
        for (const key of pageCache.keys()) {
            if (!validKeys.has(key)) {
                pageCache.delete(key);
                console.log(`[HistoryManager] Cleaned up stale cache: ${key}`);
            }
        }
    },
    
    // 初始化监听
    setup(router) {
        if (!router) return;

        // 监听路由变化，添加 UID
        router.on('routeChange', (newRoute) => {
            if (!newRoute.params.__uid) {
                newRoute.params.__uid = this.createRouteUid();
            }
            // 路由变化时，清理无效缓存
            // 延迟一点执行以确保 history 已更新
            setTimeout(() => {
                this.cleanupCache();
            }, 100);
        });

        // 监听页面销毁 (Backup strategy)
        router.on('pageBeforeRemove', (page) => {
             // 页面移除时也可以尝试清理
             setTimeout(() => {
                this.cleanupCache();
            }, 0);
        });
        
        console.log('[HistoryManager] Initialized');
    }
};
