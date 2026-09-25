// src/core/login-dialog.js
// 登录弹窗的唯一开关：任意位置都能请求打开，实际渲染由 TopBar 挂载的 LoginDialog 承担。
import { ref } from 'vue';

export const showLoginDialog = ref(false);

export const requestLogin = () => {
    showLoginDialog.value = true;
};
