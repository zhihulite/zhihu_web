<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { f7, f7ready } from 'framework7-vue';
import AdaptiveNavigation from '@/components/AdaptiveNavigation.vue';
import MoreMenuDialog from '@/components/MoreMenuDialog.vue';
import LoginDialog from '@/components/LoginDialog.vue';
import { showLoginDialog } from '@/core/login-dialog.js';
import { logout } from '@/services/auth.js';
import { useUser } from '@/composables/userManager';
import routes from '@/core/routes.js';
import { installPageCachePruner } from '@/core/router.js';
import { installThemeSync } from '@/composables/useTheme.js';
import { installLayout } from '@/core/layout.js';
import { settings } from '@/core/settings.js';
import { checkUpdate, syncVersionInfo } from '@/services/update.js';
import { checkTipVersion } from '@/services/tip.js';
import { PANEL_BREAKPOINT, parallelBreakpoint } from '@/core/layout.js';

const { refreshUser } = useUser();

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
  touch: {
    tapHold: true,
    tapHoldDelay: 550,
  },
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

// View 只在创建时读一次双栏断点，所以「平行世界」开关要重启才生效
const masterDetailBreakpoint = parallelBreakpoint();

// 双栏空栏占位用的应用图标（放在 public 下，按部署基址取）
const appIconUrl = `${import.meta.env.BASE_URL}icons/192x192.png`;

let uninstallThemeSync = null;

onMounted(async () => {
  f7ready((f7) => {
    uninstallThemeSync = installThemeSync(f7);
    installLayout();
    installPageCachePruner();

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

    // 启动期自动检查更新（静默，仅有新版本时提示；尊重「忽略此版本」）
    // 先记下本地部署版本，比对才有基准
    syncVersionInfo().then(() => {
      if (settings.autoCheckUpdate) checkUpdate({ silent: true });
    });

    // 侧栏与双栏的视口策略都在 installLayout 里
    isNativeApp.value = f7.device.capacitor || f7.device.cordova;
    isMobile.value = !f7.device.desktop;
  });
});

onUnmounted(() => {
  uninstallThemeSync?.();
});

const handleLogout = () => {
  f7.dialog.confirm('确定要退出登录吗？', async () => {
    try {
      await logout();
    } catch (e) {
      // 服务端登出失败也要完成本地清理，凭证已在 logout() 内清除
      console.error('退出登录请求失败', e);
    }
    refreshUser();
    const router = f7.views?.main?.router;
    if (router) {
      router.navigate('/', { clearPreviousHistory: true });
    }
  });
};
const browserHistoryRoot = ref(isNativeApp.value ? undefined : window.location.pathname);

</script>

<template>
  <f7-app v-bind="f7params">

    <f7-view main class="safe-areas" url="/" :browserHistory="!isNativeApp" :browserHistoryRoot="browserHistoryRoot"
      :master-detail-breakpoint="masterDetailBreakpoint" :restoreScrollTopOnBack="false">
      <!-- 双栏空栏时的默认占位：常挂在 View 底层，有页面就被盖住，View 不在双栏形态时不显示 -->
      <div class="detail-placeholder">
        <img :src="appIconUrl" alt="">
        <span>Zyphron</span>
      </div>
    </f7-view>

    <f7-panel left cover :visible-breakpoint="PANEL_BREAKPOINT" resizable>
      <f7-view>
        <f7-page>
          <AdaptiveNavigation :onLogout="handleLogout" :onMoreClick="() => isMoreDialogOpen = true" />
        </f7-page>
      </f7-view>
    </f7-panel>

    <MoreMenuDialog v-model="isMoreDialogOpen" :f7router="f7.views?.main?.router" />

    <!-- 登录弹窗挂在全局：任意页面正文里的 signin 链接都能唤起 -->
    <LoginDialog v-model="showLoginDialog" @login-success="refreshUser" />
  </f7-app>
</template>
