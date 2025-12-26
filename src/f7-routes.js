
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


const routes = [
    {
        path: '/',
        component: HomeView,
        options: {
            animate: false, // Disable animation for main tab switching sensation if needed
        }
    },
    {
        path: '/following',
        component: FollowingView,
    },
    {
        path: '/collections',
        component: CollectionsView,
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
    // Catch-all 404
    {
        path: '(.*)',
        component: HomeView, // Fallback to home or a 404 page
    },
];

export default routes;
