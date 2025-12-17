
import { createRouter, createWebHashHistory } from 'vue-router';
import ArticleDetail from '../components/ArticleDetail.vue';
import UserProfile from '../components/UserProfile.vue';
import QuestionDetail from '../components/QuestionDetail.vue';
import TopicDetail from '../components/TopicDetail.vue';

const EmptyComponent = { render: () => null };

const routes = [
    { path: '/', component: () => import('../components/home/HomeView.vue'), meta: { keepAlive: true } },
    { path: '/following', component: () => import('../components/home/FollowingView.vue'), meta: { keepAlive: true } },
    { path: '/collections', component: () => import('../components/home/CollectionsView.vue'), meta: { keepAlive: true } },
    { path: '/daily', component: () => import('../components/home/DailyView.vue'), meta: { keepAlive: true } },
    { path: '/history', component: () => import('../components/home/HistoryView.vue'), meta: { keepAlive: true } },
    { path: '/settings', component: () => import('../components/SettingsView.vue'), meta: { keepAlive: true } },
    { path: '/search', component: () => import('../components/SearchPage.vue'), meta: { keepAlive: true } },

    { path: '/article/:type/:id', component: ArticleDetail },
    { path: '/user/:id', component: UserProfile },
    { path: '/question/:id', component: QuestionDetail },
    { path: '/topic/:id', component: TopicDetail },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
