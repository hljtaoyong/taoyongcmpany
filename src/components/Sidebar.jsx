/**
 * [INPUT]: 依赖 react-router-dom 的 Link/useLocation, 依赖 framer-motion 的 motion, 依赖 lucide-react 的 Home/Palette/CheckCircle/Bell/StickyNote, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 @/components/ui/avatar 的 Avatar
 * [OUTPUT]: 导出 Sidebar 侧边导航栏组件,包含所有功能入口和用户信息
 * [POS]: 布局层左侧导航,固定在左侧,展示功能切换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, Palette, CheckCircle, Bell, StickyNote, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "./AuthModal"
import { useState } from "react"

// 导航配置
const NAV_ITEMS = [
  { path: "/", label: "首页", icon: Home, gradient: "from-gray-500 to-gray-600" },
  { path: "/design-system", label: "设计系统", icon: Palette, gradient: "from-indigo-500 to-purple-600" },
  { path: "/todos", label: "任务", icon: CheckCircle, gradient: "from-violet-500 to-purple-600" },
  { path: "/alarms", label: "闹钟", icon: Bell, gradient: "from-orange-400 to-pink-500" },
  { path: "/notes", label: "便签", icon: StickyNote, gradient: "from-emerald-400 to-teal-500" }
]

export function Sidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <aside className="fixed left-0 top-0 h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800">Tao Yong</h1>
              <p className="text-xs text-gray-500">Productivity Suite</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon, gradient }) => {
            const isActive = location.pathname === path

            return (
              <Link key={path} to={path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-2 w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200/50">
          {user ? (
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer"
                onClick={() => setAuthModalOpen(true)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {user.user_metadata?.full_name || '用户'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">退出登录</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
              style={{
                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)'
              }}
            >
              <User className="h-4 w-4" />
              <span className="font-medium">登录</span>
            </motion.button>
          )}
        </div>
      </aside>
    </>
  )
}
