<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { f7, f7ready } from 'framework7-vue';
import AdaptiveNavigation from './components/AdaptiveNavigation.vue';
import MoreMenuDialog from './components/MoreMenuDialog.vue';
import { logout } from './api/auth.js';
import { useUser } from '@/composables/userManager';
import routes from './f7-routes.js';
import store from './store.js';
import { checkTipVersion } from './utils/tip_manager.js';

const { resetUser, refreshUser } = useUser();

const isMoreDialogOpen = ref(false);
const isMobile = ref(false);
const isNativeApp = ref(false);

const basePath = window.location.pathname.endsWith('/')
  ? window.location.pathname
  : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
// Framework7 Parameters
const f7params = {
  name: 'Zhihu Lite',
  theme: 'auto',
  routes: routes, // Pass routes here
  toast: {
    closeTimeout: 3000,
  },
  dialog: {
    buttonOk: "确认",
    buttonCancel: "取消"
  },
  serviceWorker: process.env.NODE_ENV === 'production' ? {
    path: basePath + 'service-worker.js',
  } : {},
};

onMounted(async () => {
  f7ready((f7) => {
    loadThemeSettings(f7);

    // 首次打开提示
    checkTipVersion('welcome_tip', 1769350802686, () => {
      f7.dialog.alert('温馨提示：文章页部分内容可能与原网页有所不同。如果遇到排版问题，您可以点击右上角菜单选择“打开原始网页”或“复制原始链接”。', '提示');
    });

    // 开源提示
    checkTipVersion('opensource_tip', 1769350802686, () => {
      f7.dialog.confirm('该项目已开源，是否跳转到 GitHub 查看源码？', '开源提示', () => {
        window.open('https://github.com/zhihulite/zhihu_web', '_blank');
      });
    });

    // 仅在默认默认开启时处理
    const panel = f7.panel.get("left");
    if (panel.opened) {
      const PANEL_CLOSED_KEY = 'panel_was_closed';
      let wasPanelClosed = localStorage.getItem(PANEL_CLOSED_KEY) === 'true';
      if (wasPanelClosed) {
        panel.toggle();
      }

      const handlePanelOpen = () => {
        localStorage.removeItem(PANEL_CLOSED_KEY);
      };

      const handlePanelClose = () => {
        localStorage.setItem(PANEL_CLOSED_KEY, 'true');
      };

      panel.on('open', handlePanelOpen);
      panel.on('close', handlePanelClose);

    }
    window.testf7 = f7;
    isNativeApp.value = f7.device.capacitor || f7.device.cordova;
    isMobile.value = !f7.device.desktop;
  });
});


let themeListener = null;

const handleSystemThemeChange = (e) => {
  try {
    const stored = localStorage.getItem('theme_config');
    if (stored) {
      const config = JSON.parse(stored);
      if (config.followSystem) {
        if (f7) f7.setDarkMode(e.matches);
      }
    }
  } catch (err) { console.error(err); }
};

const loadThemeSettings = (f7) => {
  try {
    const stored = localStorage.getItem('theme_config');
    if (stored) {
      const config = JSON.parse(stored);

      if (config.followSystem) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        f7.setDarkMode(mq.matches);

        if (themeListener) mq.removeEventListener('change', themeListener);
        themeListener = handleSystemThemeChange;
        mq.addEventListener('change', themeListener);
      } else {
        if (config.darkMode !== undefined) {
          f7.setDarkMode(config.darkMode);
        }
      }

      if (config.fontSize) {
        document.documentElement.style.setProperty('--f7-font-size', config.fontSize);
      }
      if (config.useCustomColor && config.customColor && typeof config.customColor === 'string' && config.customColor.trim() !== '') {
        f7.setColorTheme(config.customColor);
      } else if (config.color && f7.colors[config.color]) {
        f7.setColorTheme(f7.colors[config.color]);
      }
      let scheme = 'default';
      const mono = config.monochrome;
      const vib = config.vibrant;
      if (mono && vib) scheme = 'monochrome-vibrant';
      else if (mono) scheme = 'monochrome';
      else if (vib) scheme = 'vibrant';
      f7.setMdColorScheme(scheme);
    }
  } catch (e) {
    console.error('Failed to load theme settings in App', e);
  }
};

onUnmounted(() => {
  if (themeListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', themeListener);
  }
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
const browserHistoryRoot = ref(isNativeApp.value ? undefined : window.location.pathname);

</script>

<template>
  <f7-app v-bind="f7params" :store="store">

    <f7-view main class="safe-areas" url="/" :browserHistory="!isNativeApp" :browserHistoryRoot="browserHistoryRoot"
      :restoreScrollTopOnBack="false"></f7-view>

    <f7-panel left cover :visible-breakpoint="768" resizable>
      <f7-view>
        <f7-page>
          <AdaptiveNavigation :onLogout="handleLogout" :onMoreClick="() => isMoreDialogOpen = true" />
        </f7-page>
      </f7-view>
    </f7-panel>

    <MoreMenuDialog v-model="isMoreDialogOpen" :f7router="f7.views?.main?.router" />
  </f7-app>
</template>
