<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute, RouterView } from 'vue-router';
import AdaptiveNavigation from './components/AdaptiveNavigation.vue';
import TopBar from './components/TopBar.vue';
import MoreMenuDialog from './components/MoreMenuDialog.vue';
import { logout } from './api/auth.js';
import { useUser } from '@/composables/userManager';

const router = useRouter();
const route = useRoute();
const { resetUser, refreshUser } = useUser();

const isMoreDialogOpen = ref(false);
const isMobile = ref(false);

const checkIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768;
  }
};

onMounted(async () => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});

const handleLogout = () => {
  if (window.confirm("确定要退出登录吗？")) {
    logout().then(() => {
      resetUser();
      // 刷新用户数据为游客数据
      refreshUser();
      router.push('/');
    });
  }
};

const handleCloseMoreDialog = () => {
  isMoreDialogOpen.value = false;
};

const isFullScreenRoute = computed(() => {
  const path = route.path;
  return path.startsWith('/article/') ||
    path.startsWith('/question/') ||
    path.startsWith('/user/') ||
    path.startsWith('/topic/') ||
    path === '/search';
});
</script>

<template>
  <s-page theme="auto" class="app-page">
    <s-drawer class="app-drawer">
      <div slot="start" :style="{ width: isMobile ? '280px' : 'auto' }">
        <AdaptiveNavigation :onLogout="handleLogout" :onMoreClick="() => isMoreDialogOpen = true" />
      </div>

      <div class="main-content">
        <div v-if="!isFullScreenRoute">
          <TopBar />
        </div>

        <div class="view-container">
          <RouterView v-slot="{ Component, route }">
            <KeepAlive>
              <component :is="Component" v-if="route.meta.keepAlive" :key="route.path" />
            </KeepAlive>
            <component :is="Component" v-if="!route.meta.keepAlive" :key="route.path" />
          </RouterView>
        </div>
      </div>
    </s-drawer>

    <MoreMenuDialog :isOpen="isMoreDialogOpen" :onClose="handleCloseMoreDialog" />
  </s-page>
</template>

<style scoped>
.app-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-drawer {
  height: 100%;
  width: 100%;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 0;
}

.view-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
