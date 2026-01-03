/**
 * [INPUT]: 依赖 @/contexts/AuthContext 的 useAuth, 依赖 @/components/ui/dialog 的 Dialog, 依赖 @/components/ui/button 的 Button, 依赖 lucide-react 的 X/LogOut
 * [OUTPUT]: 导出 AuthModal 登录弹窗组件
 * [POS]: components 层认证弹窗,被 Header 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { X, LogOut, Loader2 } from "lucide-react"

/**
 * AuthModal - 认证弹窗组件
 * 未登录显示登录选项，已登录显示用户信息和登出按钮
 */
export function AuthModal({ open, onOpenChange }) {
  const { user, loading, signIn, signOut } = useAuth()
  const [isSigning, setIsSigning] = useState(false)

  const handleSignIn = async () => {
    setIsSigning(true)
    const { error } = await signIn()
    setIsSigning(false)

    if (!error) {
      onOpenChange(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">关闭</span>
          </button>
          <DialogTitle className="text-2xl">
            {loading ? '加载中...' : user ? '账号信息' : '欢迎登录'}
          </DialogTitle>
          <DialogDescription>
            {loading
              ? '正在获取用户信息...'
              : user
              ? '您已登录，可以访问所有功能'
              : '使用 Google 账号快速登录'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              {/* 用户信息 */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <Avatar className="h-20 w-20 ring-2 ring-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <p className="font-semibold text-lg">
                    {user.user_metadata?.full_name || '用户'}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </motion.div>

              {/* 登出按钮 */}
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </>
          ) : (
            <>
              {/* Google 登录按钮 */}
              <Button
                onClick={handleSignIn}
                disabled={isSigning}
                className="w-full gap-2"
                size="lg"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    使用 Google 继续
                  </>
                )}
              </Button>

              {/* 提示文字 */}
              <p className="text-xs text-muted-foreground text-center">
                登录即表示同意我们的服务条款和隐私政策
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
