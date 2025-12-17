if (!typeof GM_xmlhttpRequest === 'function') {
    alert('未检测到油猴（Tampermonkey环境！');
    window.location.href = 'https://greasyfork.org/scripts/508709';
}

import { createApp } from 'vue'
import 'sober' //引入所有组件
import './style.css'
import App from './App.vue'

import router from './router'

import http, { initZhihu, getZhihuInstance } from '@/api/http.js';
// 每次打开网页时尝试更新用户数据
await initZhihu();
window.$http = http;
window.$zhihu = getZhihuInstance();

createApp(App).use(router).mount('#app')