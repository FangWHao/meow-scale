# 深色模式支持 🌙

## 🎨 功能说明

Meow Scale 现在支持自动适配系统的深色模式！当你的设备切换到深色模式时，应用会自动调整配色方案。

## 🔄 自动适配

应用会自动检测系统的颜色主题设置：
- **浅色模式**：温暖的粉色和蓝绿色主题
- **深色模式**：深色背景 + 柔和的渐变卡片

## 🎯 配色方案

### 浅色模式（Light Mode）
```css
背景色: #F5F5F7 (浅灰色)
卡片背景: #FFFFFF (白色)
文字颜色: #6A5D5D (暖灰色)
用户卡片: 粉色渐变 (#FFE5E5 → #FFF5F5 → #FFFFFF)
伴侣卡片: 蓝绿色渐变 (#D4F1F4 → #E8F8F5 → #FFFFFF)
```

### 深色模式（Dark Mode）
```css
背景色: #1a1a1a (深黑色)
卡片背景: #2d2d2d (深灰色)
文字颜色: #e0e0e0 (浅灰色)
用户卡片: 深粉色调渐变 (#3a2828 → #2d2d2d)
伴侣卡片: 深蓝绿色调渐变 (#1f3a3a → #2d2d2d)
```

## 📱 如何测试

### iOS/macOS
1. 打开系统设置
2. 切换"外观"为"深色"或"浅色"
3. 应用会立即自动切换

### Android
1. 打开设置 → 显示
2. 切换"深色主题"
3. 应用会立即自动切换

### 浏览器开发者工具
1. 打开 Chrome DevTools (F12)
2. 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows)
3. 输入 "dark mode"
4. 选择 "Emulate CSS prefers-color-scheme: dark"

## 🎨 设计细节

### 1. **背景色优化**
- 浅色模式：中性浅灰 `#F5F5F7`，不会太粉
- 深色模式：深黑色 `#1a1a1a`，护眼舒适

### 2. **卡片渐变**
- 浅色模式：鲜明的彩色渐变，层次分明
- 深色模式：深色调渐变，保留色彩倾向但不刺眼

### 3. **文字对比度**
- 浅色模式：深色文字 `#6A5D5D`
- 深色模式：浅色文字 `#e0e0e0`
- 确保 WCAG AA 级别的可读性

### 4. **输入框和按钮**
- 深色模式下自动调整背景色和边框
- 保持良好的交互反馈

## 🔧 技术实现

### CSS 媒体查询
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-surface: #2d2d2d;
    --color-text: #e0e0e0;
    /* ... */
  }
}
```

### React 动态检测
```javascript
const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
);

useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

### 动态样式
```jsx
<Card style={{
    background: isDarkMode 
        ? 'linear-gradient(135deg, #3a2828 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #FFE5E5 0%, #FFFFFF 100%)'
}}>
```

## ✨ 优化亮点

1. **自动切换**：无需手动设置，跟随系统主题
2. **实时响应**：系统切换主题时，应用立即更新
3. **保留特色**：深色模式下仍保留粉色和蓝绿色的品牌色调
4. **护眼设计**：深色模式使用柔和的色彩，不刺眼
5. **无边框设计**：去掉了边框，更简洁现代

## 📁 修改的文件

1. `src/index.css` - 添加深色模式 CSS 变量
2. `src/pages/Dashboard.jsx` - 添加深色模式检测和动态样式

## 🚀 未来可能的改进

- [ ] 添加手动切换深色/浅色模式的开关
- [ ] 为图表添加深色模式优化
- [ ] 优化深色模式下的图标和插图
- [ ] 添加"跟随系统"、"始终浅色"、"始终深色"三种选项
