<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { f7, f7ready } from 'framework7-vue';
import { openLink } from '@/core/navigation.js';

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

// 侧栏标识用的图标：与双栏空栏占位同一份资源，按部署基址取
const brandIcon = `${import.meta.env.BASE_URL}icons/192x192.png`;

const NAV_ITEMS = [
    { id: 'home', label: '主页', path: '/', icon: { ios: 'f7:house_fill', md: 'material:home' } },
    { id: 'following', label: '关注', path: '/following', icon: { ios: 'f7:person_2_fill', md: 'material:people' } },
    { id: 'collections', label: '收藏', path: '/collections', icon: { ios: 'f7:bookmark_fill', md: 'material:bookmark' } },
    { id: 'daily', label: '日报', path: '/daily', icon: { ios: 'f7:doc_plaintext', md: 'material:article' } },
    { id: 'history', label: '历史', path: '/history', icon: { ios: 'f7:clock_fill', md: 'material:history' } },
    { id: 'local', label: '本地', path: '/local', icon: { ios: 'f7:archivebox', md: 'material:archive' } },
    { id: 'settings', label: '设置', path: '/settings', icon: { ios: 'f7:gear_alt_fill', md: 'material:settings' } }
];

const handleNavigate = (item) => {
    if (f7.panel.get('left') && f7.panel.get('left').opened) {
        f7.panel.close('left');
    }

    if (item.external) {
        openLink(item.external);
    } else if (item.path) {
        f7.views.main.router.navigate(item.path);
    }
};

const handleMobileMoreClick = () => {
    if (f7.panel.get('left') && f7.panel.get('left').opened) {
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

let mainRouter = null;

onMounted(() => {
    f7ready(() => {
        mainRouter = f7.views.main?.router;
        if (mainRouter) {
            currentPath.value = mainRouter.currentRoute?.path || '/';
            mainRouter.on('routeChange', updateCurrentPath);
        }
    });
});

onUnmounted(() => {
    mainRouter?.off('routeChange', updateCurrentPath);
});
</script>

<template>
    <div class="nav-wrapper">
        <div class="brand" @click="openLink('https://github.com/zhihulite/zhihu_web')">
            <img :src="brandIcon" alt="" />
            <div class="brand-text">
                <span class="brand-name">Zyphron</span>
                <span class="brand-sub">知乎网页端</span>
            </div>
        </div>

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

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 16px 14px;
    cursor: pointer;
}

.brand img {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    flex-shrink: 0;
}

.brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.brand-name {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--f7-text-color);
}

.brand-sub {
    font-size: 11px;
    line-height: 1.4;
    color: var(--app-sub-text);
}

.spacer {
    flex: 1;
}
</style>
