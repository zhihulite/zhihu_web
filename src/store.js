import { createStore } from 'framework7';
import { f7 } from 'framework7-vue';

const store = createStore({
    state: {
        routeCache: {},
    },
    getters: {
        routeCache({ state }) {
            return state.routeCache;
        }
    },
    actions: {
        saveRouteCache({ state }, { routeId, data }) {
            if (!routeId) return;
            const existing = state.routeCache[routeId] || {};
            state.routeCache = {
                ...state.routeCache,
                [routeId]: { ...existing, ...data }
            };
        },
        getRouteCache({ state }, routeId) {
            return state.routeCache[routeId];
        },
        deleteRouteCache({ state }, routeId) {
            const newCache = { ...state.routeCache };
            delete newCache[routeId];
            state.routeCache = newCache;
        },
        pruneRouteCache({ state }, activerouteIds) {
            const newCache = {};
            Object.keys(state.routeCache).forEach(routeId => {
                if (activerouteIds.includes(routeId)) {
                    newCache[routeId] = state.routeCache[routeId];
                }
            });
            state.routeCache = newCache;
        },
    },
});

setTimeout(() => {
    const propsHistory = f7?.views?.main?.router?.propsHistory;
    if (!propsHistory) return;
    const originalPop = propsHistory.pop;
    propsHistory.pop = function () {
        const lastItem = this[this.length - 1];
        const routeId = lastItem?.routeId;
        const result = originalPop.apply(this, arguments);
        if (routeId && store) store.dispatch('deleteRouteCache', routeId);
        console.log(`已删除 routeId 为 ${routeId} 的路由缓存`);
        return result;
    };
}, 1000);

export default store;
