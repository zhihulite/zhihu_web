if (typeof GM_xmlhttpRequest !== 'function') {
    // native alert 会挂住主线程（自动化读不到这个弹窗，页面看起来像卡死），开发期直接抛错
    if (import.meta.env.DEV) {
        throw new Error('缺少 GM_xmlhttpRequest：请用 __dev/harness.html（桩）或 __dev/proxy.html（反代）打开');
    }
    alert('未检测到GM_xmlhttpRequest！请检查是否已安装插件并安装脚本');
    window.location.replace('https://scriptcat.org/script-show-page/5149');
}

import { createApp } from 'vue';
import Framework7 from 'framework7/lite-bundle';
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';
import 'framework7/css/bundle';

// Import Icons and App Custom Styles
import './css/icons.css';
import './css/app.css';

import './style.css';
import { register as registerSwiper } from 'swiper/element/bundle';
import App from '@/App.vue';
import * as zhihuModule from '@/services/zhihu/module.js';
import { handleCardClick, openLink } from '@/core/navigation.js';

// swiper-container / swiper-slide 是自定义元素，须注册后才渲染（图集轮播）
registerSwiper();

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

const app = createApp(App);

// Register Framework7 Vue Components
registerComponents(app);
await zhihuModule.initZhihu()

// 卡片跳转与外链的路由解析在 @/core/navigation.js，此处只做全局注入
window.$openLink = openLink;
app.config.globalProperties.$openLink = openLink;
window.$handleCardClick = handleCardClick;
app.config.globalProperties.$handleCardClick = handleCardClick;

app.mount('#app');