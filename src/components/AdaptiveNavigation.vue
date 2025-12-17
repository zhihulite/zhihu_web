<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MaterialSymbol from './MaterialSymbol.vue';
import { useUser } from '@/composables/userManager';

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

const router = useRouter();
const route = useRoute();
const isMobile = ref(false);
const { refreshUser } = useUser();

const handleRefresh = async () => {
    await refreshUser();
    if (isMobile.value) {
        const drawer = document.querySelector('s-drawer');
        if (drawer) drawer.showed = false;
    }
};

const checkIsMobile = () => {
    if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < 768;
    }
};

onMounted(() => {
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkIsMobile);
});

const NAV_ITEMS = [
    { id: 'home', label: '主页', icon: 'home', path: '/' },
    { id: 'following', label: '关注', icon: 'group', path: '/following' },
    { id: 'collections', label: '收藏', icon: 'bookmark', path: '/collections' },
    { id: 'daily', label: '日报', icon: 'newspaper', path: '/daily' },
    { id: 'history', label: '历史', icon: 'history', path: '/history' },
    { id: 'refresh', label: '刷新', icon: 'refresh', action: handleRefresh },
    { id: 'settings', label: '设置', icon: 'settings', path: '/settings' },
];

const handleNavigate = (item) => {
    if (item.action) {
        item.action();
    } else if (item.path) {
        router.push(item.path);
        if (isMobile.value) {
            const drawer = document.querySelector('s-drawer');
            if (drawer) drawer.showed = false;
        }
    }
};

const handleMobileMoreClick = () => {
    props.onMoreClick();
    if (isMobile.value) {
        const drawer = document.querySelector('s-drawer');
        if (drawer) drawer.showed = false;
    }
};

const isSelected = (path) => {
    if (!path) return false;
    if (path === '/' && route.path === '/') return true;
    if (path !== '/' && route.path.startsWith(path)) return true;
    return false;
};
</script>

<template>
    <s-scroll-view v-if="isMobile">
        <s-menu style="width: 100%; max-width: none; margin: 0; height: 100%; border: none;">

            <s-menu-item v-for="item in NAV_ITEMS" :key="item.id" :checked="isSelected(item.path)"
                @click="handleNavigate(item)">
                <MaterialSymbol slot="start" :icon="item.icon" />
                {{ item.label }}
            </s-menu-item>

            <s-divider></s-divider>

            <s-menu-item @click="handleMobileMoreClick">
                <MaterialSymbol slot="start" icon="menu" />
                更多
            </s-menu-item>

            <s-menu-item @click="onLogout">
                <MaterialSymbol slot="start" icon="logout" />
                退出登录
            </s-menu-item>

        </s-menu>
    </s-scroll-view>

    <s-navigation v-else mode="rail" style="height: 100%; border: none; background-color: transparent;">
        <s-avatar class="logo-box">Z</s-avatar>

        <s-navigation-item v-for="item in NAV_ITEMS" :key="item.id" :selected="isSelected(item.path)"
            @click="handleNavigate(item)">
            <MaterialSymbol slot="icon" :icon="item.icon" :fill="isSelected(item.path)" />
            <div slot="text">{{ item.label }}</div>
        </s-navigation-item>

        <div slot="end" class="rail-footer">
            <s-icon-button @click="onMoreClick" type="standard">
                <MaterialSymbol icon="menu" />
            </s-icon-button>

            <s-icon-button type="outlined" @click="onLogout">
                <MaterialSymbol icon="logout" />
            </s-icon-button>
        </div>
    </s-navigation>
</template>

<style scoped>
.logo-box {
    margin-top: 24px;
    margin-bottom: 8px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 1.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    user-select: none;
}

.rail-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    padding-bottom: 24px;
    width: 100%;
}
</style>
