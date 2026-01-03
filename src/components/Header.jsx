/**
 * [INPUT]: 依赖 react-router-dom 的 Link, 依赖 react 的 useState, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 @/components/ui/button 的 Button, 依赖 @/components/AuthModal 的 AuthModal, 依赖 @/components/ui/avatar 的 Avatar, 依赖 lucide-react 的 Palette/User
 * [OUTPUT]: 导出 Header 导航组件,包含登录按钮和用户信息显示
 * [POS]: 布局层顶部导航,包裹 Logo 与导航链接
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { AuthModal } from "./AuthModal"
import { useAuth } from "@/contexts/AuthContext"
import { Palette, User } from "lucide-react"
import { motion } from "framer-motion"

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, loading } = useAuth()

  return (
    <>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Palette className="h-4 w-4" />
            </div>
            <span>Tao Yong Company</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                首页
              </Button>
            </Link>
            <Link to="/design-system">
              <Button variant="ghost" size="sm">
                设计系统
              </Button>
            </Link>

            {/* 登录/用户信息 */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <motion.button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 p-1 shadow-[0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </motion.button>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                登录
              </Button>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
