/**
 * [INPUT]: 依赖 react-router-dom 的 Link/useLocation, 依赖 framer-motion 的 motion, 依赖 lucide-react 的 Home/Palette/CheckCircle/Bell/StickyNote/ChevronLeft, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 @/components/ui/avatar 的 Avatar
 * [OUTPUT]: 导出 Sidebar 侧边导航栏组件,包含折叠功能、所有功能入口和用户信息
 * [POS]: 布局层左侧导航,固定在左侧,展示功能切换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Palette, CheckCircle, Bell, StickyNote, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "./AuthModal"
import { useState, useEffect } from "react"

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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved === 'true'
  })

  // 保存折叠状态
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString())
  }, [isCollapsed])

  // 触发自定义事件通知布局变化
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed } }))
  }, [isCollapsed])

  const handleSignOut = async () => {
    await signOut()
  }

  const width = isCollapsed ? 'w-20' : 'w-64'

  return (
    <>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <aside className={`fixed left-0 top-0 h-screen ${width} bg-white/90 backdrop-blur-xl border-r border-gray-200/50 flex flex-col z-50 transition-all duration-300`}>
        {/* Logo + 折叠按钮 */}
        <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <Palette className="h-5 w-5" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-bold text-lg text-gray-800">Tao Yong</h1>
                  <p className="text-xs text-gray-500">Productivity Suite</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* 折叠按钮 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon, gradient }) => {
            const isActive = location.pathname === path

            return (
              <Link key={path} to={path}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-3 w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-200/50">
          {user ? (
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => setAuthModalOpen(true)}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden flex-1 min-w-0"
                    >
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {user.user_metadata?.full_name || '用户'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      退出登录
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAuthModalOpen(true)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow ${isCollapsed ? 'p-3' : ''}`}
              style={{
                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)'
              }}
            >
              <User className="h-4 w-4 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap"
                  >
                    登录
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </aside>
    </>
  )
}
