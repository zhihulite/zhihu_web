# 代码风格

适用范围：`src` 下所有 `.vue` 与 `.js` 文件。

## 文件头

`.js` 模块首行为自身路径注释，第二行为一句话职责：

```js
// src/composables/usePagedList.js
// 分页列表：首屏加载、加载更多、下拉刷新与三态维护。
```

`.vue` 组件不强制文件头，职责由文件名与所在目录表达。

## 注释

注释只描述代码现状与机制，遵守三条禁令：

1. **禁止"为什么不这么做"论证**：不写"用 A 而非 B，因为 B 会…"的替代方案对比。只写当前
   设计是什么、机制上为什么需要。
2. **禁止历史叙事**：不写"旧版/曾经/原实现是 X"、"曾尝试 Y"、"已随裁剪删除"等演变故事。
3. **禁止 `// ========== xxx ==========` 分节横幅**，分节用空行。

写法：

- 函数上方单行注释说明职责；机制约束写在紧邻代码处，说明"这段代码依赖什么前提"。
- 不复述代码：getter/setter、与代码逐字对应的步骤注释一律不写。
- IDE 生成残留（如 `// TODO: Implement this method`）必须删除。
- 待办用 `// TODO 说明`，可附链接。
- 警告性注释直接给出约束与后果，如"页面销毁时务必调用 remove 清理"。

## JSDoc

公共 API（导出的 composable / 工具函数、跨文件回调）用 `/** */`，内部函数用普通 `//`。参数与
返回值用 `@param {type} name` / `@returns`，可空类型 `[name]`。

## 命名

| 对象 | 风格 | 示例 |
| --- | --- | --- |
| 模块文件（services/composables/utils/core） | kebab 或 camel | `page-cache.js`、`usePagedList.js` |
| 组件文件（pages/components） | PascalCase | `ArticleDetail.vue`、`FeedCard.vue` |
| 变量、函数、方法 | camelCase | `getFirstPageUrl`、`parseResponse` |
| 常量 | UPPER_SNAKE | `MAX_HISTORY`、`DEBOUNCE_DELAY` |
| 布尔 | is / has / need / enable 前缀 | `isLoading`、`needLogin`、`hasCache` |
| 事件回调 | on 前缀 | `onRefresh`、`onInfinite` |
| composable | use 前缀 | `usePagedList`、`useTheme` |

## 码风

- 缩进 4 空格，不用 Tab；行尾不留空白。
- 表/数组允许尾逗号，多字段换行书写。
- 导入一律 `@/` 别名，禁止 `../../` 深层相对路径。
- 全局能力只在 `main.js` 注入，业务代码经 import 或 composable 获取。

## 抽象门槛

结构在 3 处以上重复、且差异能用 2-3 个参数表达完，才抽成 composable 或组件。单次使用的结构
不预先抽象，重复十几行可接受。
