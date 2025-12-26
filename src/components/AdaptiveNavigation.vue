<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { f7, f7ready } from 'framework7-vue';
import { f7Page, f7Icon } from 'framework7-vue';

const props = defineProps({
    onLogout: {
        type: Function,
        default: () => { }
    },
    onMoreClick: {
        type: Function,
        default: () => { }
    }
});

const currentPath = ref('/');

const NAV_ITEMS = [
    { id: 'home', label: '主页', path: '/', icon: { ios: 'f7:house_fill', md: 'material:home' } },
    { id: 'following', label: '关注', path: '/following', icon: { ios: 'f7:person_2_fill', md: 'material:people' } },
    { id: 'collections', label: '收藏', path: '/collections', icon: { ios: 'f7:bookmark_fill', md: 'material:bookmark' } },
    { id: 'daily', label: '日报', path: '/daily', icon: { ios: 'f7:newspaper_fill', md: 'material:article' } },
    { id: 'history', label: '历史', path: '/history', icon: { ios: 'f7:clock_fill', md: 'material:history' } },
    { id: 'settings', label: '设置', path: '/settings', icon: { ios: 'f7:gear_fill', md: 'material:settings' } }
];

const handleNavigate = (item) => {
    if (f7.panel.get('left') && f7.panel.get('left').opened && window.innerWidth < 768) {
        f7.panel.close('left');
    }

    if (item.action) {
        item.action();
    } else if (item.path) {
        f7.view.main.router.navigate(item.path);
    }
};

const handleMobileMoreClick = () => {
    if (f7.panel.get('left') && f7.panel.get('left').opened && window.innerWidth < 768) {
        f7.panel.close('left');
    }
    props.onMoreClick();
};

const isSelected = (path) => {
    if (!path) return false;
    if (path === '/' && currentPath.value === '/') return true;
    if (path !== '/' && currentPath.value.startsWith(path)) return true;
    return false;
};

const updateCurrentPath = (route) => {
    currentPath.value = route.path || route.url || '/';
};

onMounted(() => {
    f7ready(() => {
        window.testf7 = f7
        if (f7.view.main && f7.view.main.router) {
            currentPath.value = f7.view.main.router.currentRoute?.path || '/';

            f7.view.main.router.on('routeChange', (newRoute) => {
                updateCurrentPath(newRoute);
            });
        }
    });
});
</script>

<template>
    <div class="nav-wrapper">
        <div class="logo-box">Z</div>

        <f7-list menu-list>
            <f7-list-item v-for="item in NAV_ITEMS" :key="item.id" :title="item.label" link
                :selected="isSelected(item.path)" @click="handleNavigate(item)">
                <template #media>
                    <f7-icon :ios="item.icon.ios" :md="item.icon.md" />
                </template>
            </f7-list-item>
        </f7-list>

        <div class="spacer"></div>

        <f7-list menu-list class="footer-list">
            <f7-list-item title="更多" link @click="handleMobileMoreClick">
                <template #media>
                    <f7-icon ios="f7:menu" md="material:menu"></f7-icon>
                </template>
            </f7-list-item>
            <f7-list-item title="退出登录" link @click="onLogout">
                <template #media>
                    <f7-icon ios="f7:arrow_right_square" md="material:logout"></f7-icon>
                </template>
            </f7-list-item>
        </f7-list>
    </div>
</template>

<style scoped>
.nav-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    box-sizing: border-box;
}

.logo-box {
    margin: 0 16px 16px 16px;
    width: 48px;
    height: 48px;
    background: var(--f7-theme-color);
    color: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spacer {
    flex: 1;
}
</style>
