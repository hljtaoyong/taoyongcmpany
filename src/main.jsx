/**
 * [INPUT]: 依赖 react 的 StrictMode, 依赖 react-dom/client 的 createRoot, 依赖 ./css/index.css 的全局样式, 依赖 @/contexts/AuthContext 的 AuthProvider
 * [OUTPUT]: 应用入口,将 App 挂载到 #root,包裹认证上下文
 * [POS]: 应用的唯一入口点,全局状态初始化
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'
import { AuthProvider } from '@/contexts/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
