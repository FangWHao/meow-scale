import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 注册 Service Worker 并启用自动更新
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('新版本可用，正在自动更新...')
  },
  onOfflineReady() {
    console.log('应用已可离线使用')
  },
})
