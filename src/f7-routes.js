import { f7 } from 'framework7-vue';
import userManager from './composables/userManager';

import HomeView from './components/home/HomeView.vue';
import FollowingView from './components/home/FollowingView.vue';
import CollectionsView from './components/home/CollectionsView.vue';
import DailyView from './components/home/DailyView.vue';
import HistoryView from './components/home/HistoryView.vue';
import SettingsView from './components/SettingsView.vue';
import SearchPage from './components/SearchPage.vue';
import ArticleDetail from './components/ArticleDetail.vue';
import UserProfile from './components/UserProfile.vue';
import QuestionDetail from './components/QuestionDetail.vue';
import TopicDetail from './components/TopicDetail.vue';
import ZVideoDetail from './components/ZVideoDetail.vue';
import CollectionDetail from './components/CollectionDetail.vue';
import NotificationsView from './components/NotificationsView.vue';
import MessagesView from './components/MessagesView.vue';
import PeopleListView from './components/PeopleListView.vue';
import PeopleMoreView from './components/PeopleMoreView.vue';
import ColumnItemsView from './components/ColumnItemsView.vue';
import SearchResultView from './components/SearchResultView.vue';


// 统一的登录检查函数
const checkLogin = function ({ resolve, reject }) {
    // 检查是否登录
    if (userManager.isLoggedIn.value) {
        resolve();
    } else {
        // 未登录，提示登录
        f7.dialog.alert('请点击主页右上角登录');
        reject();
    }
};

const routes = [
    {
        path: '/',
        component: HomeView,
        keepAlive: true,
        options: {
            animate: false, // Disable animation for main tab switching sensation if needed
        }
    },
    {
        path: '/video/:id',
        component: ZVideoDetail,
    },
    {
        path: '/following/:tab?',
        component: FollowingView,
        beforeEnter: checkLogin,
    },
    {
        path: '/collections/:userId?/:defaultTab?',
        component: CollectionsView,
        beforeEnter: checkLogin,
    },
    {
        path: '/daily',
        component: DailyView,
    },
    {
        path: '/history',
        component: HistoryView,
    },
    {
        path: '/settings',
        component: SettingsView,
    },
    {
        path: '/search',
        component: SearchPage,
    },
    {
        path: '/article/:type/:id',
        component: ArticleDetail,
    },
    {
        path: '/user/:id',
        component: UserProfile,
    },
    {
        path: '/question/:id',
        component: QuestionDetail,
    },
    {
        path: '/topic/:id',
        component: TopicDetail,
    },
    {
        path: '/collection/:id',
        component: CollectionDetail,
    },
    {
        path: '/notifications',
        component: NotificationsView,
    },
    {
        path: '/messages/:id?',
        component: MessagesView,
    },
    {
        path: '/people-list/:type/:id',
        component: PeopleListView,
    },
    {
        path: '/people-more/:userId/:moreId',
        component: PeopleMoreView,
    },
    {
        path: '/column-items/:id',
        component: ColumnItemsView,
    },
    {
        path: '/search-result/:type/:q/:id?',
        component: SearchResultView,
    },
    {
        path: '/blocking',
        component: PeopleListView,
        options: {
            props: {
                type: 'block_all'
            }
        }
    },
    // Catch-all 404
    {
        path: '(.*)',
        component: HomeView, // Fallback to home or a 404 page
    },
];

export default routes;
