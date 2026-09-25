# 架构

## 分层职责

| 层级 | 目录 | 职责 |
| --- | --- | --- |
| Pages | `src/pages/<领域>/` | 路由页面容器。每个页面一个领域目录，页面专属子组件同目录 |
| Components | `src/components/` | 跨页面复用的组件（卡片、渲染器、弹窗、导航、原子展示件） |
| Composables | `src/composables/` | 页面逻辑（列表分页、状态恢复、点赞关注、导航、主题） |
| Mappers | `src/mappers/` | 知乎原始响应 → 视图模型的纯函数 |
| Services | `src/services/` | 网络客户端、鉴权、历史、提示、页面缓存、阅读位置；`services/zhihu/` 是请求栈 |
| Core | `src/core/` | 路由表、路由基础设施、常量、跨页共享的响应式单点状态（登录弹窗开关、主页栏目）。装配层 |
| Utils | `src/utils/` | 无副作用工具（格式化、URL 解析） |

## 依赖方向

单向向下，下层不得反向 import 上层：

```
pages → components / composables → services / mappers → utils
core（装配与路由基础设施，被 main.js 与 App.vue 引用）
```

导入一律用 `@/` 别名，禁止 `../../` 深层相对路径。

## 请求栈（services/zhihu/）

```
组件 → services/http.js（单例 + 分页 PaginatedResult）
      → zhihu/module.js（header / Cookie / ZSE96 签名 / accessToken 注入）
      → zhihu/transport.js（GM_xmlhttpRequest + 401/403 状态码策略）
zhihu/guest.js  游客态凭证引导
zhihu/laes.js   请求体与签名加密
```

免登录端点（知乎日报等）用 `http.js` 再导出的 `rawHttp`：它不经鉴权头与 401/403 处理分支。
每个请求带 30 秒超时（`transport.js` 的 `REQUEST_TIMEOUT_MS`）；超时与网络失败都不作废凭证。

**凭证只有一个变化入口**：请求头与正文由 `module.js` 的 `assemble()` 在每次尝试前现装
（`x-Zse-96` 签名与 Cookie 都取自当时的令牌），所以任何换凭证的动作都必须回写实例
`updateZhihuLoginData(tokenManager.getLoginData())`——登录框成功后、`auth.js` 刷新令牌后、游客凭证
重新引导后都已回写；漏掉这一步等于请求继续带着旧令牌。刷新类响应不带 cookie 时 `updateLoginData`
延用上一次的，带 cookie 时整组替换，换账号不留旧会话键。

401 统一走 `auth.js` 的 `rebuildCredential()`：登录态刷 refresh_token，游客态重新引导（游客令牌没有
refresh_token，到期只能重取），并发请求共用同一次重建。`transport.js` 在重试前调 `options.assemble()`
重装请求；二次仍 401 才判定凭证不可用，且只提示一条。退出登录同样要 `initZhihu()` 回落游客，
否则本地凭证清干净了、实例还带着作废的那份。

## 装配顺序（main.js）

`GM_xmlhttpRequest` 检测 → 注册 Framework7Vue → `await initZhihu()`（游客/登录凭证）→ 注入全局
`$openLink`/`$handleCardClick`（同时挂 `window` 与 `globalProperties`，供 v-html 注入的
`href="javascript:$openLink(...)"` 使用）→ `app.mount`。所有全局只在此注入一次，业务代码一律 import。

## 页面状态恢复与 routeId

修改版 Framework7 为每条路由的 `options.props` 注入 `routeId` getter，导航时求值为稳定字符串
随 props 下发；同一路由实例在返回栈存续期间复用同一值。**页面组件不声明 `routeId` prop**，它落
在组件 `attrs` 上，由 `composables/usePageState.js` 内部经 `getCurrentInstance().attrs.routeId`
读取。

- `usePageState({ state, loading, scroll, enabled })`：`onBeforeUnmount` 存、`onMounted` 恢复，
  返回 `{ hasCache }`。命中缓存的页面 `onMounted` 不重新请求。
- `services/page-cache.js`：以 routeId 为键的 `Map`。
- `core/router.js` 的 `installPageCachePruner`：监听 `routeChange`，按返回栈 `propsHistory` 上仍
  存活的 routeId 回收缓存。
- 跨会话的阅读位置是另一层：`services/scroll-store.js` 以**页面 URL** 为键落 localStorage（条目 10 天
  内有效），页面在内容渲染完成后轮询恢复。与 routeId 内存态互不代替——出栈即回收，URL 记录留着下次
  冷启动用。

## 列表分页

- `usePagedList({ fetch, map, name, onError, fillEl })` → `{ page:{ list, hasMore, lastResult }, loading,
  refresh, loadMore, ensureLoaded, reset }`。
- `useTabbedPagedList({ tabs, fetch, map, fillEl })`：每个 tab 各持一份列表与游标，懒加载。
- `fetch` 返回 `services/http.js` 的 `PaginatedResult`（带 `hasMore` getter 与 `next(overrides)`），并接收一个
  `AbortSignal`（`fetch: (tabId, signal) => $http.get(url, { signal })`）。signal 是一次性的：组件卸载即 abort，
  而 `page.lastResult` 会随页面状态被缓存下来，所以续取时引擎把**本轮**的 signal 覆盖进游标（`next({ signal })`），
  否则返回该页后翻页会立刻 AbortError。每次加载带代号，刷新与 `reset()` 都作废在途结果——旧关键词、旧排序的
  响应不会落进新列表。
- 满屏自动续拉：F7 的 infinite 只监听 `scroll`，首屏内容不撑满视口时永不触发，故引擎在每次加载后
  按 `fillEl` 给的滚动容器判断「能否看到底」，看不到底才补拉一页。单列表页默认取组件内首个可见
  `.page-content`；**多 Tab 页必须传 `fillEl(tabId)`**（隐藏 tab 在 swipeable 下仍有高度，猜容器会让
  后台 tab 被整表拉完），页面侧用 `:ref="(el) => setScrollRef(el, tab.id)"` 登记容器。

`page` 只含数据字段、不含方法，可整体交给 `usePageState` 持久化。

## 生命周期安全

`composables/useAlive.js`：组件卸载后异步回调不再写响应式
状态，避免翻页/退出后的过期写入。`usePagedList`/`useTabbedPagedList` 内部已用它守卫加载结果。
需要取消在途请求时用 `acquireSignal()` 领取随卸载自动 abort 的 `AbortSignal`。

## 字段归一

`mappers/zhihu-item.js`：知乎同类内容在不同接口里字段名/
嵌套各异，`unwrap` / `normalizeType` / `titleOf` / `excerptOf` / `voteupOf` / `commentCountOf` / `authorOf`
是唯一去噪出口。各页 mapper 与 `mappers/feed.js` 都应经它取值，不要各写一套 `item.target || item`。

## 应用设置

`core/settings.js` 采用「一键一处定义」：
在 `SCHEMA` 加一行即得默认值 + 响应式访问 + localStorage 持久化。`settings` 是全局响应式单例，
组件 import 即共享；屏蔽词过滤经 `makeBlockWordsFilter()` 传给 `usePagedList` 的 `filter` 选项。
需要把若干项写回默认值时用 `resetSettings([...keys])`，默认值不散落在页面里。

外观另成一 store：`composables/useThemeSettings.js` 的 `themeSettings` 是配色 / Material 配色方案 /
字号 / 深浅色 / OLED 的响应式单例，改动即时套用 `applyThemeConfig` 并按 200ms 合批落盘。设置页与其
「主题色」「页面布局」子页共用这一份，不再各自持有本地副本；`saveThemeConfig` 按补丁合并写入，
每页只提交自己负责的键。

## 测试

`npm test` 用 node 自带测试器跑 `tests/**/*.test.js`，不引入额外依赖。`tests/helpers/setup.mjs` 由
`--import` 先行加载装配环境：`@/` 别名交给 `alias-loader.mjs` 解析并把源码按 ESM 上报；`localStorage`
与 `window` 装最小替身；`crypto` 取 node 的 webcrypto；`GM_xmlhttpRequest` 换成 `fake-gm.mjs`，它记录
每次请求的 method/url/headers/body，并按注册路由返回响应体。

- `tests/unit/`：不碰网络的纯逻辑——评论正文构造、字段归一、markdown、链接解析与路由表、分页引擎、
  设置与栏目 store。
- `tests/wire/`：把整条请求栈（鉴权头、LAES 加密、分页游标、Cookie 通道）真跑一遍，断言发出去的
  方法、地址与参数。正文默认被 LAES 加密，需要核对明文字段时临时替换实例的 `encryptData` 取原文。
- setup 里静音 `console.log`（被测代码的逐请求日志会淹没断言输出），`warn`/`error` 保留。

