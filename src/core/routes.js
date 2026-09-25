import { f7 } from 'framework7-vue';
import userManager from '@/composables/userManager';

import HomeView from '@/pages/home/HomeView.vue';
import FollowingView from '@/pages/following/FollowingView.vue';
import CollectionsView from '@/pages/collection/CollectionsView.vue';
import DailyView from '@/pages/daily/DailyView.vue';
import HistoryView from '@/pages/history/HistoryView.vue';
import LocalListView from '@/pages/local/LocalListView.vue';
import LocalContentView from '@/pages/local/LocalContentView.vue';
import SettingsView from '@/pages/settings/SettingsView.vue';
import ThemePickerView from '@/pages/settings/ThemePickerView.vue';
import PageLayoutView from '@/pages/settings/PageLayoutView.vue';
import AboutView from '@/pages/settings/AboutView.vue';
import SearchPage from '@/pages/search/SearchPage.vue';
import ArticleDetail from '@/pages/article/ArticleDetail.vue';
import UserProfile from '@/pages/user/UserProfile.vue';
import QuestionDetail from '@/pages/question/QuestionDetail.vue';
import TopicDetail from '@/pages/topic/TopicDetail.vue';
import ZVideoDetail from '@/pages/video/ZVideoDetail.vue';
import CollectionDetail from '@/pages/collection/CollectionDetail.vue';
import NotificationsView from '@/pages/notifications/NotificationsView.vue';
import PeopleListView from '@/pages/user/PeopleListView.vue';
import PeopleMoreView from '@/pages/user/PeopleMoreView.vue';
import ColumnItemsView from '@/pages/column/ColumnItemsView.vue';
import SearchResultView from '@/pages/search/SearchResultView.vue';
import NotFoundView from '@/pages/misc/NotFoundView.vue';


const checkLogin = function ({ resolve, reject }) {
    if (userManager.isLoggedIn.value) {
        resolve();
    } else {
        f7.dialog.alert('请点击主页右上角登录');
        reject();
    }
};

const routes = [
    {
        path: '/',
        component: HomeView,
        keepAlive: true,
        // 宽视口（平板/折叠屏展开/平行视界）下主页当左栏，详情路由在其右侧展开
        master: true,
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
        meta: {
            needLogin: true,
        }
    },
    {
        path: '/collections/:userId/:defaultTab',
        component: CollectionsView,
    },
    {
        path: '/collections',
        component: CollectionsView,
        meta: {
            needLogin: true
        }
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
        path: '/local',
        component: LocalListView,
    },
    {
        path: '/local/content/:type/:id',
        component: LocalContentView,
    },
    {
        path: '/settings',
        component: SettingsView,
    },
    {
        path: '/settings/theme',
        component: ThemePickerView,
    },
    {
        path: '/settings/page-layout',
        component: PageLayoutView,
    },
    {
        path: '/settings/about',
        component: AboutView,
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
        meta: {
            needLogin: true,
        }
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
    // Catch-all 404
    {
        path: '(.*)',
        component: NotFoundView,
        keepAlive: true
    },
];


// meta.needLogin 的路由在进入前校验登录态
export default routes.map((route) =>
    route.meta?.needLogin ? { ...route, beforeEnter: checkLogin } : route
);
