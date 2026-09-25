# 上手配方

## 新增一个列表页

1. 在 `src/pages/<领域>/` 建 `XxxView.vue`。
2. `<script setup>` 里用 `usePagedList`：

   ```js
   import { usePagedList } from '@/composables/usePagedList.js';
   import { usePageState } from '@/composables/usePageState.js';
   import $http from '@/services/http.js';

   const { page, loading, refresh, loadMore, ensureLoaded } = usePagedList({
       name: '示例列表',
       fetch: (signal) => $http.get('https://api.zhihu.com/...?limit=20', { signal }),
       map: (item) => ({ id: item.id, title: item.title }),
   });
   const { hasCache } = usePageState({ state: { page }, loading });
   onMounted(() => { if (!hasCache.value) ensureLoaded(); });
   ```

3. 模板用 `page.list` / `page.hasMore` / `loading`；`@ptr:refresh` 调 `refresh`、`@infinite`
   调 `loadMore`；底部放 `<LoadMoreFooter :has-more="page.hasMore" :length="page.list.length" />`
   作「到底」提示，续拉转圈交给 `:infinite-preloader="page.hasMore"`（不要自绘底栏）。
4. 在 `src/core/routes.js` 注册路由；需要登录加 `meta: { needLogin: true }`。

多 Tab 列表改用 `useTabbedPagedList`，见 `src/pages/following/FollowingView.vue`，两处必须一起配：
`fillEl: (tabId) => scrollElements[tabId]`（否则后台 tab 会被满屏补拉整表拉走，见架构文档）与
`scroll: (main) => ({ main, ...scrollElements })`（各 tab 独立滚动位置）。

## 新增一个详情页

1. 在 `src/pages/<领域>/` 建 `XxxDetail.vue`，`defineProps({ f7route, f7router })`（不声明
   `routeId`，它由框架注入到 attrs）。
2. `usePageState({ state, loading })` 注册状态恢复，`onMounted` 里 `if (!hasCache.value) fetch()`。
3. 需要记录浏览历史时调 `HistoryService.addRecord`（`@/services/history.js`）。
4. 右上角操作菜单统一走 `useContentMenu({ url, title, reportType, reportId })`（刷新由页面自己的
   `fetch` 承担），模板配一个 `f7-popover` + `popover-open` 触发链接，见
   `src/pages/topic/TopicDetail.vue`。

## 新增一个底部弹层

用 `src/css/app.css` 里的共用基类，不要再各写一份宽度/圆角/头部样式：根 `f7-sheet` 给
`class="sheet-bottom"`（高度各自内联），内部再套一层 `<div class="sheet-modal-inner">` 承接纵向骨架，
头部 `sheet-header`（标题用 `.title`，右侧动作 `sheet-header-actions`），滚动区 `sheet-scroll-body`，
主按钮 `sheet-primary-btn`。中间那层同名 div 不能省：`f7-sheet` 会把默认插槽里的直接子节点按
`f7-list`/`f7-messagebar` 等标签归到 fixed 层，去掉包装会改变它们的定位。

## 新增一个 API 模块

- 走 `@/services/http.js` 的 `$http.get/post/...`，分页接口返回 `PaginatedResult`。
- 领域相关的响应归一化写进 `@/mappers/`，保持纯函数、可单测。
- 需要新的知乎鉴权/签名逻辑时改 `@/services/zhihu/`，不要在组件里拼 header/Cookie。
