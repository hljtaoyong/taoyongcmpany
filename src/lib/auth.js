/**
 * [INPUT]: 依赖 @/lib/supabase 的 supabase 客户端
 * [OUTPUT]: 导出 signInWithGoogle/signOut/getCurrentUser/authStateChange 工具函数
 * [POS]: lib 层认证工具,被 AuthContext 和登录组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { supabase } from './supabase'

// ============================================
// 邮箱密码登录
// ============================================

/**
 * 使用邮箱密码登录
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data: any, error: any}>}
 */
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('邮箱登录失败:', error.message)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 注册新用户
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data: any, error: any}>}
 */
export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('注册失败:', error.message)
    return { data: null, error }
  }

  return { data, error: null }
}

// ============================================
// Google OAuth 登录
// ============================================

/**
 * 使用 Google OAuth 登录
 * @returns {Promise<{data: any, error: any}>}
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google 登录失败:', error.message)
    return { data: null, error }
  }

  return { data, error: null }
}

// ============================================
// 登出
// ============================================

/**
 * 退出登录
 * @returns {Promise<{error: any}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('登出失败:', error.message)
    return { error }
  }

  return { error: null }
}

// ============================================
// 获取当前用户
// ============================================

/**
 * 获取当前登录用户
 * @returns {Promise<any>}
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('获取用户失败:', error.message)
    return null
  }

  return user
}

/**
 * 获取当前会话
 * @returns {Promise<any>}
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('获取会话失败:', error.message)
    return null
  }

  return session
}

// ============================================
// 监听认证状态变化
// ============================================

/**
 * 监听认证状态变化
 * @param {Function} callback - (event, session) => void
 * @returns {Object} subscription 对象,包含 unsubscribe 方法
 */
export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return data.subscription
}
