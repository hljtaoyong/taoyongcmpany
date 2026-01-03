/**
 * [INPUT]: 依赖 react 的 createContext/useContext/useEffect/useState, 依赖 @/lib/supabase 的 supabase, 依赖 @/lib/auth 的 signInWithGoogle/signInWithEmail/signUpWithEmail/signOut
 * [OUTPUT]: 导出 AuthProvider 组件、useAuth Hook
 * [POS]: contexts 层认证上下文,提供全局用户状态和登录方法
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from '@/lib/auth'

// ============================================
// Auth Context 定义
// ============================================

const AuthContext = createContext(null)

/**
 * AuthProvider - 认证上下文提供者
 * 管理全局用户状态和认证方法
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始会话
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // 清理订阅
    return () => subscription.unsubscribe()
  }, [])

  // Google 登录
  const handleSignInWithGoogle = async () => {
    const { error } = await signInWithGoogle()
    return { error }
  }

  // 邮箱登录
  const handleSignInWithEmail = async (email, password) => {
    const { error } = await signInWithEmail(email, password)
    return { error }
  }

  // 邮箱注册
  const handleSignUpWithEmail = async (email, password) => {
    const { error } = await signUpWithEmail(email, password)
    return { error }
  }

  // 登出方法
  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      setUser(null)
    }
    return { error }
  }

  const value = {
    user,
    loading,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    signIn: handleSignInWithGoogle, // 兼容旧代码
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth - 认证上下文 Hook
 * @returns {Object} { user, loading, signIn, signOut, isAuthenticated }
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
