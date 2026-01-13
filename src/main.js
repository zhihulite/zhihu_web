if (typeof GM_xmlhttpRequest !== 'function') {
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

const $openLink = function (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
}
window.$openLink = $openLink
app.config.globalProperties.$openLink = $openLink

const $handleCardClick = (f7router, item) => {
    const { type, id } = item;

    switch (type) {
        case "question":
            f7router.navigate(`/question/${id}`);
            break;
        case "people":
            f7router.navigate(`/user/${id}`);
            break;
        case "zvideo":
            f7router.navigate(`/video/${id}`);
            break;
        case 'column':
            f7router.navigate(`/column-items/${item.id}`);
            break;
        case "topic":
            f7router.navigate(`/topic/${id}`);
            break;
        case "collection":
            f7router.navigate(`/collection/${id}`);
            break;
        case 'roundtable':
            $openLink(`https://www.zhihu.com/roundtable/${item.id}`);
            break;
        case 'special':
            $openLink(`https://www.zhihu.com/special/${item.id}`);
            break;
        case 'browser':
            $openLink(id);
            break;
        default:
            f7router.navigate(`/article/${type}/${id}`);
            break;
    }
};

window.$handleCardClick = $handleCardClick
app.config.globalProperties.$handleCardClick = $handleCardClick

app.mount('#app');