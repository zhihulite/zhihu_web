# ZhiHu_Web

> 在线网页端：https://zhihulite.github.io/zhihu_web/

基于 **Framework7** + **GM_xmlhttpRequest** 实现的第三方知乎网页端。

> **项目状态**：目前为 Demo 阶段，欢迎有兴趣的开发者参与共建！

[参与方式与开发规范见 AGENTS.md](https://github.com/zhihulite/zhihu_web/blob/main/AGENTS.md)

---

## 安装与运行

```bash
git clone https://github.com/zhihulite/zhihu_web.git
cd zhihu_web
npm install          # postinstall 会自动应用 patches/ 下的 Framework7 补丁
npm run dev -- --host   # 开发服务器（支持局域网访问）
npm run build        # 生产构建，产物在 html/
```

`npm run dev` 与 `npm run build` 相互独立：开发只需 `dev`，部署用 `build`。

---

## Framework7 补丁

本项目对官方 Framework7 9.0.5 做了少量修改（自动 `routeId`、滚动恢复、若干组件初始化守卫等），
以 [patch-package](https://github.com/ds300/patch-package) 的补丁形式维护，不再手工替换 `node_modules`。

- 补丁文件：`patches/framework7+9.0.5.patch`、`patches/framework7-vue+9.0.5.patch`
- `npm install` 后由 `postinstall` 钩子自动应用，无需额外操作

补丁改的是 `node_modules` 里的文件，而 Vite 会缓存依赖预构建的结果，所以**换过补丁或
重新 `npm install` 后要删掉 `node_modules/.vite` 再启动**，否则跑起来仍是打补丁前的 Framework7
（典型症状：自动 `routeId` 失效、页面状态不缓存）。`npm run dev -- --force` 等效于清缓存后启动。

### 修改补丁

改动 `node_modules/framework7` 或 `node_modules/framework7-vue` 后重新生成补丁：

```bash
npm run patch:make
```

脚本先清掉 `patches/` 里旧的 framework7 补丁，再按排除规则各生成一份；文件名里的版本号取自
`node_modules` 里实际安装的版本，所以**升级框架后跑一次这条命令**即可，不用记参数、也不用手工改文件名。
排除规则（剔除声明文件、样式、source map 等非运行时产物，保持补丁最小）写在 `scripts/make-patches.mjs`。

### 升级 Framework7

补丁文件名带版本（如 `framework7+9.0.5.patch`）。`npm install` 时若安装的版本与文件名不一致，
patch-package 仍会尝试应用：hunk 能对上就打成功（只提示版本不匹配），对不上则**直接报错中断**，不会静默留下半套改动。
所以升级流程是：`npm install framework7@<新版本> framework7-vue@<新版本>` → `npm run patch:make` →
逐条看补丁是否已被上游修复，能删的 hunk 删掉。

---

## 验证

启动后检查控制台无模块加载错误；`npm run build` 应无报错。
