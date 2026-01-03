/**
 * [INPUT]: 依赖 @/lib/supabase 的 supabase 客户端
 * [OUTPUT]: 导出闹钟 CRUD 操作函数 - getAll/getById/create/update/delete/toggle/clearCompleted
 * [POS]: lib 层闹钟数据操作模块,被 AlarmsPage 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { supabase } from './supabase'

// ============================================
// 获取所有闹钟
// ============================================

/**
 * 获取用户的所有闹钟
 * @param {string} userId - 用户 ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Array>}
 */
export async function getAllAlarms(userId, options = {}) {
  const { includeInactive = false, includeCompleted = false } = options

  let query = supabase
    .from('alarms')
    .select('*')
    .eq('user_id', userId)
    .order('alarm_time', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  if (!includeCompleted) {
    query = query.eq('is_completed', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('获取闹钟失败:', error)
    throw error
  }

  return data
}

// ============================================
// 获取单个闹钟
// ============================================

/**
 * 根据 ID 获取闹钟
 * @param {string} alarmId - 闹钟 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function getAlarmById(alarmId, userId) {
  const { data, error } = await supabase
    .from('alarms')
    .select('*')
    .eq('id', alarmId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('获取闹钟失败:', error)
    throw error
  }

  return data
}

// ============================================
// 创建闹钟
// ============================================

/**
 * 创建新闹钟
 * @param {string} userId - 用户 ID
 * @param {Object} alarmData - 闹钟数据
 * @returns {Promise<Object>}
 */
export async function createAlarm(userId, alarmData) {
  const { title, description, alarmTime, isRecurring, recurrencePattern } = alarmData

  const { data, error } = await supabase
    .from('alarms')
    .insert({
      user_id: userId,
      title,
      description,
      alarm_time: alarmTime,
      is_recurring: isRecurring || false,
      recurrence_pattern: recurrencePattern,
      is_active: true,
      is_completed: false,
    })
    .select()
    .single()

  if (error) {
    console.error('创建闹钟失败:', error)
    throw error
  }

  return data
}

// ============================================
// 更新闹钟
// ============================================

/**
 * 更新闹钟
 * @param {string} alarmId - 闹钟 ID
 * @param {string} userId - 用户 ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateAlarm(alarmId, userId, updates) {
  const updateData = {}

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.alarmTime !== undefined) updateData.alarm_time = updates.alarmTime
  if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring
  if (updates.recurrencePattern !== undefined) updateData.recurrence_pattern = updates.recurrencePattern

  const { data, error } = await supabase
    .from('alarms')
    .update(updateData)
    .eq('id', alarmId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('更新闹钟失败:', error)
    throw error
  }

  return data
}

// ============================================
// 删除闹钟
// ============================================

/**
 * 删除闹钟
 * @param {string} alarmId - 闹钟 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<void>}
 */
export async function deleteAlarm(alarmId, userId) {
  const { error } = await supabase
    .from('alarms')
    .delete()
    .eq('id', alarmId)
    .eq('user_id', userId)

  if (error) {
    console.error('删除闹钟失败:', error)
    throw error
  }
}

// ============================================
// 切换闹钟激活状态
// ============================================

/**
 * 切换闹钟激活/关闭状态
 * @param {string} alarmId - 闹钟 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function toggleAlarmActive(alarmId, userId) {
  // 先获取当前状态
  const alarm = await getAlarmById(alarmId, userId)

  const { data, error } = await supabase
    .from('alarms')
    .update({ is_active: !alarm.is_active })
    .eq('id', alarmId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('切换闹钟状态失败:', error)
    throw error
  }

  return data
}

// ============================================
// 标记闹钟已完成
// ============================================

/**
 * 标记闹钟为已完成
 * @param {string} alarmId - 闹钟 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function markAlarmCompleted(alarmId, userId) {
  const alarm = await getAlarmById(alarmId, userId)

  // 如果是循环闹钟，创建下一次的闹钟
  if (alarm.is_recurring && alarm.recurrence_pattern) {
    const nextAlarmTime = calculateNextAlarmTime(alarm.alarm_time, alarm.recurrence_pattern)

    await createAlarm(userId, {
      title: alarm.title,
      description: alarm.description,
      alarmTime: nextAlarmTime,
      isRecurring: true,
      recurrencePattern: alarm.recurrence_pattern,
    })
  }

  // 标记当前闹钟为已完成
  const { data, error } = await supabase
    .from('alarms')
    .update({ is_completed: true, is_active: false })
    .eq('id', alarmId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('标记闹钟完成失败:', error)
    throw error
  }

  return data
}

// ============================================
// 清除已完成的闹钟
// ============================================

/**
 * 清除所有已完成的闹钟
 * @param {string} userId - 用户 ID
 * @returns {Promise<void>}
 */
export async function clearCompletedAlarms(userId) {
  const { error } = await supabase
    .from('alarms')
    .delete()
    .eq('user_id', userId)
    .eq('is_completed', true)

  if (error) {
    console.error('清除已完成闹钟失败:', error)
    throw error
  }
}

// ============================================
// 计算下一次闹钟时间
// ============================================

/**
 * 根据循环模式计算下一次闹钟时间
 * @param {Date} currentAlarmTime - 当前闹钟时间
 * @param {string} pattern - 循环模式 (daily, weekly, monthly)
 * @returns {Date}
 */
function calculateNextAlarmTime(currentAlarmTime, pattern) {
  const nextTime = new Date(currentAlarmTime)

  switch (pattern) {
    case 'daily':
      nextTime.setDate(nextTime.getDate() + 1)
      break
    case 'weekly':
      nextTime.setDate(nextTime.getDate() + 7)
      break
    case 'monthly':
      nextTime.setMonth(nextTime.getMonth() + 1)
      break
    default:
      nextTime.setDate(nextTime.getDate() + 1)
  }

  return nextTime.toISOString()
}
