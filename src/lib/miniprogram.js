/**
 * [INPUT]: 依赖环境变量 VITE_MINIPROGRAM_APPID, 依赖微信小程序 API
 * [OUTPUT]: 导出小程序集成函数 - syncToMiniprogram/getQRCode/loginWithMiniprogram
 * [POS]: lib 层小程序集成模块,提供微信小程序同步能力
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { supabase } from './supabase'

// ============================================
// 配置
// ============================================

const MINIPROGRAM_CONFIG = {
  appId: import.meta.env.VITE_MINIPROGRAM_APPID || '',
  // 小程序服务器地址（需要你自己部署）
  serverURL: import.meta.env.VITE_MINIPROGRAM_SERVER_URL || '',
  // 小程序页面路径
  pages: {
    todos: '/pages/todos/todos',
    alarms: '/pages/alarms/alarms',
    notes: '/pages/notes/notes'
  }
}

// ============================================
// 生成小程序码
// ============================================

/**
 * 生成小程序码（用于分享）
 * @param {string} path - 小程序页面路径
 * @param {Object} query - 页面参数
 * @returns {Promise<string>} 小程序码图片 URL
 */
export async function getMiniprogramQRCode(path, query = {}) {
  if (!MINIPROGRAM_CONFIG.serverURL) {
    throw new Error('小程序服务器地址未配置')
  }

  // 通过你的后端服务器调用微信 API
  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/qrcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify({
      path,
      query,
      width: 430
    })
  })

  if (!response.ok) {
    throw new Error('生成小程序码失败')
  }

  const data = await response.json()
  return data.qrcodeURL // 返回小程序码图片地址
}

// ============================================
// 同步数据到小程序
// ============================================

/**
 * 同步任务到小程序
 * @param {Array} todos - 任务列表
 * @returns {Promise<Object>} 同步结果
 */
export async function syncTodosToMiniprogram(todos) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  // 获取小程序 openId
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('miniprogram_openid')
    .eq('user_id', user.id)
    .single()

  if (!profile?.miniprogram_openid) {
    throw new Error('未绑定小程序，请先扫码登录')
  }

  // 通过你的后端服务器发送消息到小程序
  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      openId: profile.miniprogram_openid,
      type: 'todos',
      data: todos
    })
  })

  if (!response.ok) {
    throw new Error('同步到小程序失败')
  }

  return await response.json()
}

/**
 * 同步闹钟到小程序
 * @param {Array} alarms - 闹钟列表
 * @returns {Promise<Object>} 同步结果
 */
export async function syncAlarmsToMiniprogram(alarms) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('miniprogram_openid')
    .eq('user_id', user.id)
    .single()

  if (!profile?.miniprogram_openid) {
    throw new Error('未绑定小程序，请先扫码登录')
  }

  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      openId: profile.miniprogram_openid,
      type: 'alarms',
      data: alarms
    })
  })

  if (!response.ok) {
    throw new Error('同步到小程序失败')
  }

  return await response.json()
}

/**
 * 同步便签到小程序
 * @param {Array} notes - 便签列表
 * @returns {Promise<Object>} 同步结果
 */
export async function syncNotesToMiniprogram(notes) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('miniprogram_openid')
    .eq('user_id', user.id)
    .single()

  if (!profile?.miniprogram_openid) {
    throw new Error('未绑定小程序，请先扫码登录')
  }

  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      openId: profile.miniprogram_openid,
      type: 'notes',
      data: notes
    })
  })

  if (!response.ok) {
    throw new Error('同步到小程序失败')
  }

  return await response.json()
}

// ============================================
// 小程序登录
// ============================================

/**
 * 通过小程序扫码登录 Web 端
 * @param {string} code - 小程序登录凭证
 * @returns {Promise<Object>} 登录结果
 */
export async function loginWithMiniprogram(code) {
  // 通过你的后端服务器验证小程序登录
  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      appId: MINIPROGRAM_CONFIG.appId
    })
  })

  if (!response.ok) {
    throw new Error('小程序登录失败')
  }

  const data = await response.json()

  // 使用返回的 token 登录 Supabase
  if (data.token) {
    await supabase.auth.setSession({
      access_token: data.token,
      refresh_token: data.refreshToken
    })
  }

  return data
}

// ============================================
// 绑定小程序
// ============================================

/**
 * 绑定小程序账号到当前用户
 * @param {string} openId - 小程序 OpenID
 * @returns {Promise<void>}
 */
export async function bindMiniprogram(openId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  // 更新用户资料，绑定 openId
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      miniprogram_openid: openId,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error('绑定小程序失败')
  }
}

// ============================================
// 生成登录二维码
// ============================================

/**
 * 生成小程序登录码（Web 端扫码登录）
 * @returns {Promise<{qrCode: string, loginId: string}>}
 */
export async function generateLoginQRCode() {
  if (!MINIPROGRAM_CONFIG.serverURL) {
    throw new Error('小程序服务器地址未配置')
  }

  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/login-qrcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('生成登录码失败')
  }

  const data = await response.json()
  return {
    qrCode: data.qrCodeURL,
    loginId: data.loginId
  }
}

// ============================================
// 轮询登录状态
// ============================================

/**
 * 轮询检查小程序扫码登录状态
 * @param {string} loginId - 登录 ID
 * @returns {Promise<boolean>} 是否登录成功
 */
export async function pollMiniprogramLogin(loginId) {
  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/login-status?loginId=${loginId}`)

  if (!response.ok) {
    return false
  }

  const data = await response.json()

  if (data.loggedIn && data.token) {
    await supabase.auth.setSession({
      access_token: data.token,
      refresh_token: data.refreshToken
    })
    return true
  }

  return false
}

// ============================================
// 工具函数
// ============================================

/**
 * 获取访问令牌
 * @returns {string}
 */
function getAccessToken() {
  // 从 localStorage 获取 token
  const session = localStorage.getItem('supabase-session')
  if (session) {
    const { access_token } = JSON.parse(session)
    return access_token
  }
  return ''
}

/**
 * 打开小程序
 * @param {string} path - 小程序页面路径
 */
export function openMiniprogram(path = '/pages/index/index') {
  // 通过 URL Scheme 打开小程序
  const scheme = `weixin://dl/business/?t=*${MINIPROGRAM_CONFIG.appId}&path=${encodeURIComponent(path)}`
  window.open(scheme, '_blank')
}

// ============================================
// 小程序订阅消息
// ============================================

/**
 * 发送订阅消息到小程序
 * @param {string} templateId - 模板 ID
 * @param {Object} data - 消息数据
 * @returns {Promise<void>}
 */
export async function sendMiniprogramMessage(templateId, data) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('miniprogram_openid')
    .eq('user_id', user.id)
    .single()

  if (!profile?.miniprogram_openid) {
    throw new Error('未绑定小程序')
  }

  const response = await fetch(`${MINIPROGRAM_CONFIG.serverURL}/api/miniprogram/subscribe-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      openId: profile.miniprogram_openid,
      templateId,
      data
    })
  })

  if (!response.ok) {
    throw new Error('发送订阅消息失败')
  }
}
