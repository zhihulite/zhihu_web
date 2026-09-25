import { ref, computed, reactive } from 'vue';
import { f7 } from 'framework7-vue';
import { tokenManager } from '@/services/auth.js';
import $http from '@/services/http.js';

// 创建响应式状态
const state = reactive({
  currentUser: null,
  isLoading: false,
  isLoggedIn: !!(tokenManager.getAccessToken() && !tokenManager.isGuest)
});

// 组件间通信
const events = {
  subscribers: {},
  on(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    return () => this.off(event, callback); // 返回取消订阅函数
  },
  off(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    }
  },
  emit(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(callback => callback(data));
    }
  }
};

// 计算属性
const isLoggedIn = computed(() => {
  return state.isLoggedIn;
});

/** 操作类请求的前置守卫：未登录提示并拒绝 */
export function requireLogin() {
  if (state.isLoggedIn) return true;
  f7.toast.show({ text: '请登录后使用' });
  return false;
}

// 刷新用户数据
async function refreshUser() {
  state.isLoggedIn = !!(tokenManager.getAccessToken() && !tokenManager.isGuest);

  if (!state.isLoggedIn) {
    state.currentUser = null;
    events.emit('user:updated', null);
    return null;
  }

  state.isLoading = true;
  try {
    const userData = await $http.get("https://api.zhihu.com/me");
    state.currentUser = userData;
    events.emit('user:updated', userData); // 通知订阅者数据已更新
    return userData;
  } catch (e) {
    console.error('Failed to refresh user data:', e);
    state.currentUser = null;
    events.emit('user:error', e);
    return null;
  } finally {
    state.isLoading = false;
  }
}

// 通用的刷新hook - 可以用于任何需要刷新数据的组件
export function useRefreshData(refreshFn) {
  const isRefreshing = ref(false);

  const refresh = async (...args) => {
    isRefreshing.value = true;
    try {
      const result = await refreshFn(...args);
      return result;
    } catch (error) {
      console.error('Data refresh failed:', error);
      throw error;
    } finally {
      isRefreshing.value = false;
    }
  };

  return {
    refresh,
    isRefreshing
  };
}

export function useUser() {
  // 使用通用refresh hook处理刷新逻辑
  const { refresh: refreshUserData, isRefreshing } = useRefreshData(refreshUser);

  const onUserUpdate = (callback) => events.on('user:updated', callback);

  return {
    currentUser: computed(() => state.currentUser),
    isLoading: computed(() => state.isLoading),
    isLoggedIn,
    isRefreshing,
    refreshUser: refreshUserData,
    onUserUpdate
  };
}

export default {
  state,
  isLoggedIn,
  refreshUser,
  events,
  useRefreshData,
  useUser
};
