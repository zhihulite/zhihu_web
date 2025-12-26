if (!typeof GM_xmlhttpRequest === 'function') {
    alert('未检测到油猴（Tampermonkey环境！');
    window.location.href = 'https://greasyfork.org/scripts/508709';
}

import { createApp } from 'vue';
import Framework7 from 'framework7/lite-bundle';
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';
import 'framework7/css/bundle';

// Import Icons and App Custom Styles
import './css/icons.css';
import './css/app.css';

import './style.css';
import App from './App.vue';
import $http from './api/http.js';
import * as zhihuModule from './api/utils/zhihu-module.js';

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

const app = createApp(App);

// Register Framework7 Vue Components
registerComponents(app);
await zhihuModule.initZhihu()
window.$http = $http;
window.$zhihu = zhihuModule;

app.mount('#app');