以下是更新后的 README，已加入使用 `ncu` 更新依赖的说明：

---

# ZhiHu_Web

> 在线网页端：https://zhihulite.github.io/zhihu_web/

基于 **Framework7** + **GM_xmlhttpRequest** 实现的第三方知乎网页端。

> ⚠️ **项目状态**：目前为 Demo 阶段，欢迎有兴趣的开发者参与共建！

[👉 点击查看参与方式及后续计划](https://github.com/zhihulite/zhihu_web/blob/main/join.md)

---

## 📦 使用修改版 Framework7

本项目使用**修改版 Framework7**（修复了原版已知但官方尚未修复的 bug）

- 修改版仓库地址：https://github.com/huajiqaq/framework7/tree/mymaster

---

## 🔧 替换 Framework7 依赖教程

### 步骤 1：安装 ZhiHu_Web 项目

```bash
git clone https://github.com/zhihulite/zhihu_web.git
cd zhihu_web
npm install
```

> 为了方便，先安装官方模块，后续再进行替换。

### 步骤 2：删除 Vite 缓存

```bash
rm -rf node_modules/.vite
```

### 步骤 3：下载并构建修改版 Framework7

```bash
git clone https://github.com/huajiqaq/framework7.git
cd framework7
git checkout mymaster
npm install
```

### 步骤 4：构建 Core 和 Vue 包

```bash
npm run build-core:prod   # 构建 Core 包
npm run build-vue:prod    # 构建 Vue 包
```

构建完成后，在根目录找到 `packages` 目录。

### 步骤 5：替换项目依赖

- 将 `packages/framework7` 文件夹替换到 `zhihu_web/node_modules/framework7`
- 将 `packages/framework7-vue` 文件夹替换到 `zhihu_web/node_modules/framework7-vue`

### 步骤 6：重新构建并运行

```bash
cd ../zhihu_web
npm run build   # 构造静态资源（生成 dist 目录）
npm run dev -- --host     # 启动开发服务器（支持局域网访问）
```

> 💡 **两步是独立的**：`npm run build` 用于生产部署，`npm run dev` 用于日常开发调试。开发时只需执行 `npm run dev -- --host`，无需先 build。

---

## 📦 更新项目依赖

当需要升级项目依赖到最新版本时，推荐使用 `npm-check-updates`（ncu）工具：

### 安装 ncu

```bash
npm install -g npm-check-updates
```

### 检查可更新的依赖

```bash
ncu
```

### 交互式选择更新

```bash
ncu -i
```

### 直接更新 package.json 到最新版本

```bash
ncu -u
npm install
```

> ⚠️ **注意**：更新依赖后，如果涉及 Framework7 相关包，需要重新执行上述替换教程，确保使用修改版。

---

## ✅ 验证替换成功

启动项目后，检查控制台无模块加载错误即可。
