<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { f7App, f7Panel, f7View, f7Page, f7 } from 'framework7-vue';
import AdaptiveNavigation from './components/AdaptiveNavigation.vue';
import MoreMenuDialog from './components/MoreMenuDialog.vue';
import { logout } from './api/auth.js';
import { useUser } from '@/composables/userManager';
import routes from './f7-routes.js';

const { resetUser, refreshUser } = useUser();

const isMoreDialogOpen = ref(false);
const isMobile = ref(false);

// Framework7 Parameters
const f7params = {
  name: 'Zhihu Lite',
  theme: 'auto',
  routes: routes, // Pass routes here
  colors: {
    primary: '#0066ff',
  },
  serviceWorker: process.env.NODE_ENV === 'production' ? {
    path: '/service-worker.js',
  } : {},
};

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
      refreshUser();
      const router = (f7 && f7.views && f7.views.main && f7.views.main.router);
      if (router) {
        router.navigate('/', { clearPreviousHistory: true });
      }
    });
  }
};

const handleCloseMoreDialog = () => {
  isMoreDialogOpen.value = false;
};
</script>

<template>
  <f7-app v-bind="f7params">
    <!-- Main View -->
    <f7-view main class="safe-areas" url="/"></f7-view>

    <!-- Left Panel / Drawer -->
    <f7-panel left cover :visible-breakpoint="768" resizable>
      <f7-view>
        <f7-page>
          <AdaptiveNavigation :onLogout="handleLogout" :onMoreClick="() => isMoreDialogOpen = true" />
        </f7-page>
      </f7-view>
    </f7-panel>

    <MoreMenuDialog :isOpen="isMoreDialogOpen" :onClose="handleCloseMoreDialog" />
  </f7-app>
</template>

<style>
:root {
  --f7-theme-color: #0b87ff;
}
</style>
