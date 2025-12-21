# 🐾 Meow Scale | 喵喵体重

一款专为情侣设计的、超可爱的猫咪主题体重管理工具。支持双人数据同步、目标激励、PWA 安装以及温暖的每日提醒。

<div align="center">
  <img src="public/meow_scale_app_icon.png" width="128" height="128" alt="Meow Scale Icon">
  <p><i>“和 Ta 一起变成更轻盈的小猫咪吧！”</i></p>
</div>

---

## ✨ 核心功能

- **🐱 猫味十足的 UI**：全站粉色可爱系设计，数据点位全是调皮旋转的小猫头。
- **💑 情侣双人联动**：绑定搭档，实时查看彼此的体重进度，互相激励（或者互相嘲讽 🧋）。
- **📊 趋势可视化**：支持 30 天/90 天体重与 BMI 趋势切换，见证你们的蜕变。
- **📏 沉浸式录入**：模拟物理刻度尺的体重选择器，操作丝滑顺畅。
- **🔔 每日温馨提醒**：自定义提醒时间，如果还没秤重，小猫就会准时喊你。
- **📱 PWA 原生体验**：支持安装到手机桌面，告别浏览器地址栏，沉浸式使用。

---

## 🛠️ 技术栈

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Modern CSS Variables)
- **Backend/DB**: Firebase (Firestore + Authentication)
- **Deployment**: Cloudflare Pages
- **Icons**: Lucide React

---

## 🚀 快速开始

### 1. 环境准备
确保你已经安装了 [Node.js](https://nodejs.org/)。

### 2. 克隆项目
```bash
git clone https://github.com/YourUsername/meow-scale.git
cd meow-scale
```

### 3. 安装依赖
```bash
npm install
```

### 4. 环境配置
在根目录创建 `.env` 文件，填入你的 Firebase 配置信息：
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. 本地运行
```bash
npm run dev
```

---

## 📦 部署指引

本项目极其推荐部署在 **Cloudflare Pages**：
1. **GitHub 推送**：将代码推送到你的 GitHub 仓库。
2. **连接 Cloudflare**：在 Cloudflare 控制台选择 **Pages** -> **Connect to Git**。
3. **构建设置**：
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **环境变量**：在 Cloudflare 设置中填入上述 `.env` 中的所有变量。
5. **SPA 适配**：项目已内置 `_redirects` 文件，自动处理 404 问题。

---

## 📜 开源协议

本项目采用 MIT 协议。

---

<div align="center">
  Made with ❤️ for all the kittens out there.
</div>
