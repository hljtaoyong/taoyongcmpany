/**
 * [INPUT]: 依赖环境变量 VITE_GOOGLE_CLIENT_ID, 依赖环境变量 VITE_GOOGLE_API_KEY, 依赖 gapi 的 Google Calendar API
 * [OUTPUT]: 导出 Google Calendar API 操作函数 - authenticate/createEvent/updateEvent/deleteEvent
 * [POS]: lib 层 Google Calendar 集成,被 todos 模块消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// Google API 配置
const CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  scope: 'https://www.googleapis.com/auth/calendar.events',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
}

// ============================================
// 初始化 Google API
// ============================================

/**
 * 初始化 Google API Client
 * @returns {Promise<void>}
 */
export async function initGoogleClient() {
  if (!window.gapi) {
    throw new Error('Google API 未加载')
  }

  await window.gapi.client.init({
    apiKey: CONFIG.apiKey,
    discoveryDocs: CONFIG.discoveryDocs,
  })
}

// ============================================
// Google OAuth 认证
// ============================================

/**
 * 检查是否已认证
 * @returns {boolean}
 */
export function isGoogleAuthenticated() {
  if (!window.gapi?.auth2?.getAuthInstance()) {
    return false
  }
  return window.gapi.auth2.getAuthInstance().isSignedIn.get()
}

/**
 * Google OAuth 登录
 * @returns {Promise<Object>}
 */
export async function googleSignIn() {
  if (!window.gapi) {
    throw new Error('Google API 未加载，请检查网络连接')
  }

  const authInstance = window.gapi.auth2.getAuthInstance()
  const user = await authInstance.signIn()

  return {
    token: user.getAuthResponse().access_token,
    email: user.getBasicProfile().getEmail()
  }
}

/**
 * Google OAuth 登出
 * @returns {Promise<void>}
 */
export async function googleSignOut() {
  if (!window.gapi?.auth2?.getAuthInstance()) {
    return
  }

  await window.gapi.auth2.getAuthInstance().signOut()
}

// ============================================
// Calendar API 操作
// ============================================

/**
 * 创建日历事件
 * @param {Object} event - 事件数据
 * @param {string} event.title - 事件标题
 * @param {string} event.description - 事件描述
 * @param {string} event.startTime - 开始时间 (ISO 8601)
 * @param {string} event.endTime - 结束时间 (ISO 8601)
 * @returns {Promise<string>} 事件 ID
 */
export async function createCalendarEvent(event) {
  if (!isGoogleAuthenticated()) {
    throw new Error('未认证，请先登录 Google 账号')
  }

  const { title, description, startTime, endTime } = event

  const response = await window.gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: title,
      description: description || '',
      start: {
        dateTime: startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
  })

  return response.result.id
}

/**
 * 更新日历事件
 * @param {string} eventId - 事件 ID
 * @param {Object} event - 事件数据
 * @returns {Promise<void>}
 */
export async function updateCalendarEvent(eventId, event) {
  if (!isGoogleAuthenticated()) {
    throw new Error('未认证，请先登录 Google 账号')
  }

  const { title, description, startTime, endTime } = event

  await window.gapi.client.calendar.events.patch({
    calendarId: 'primary',
    eventId: eventId,
    resource: {
      summary: title,
      description: description || '',
      start: {
        dateTime: startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
  })
}

/**
 * 删除日历事件
 * @param {string} eventId - 事件 ID
 * @returns {Promise<void>}
 */
export async function deleteCalendarEvent(eventId) {
  if (!isGoogleAuthenticated()) {
    throw new Error('未认证，请先登录 Google 账号')
  }

  await window.gapi.client.calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId
  })
}

// ============================================
// 加载 Google API
// ============================================

/**
 * 加载 Google API Client Library
 * @returns {Promise<void>}
 */
export function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.auth2.init({
          client_id: CONFIG.clientId,
          scope: CONFIG.scope
        }).then(resolve, reject)
      })
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}
