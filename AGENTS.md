# AGENTS.md

AI 代理与贡献者的唯一规范入口。CLAUDE.md 只指向本文件，规则不重复维护。

zhihu_web 是知乎第三方网页端：Vue 3 `<script setup>` + Framework7 9，Vite 构建，网络请求经
油猴 `GM_xmlhttpRequest` 直连知乎 API。使用[修改版 Framework7](README.md)（修复了原版若干 bug，
并为每条路由自动注入 `routeId`）。

## 规范文档

| 文档 | 内容 |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | 分层职责、依赖方向、装配顺序、目录约定、routeId 机制 |
| [docs/code-style.md](docs/code-style.md) | 文件头、注释、JSDoc、命名、码风 |
| [docs/page-recipes.md](docs/page-recipes.md) | 新增列表页 / 详情页 / API 模块的分步配方 |

Framework7 的本地改动以 `patches/` 补丁维护（`npm install` 自动应用），见 [README](README.md#framework7-补丁)。

## 硬性规则

1. **注释三规则**（细则见 docs/code-style.md）：
   - 禁止"为什么不这么做"论证：不写"用 A 而非 B，因为 B 会…"的替代方案对比，只写当前
     设计是什么、机制上为什么需要。
   - 禁止历史叙事：不写"旧版/曾经/原实现是 X"、"已随裁剪删除"等演变故事，注释只描述代码现状。
   - 禁止 `// ========== xxx ==========` 分节横幅，分节用空行。
2. **导入路径**：一律用 `@/` 别名（`@ → src`），禁止 `../../` 深层相对路径。
3. **全局注入**：`window.*` 与 `app.config.globalProperties` 只允许在 `main.js` 注入，
   业务代码经 import 或 composable 获取能力，不散落全局。
4. **依赖方向**：`pages → components/composables → services/mappers → utils`，`core` 为装配与
   路由基础设施。下层不得反向 import 上层。
5. **改动后校验**：运行 `npm run build` 确认构建通过；构建产物 `html/` 已入库（GitHub Pages
   直接部署），涉及发布时一并重建提交。分页引擎、字段归一、链接解析、请求发送层等纯逻辑改动
   同时跑 `npm test`（见 docs/architecture.md 的「测试」一节）。

## 提交约定

提交信息用中文，动词开头或 `类型: 描述`（feat / fix / build 等），与既有提交风格一致。
