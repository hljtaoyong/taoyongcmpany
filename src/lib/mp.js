/**
 * [INPUT]: 依赖 @/lib/supabase 的 supabase 客户端
 * [OUTPUT]: 导出微信小程序集成函数 - login/sendSubscribeMessage/generateQRCode
 * [POS]: lib 层小程序调用封装,被 AI 任务拆解和通知模块消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { supabase } from './supabase'

// ============================================
// 微信小程序登录
// ============================================

/**
 * 小程序 code2session 登录
 * @param {string} code - 微信登录 code
 * @returns {Promise<Object>} 用户 profile
 */
export async function mpLogin(code) {
  const { data, error } = await supabase.functions.invoke('mp-sync', {
    body: { action: 'login', code },
  })

  if (error) throw error
  return data.profile
}

// ============================================
// 发送订阅消息
// ============================================

/**
 * 发送小程序订阅消息
 * @param {string} templateId - 模板 ID
 * @param {string} page - 跳转页面
 * @param {Object} data - 模板数据
 * @returns {Promise<boolean>} 是否发送成功
 */
export async function sendSubscribeMessage(templateId, page, data) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: result, error } = await supabase.functions.invoke('mp-sync', {
    body: {
      action: 'send-message',
      template_id: templateId,
      page,
      data,
    },
  })

  if (error) throw error
  return result.success
}

// ============================================
// 生成小程序码
// ============================================

/**
 * 生成小程序码
 * @param {string} scene - 场景值
 * @param {string} page - 页面路径
 * @returns {Promise<string>} base64 图片
 */
export async function generateMPQRCode(scene, page = 'pages/index') {
  const { data, error } = await supabase.functions.invoke('mp-sync', {
    body: { action: 'get-qrcode', scene, page },
  })

  if (error) throw error
  return data.qrcode
}

// ============================================
// 预定义消息模板
// ============================================

/**
 * 发送任务提醒
 * @param {Object} task - 任务对象
 * @returns {Promise<boolean>}
 */
export async function sendTaskReminder(task) {
  return sendSubscribeMessage(
    'TASK_REMINDER_TEMPLATE_ID', // 替换为实际模板 ID
    'pages/task/detail',
    {
      thing1: { value: task.title },
      date2: { value: task.due_date || '' },
      thing3: { value: task.description || '无描述' },
    }
  )
}

/**
 * 发送闹钟提醒
 * @param {Object} alarm - 闹钟对象
 * @returns {Promise<boolean>}
 */
export async function sendAlarmReminder(alarm) {
  return sendSubscribeMessage(
    'ALARM_REMINDER_TEMPLATE_ID', // 替换为实际模板 ID
    'pages/alarm/index',
    {
      thing1: { value: alarm.title },
      time2: { value: new Date(alarm.alarm_time).toLocaleString('zh-CN') },
      thing3: { value: alarm.description || '无描述' },
    }
  )
}

/**
 * 发送周报
 * @param {Array} completedTasks - 完成的任务列表
 * @returns {Promise<boolean>}
 */
export async function sendWeeklyReport(completedTasks) {
  return sendSubscribeMessage(
    'WEEKLY_REPORT_TEMPLATE_ID', // 替换为实际模板 ID
    'pages/report/index',
    {
      thing1: { value: `${completedTasks.length}个` },
      thing2: { value: '本周已完成' },
    }
  )
}
