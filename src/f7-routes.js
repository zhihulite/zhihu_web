import { f7, f7ready } from 'framework7-vue';
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
import NotFoundView from './components/NotFoundView.vue';


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
        options: {
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
        options: {
            needLogin: true,
            noRid: true
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
        options: {
            needLogin: true,
        }
    },
    {
        path: '/messages/:id?',
        component: MessagesView,
        options: {
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


const enhanceRoutes = (arr) => {
    return arr.map((r) => {
        const nr = { ...r };

        if (nr.options?.needLogin === true) {
            nr.beforeEnter = checkLogin;
        }

        /*
        if (nr.keepAlive !== true && nr.options?.noRid !== true) {
            nr.options = {
                ...nr.options,
            }
            const props = nr.options.props || {};
            nr.options.props = {
                ...props,
                get routeId() {
                    return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
                }
            };
        }
        */
        return nr;
    });
};

export default enhanceRoutes(routes);
