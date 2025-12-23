# PWA 自动更新功能 🔄

## 功能说明

Meow Scale 现在支持 PWA（Progressive Web App）自动更新功能！

### ✨ 特性

1. **自动更新**：当有新版本发布时，应用会自动下载并更新
2. **离线支持**：应用可以在离线状态下使用
3. **缓存优化**：静态资源和字体文件会被缓存，加载更快

## 工作原理

### 自动更新流程

1. 用户访问应用
2. Service Worker 在后台检查更新
3. 如果有新版本：
   - 自动下载新版本的资源
   - 下载完成后自动激活新版本
   - 用户下次刷新页面时就会看到最新版本

### 配置说明

在 `vite.config.js` 中配置了：

```javascript
VitePWA({
  registerType: 'autoUpdate',  // 自动更新模式
  // ...
})
```

**`registerType` 选项：**
- `autoUpdate`：自动更新，无需用户确认（当前使用）
- `prompt`：提示用户是否更新
- `skip`：跳过等待，立即激活

## 使用方式

### 开发环境

```bash
npm run dev
```

开发环境下 Service Worker 不会激活，以避免缓存干扰开发。

### 生产环境

```bash
npm run build
npm run preview  # 本地预览生产版本
```

或部署到 Cloudflare Pages 后，用户访问时会自动注册 Service Worker。

## 更新检测

Service Worker 会在以下情况检查更新：

1. 用户首次访问应用
2. 用户导航到应用内的新页面
3. 每隔一段时间（浏览器控制）

## 缓存策略

### 静态资源
- **策略**：预缓存（Precache）
- **文件**：所有 JS、CSS、HTML、图片等
- **更新**：随应用版本更新

### Google Fonts
- **策略**：CacheFirst
- **有效期**：1年
- **说明**：字体文件优先从缓存读取，加快加载速度

## 调试

### 查看 Service Worker 状态

1. 打开 Chrome DevTools
2. 进入 Application 标签
3. 左侧选择 Service Workers
4. 可以看到当前注册的 Service Worker 状态

### 清除缓存

如果需要清除缓存：

1. DevTools → Application → Storage
2. 点击 "Clear site data"

### 控制台日志

应用会在控制台输出以下信息：

- `新版本可用，正在自动更新...` - 检测到新版本
- `应用已可离线使用` - Service Worker 注册成功

## 部署后的效果

当你推送新代码到 GitHub 并触发 Cloudflare Pages 部署后：

1. Cloudflare 构建新版本
2. 用户访问应用时，Service Worker 检测到新版本
3. 自动下载新资源
4. 用户刷新页面后看到最新版本

**无需手动清除缓存或重新安装应用！** ✨

## 注意事项

1. **首次访问**：第一次访问时需要下载所有资源
2. **网络要求**：需要网络连接来检查和下载更新
3. **浏览器支持**：现代浏览器都支持 Service Worker
4. **HTTPS 要求**：Service Worker 只在 HTTPS 环境下工作（localhost 除外）

## 技术栈

- **vite-plugin-pwa**：Vite 的 PWA 插件
- **Workbox**：Google 的 Service Worker 库
- **自动更新策略**：无需用户干预的更新机制

---

现在你的应用已经支持自动更新了！🎉
