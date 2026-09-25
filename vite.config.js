import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { zhihuProxy } from './dev/zhihu-proxy.js';

const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public');
const BUILD_DIR = path.resolve(__dirname, './html',);
const BASE_DIR = '/zhihu_web/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.includes('swiper-') } } }),
    // 只在 dev 挂反代：/__zproxy/<host>/<路径> 转真知乎，配 __dev/proxy.html 免油猴免桩跑真接口
    zhihuProxy(),
  ],
  root: SRC_DIR,
  base: BASE_DIR,
  publicDir: PUBLIC_DIR,
  build: {
    outDir: BUILD_DIR,
    assetsInlineLimit: 0,
    emptyOutDir: true,
    rollupOptions: {
      treeshake: false,
    },
  },
  resolve: {
    alias: {
      '@': SRC_DIR,
    },
  },
  server: {
    host: true,
  },

})