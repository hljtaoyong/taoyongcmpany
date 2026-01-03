/**
 * [INPUT]: 依赖 @/lib/supabase 的 supabase 客户端，依赖认证上下文的 user.id
 * [OUTPUT]: 对外提供 todos CRUD 操作函数 (getAll/getById/create/update/delete/toggle)
 * [POS]: lib 层数据访问层，被 Todos 页面组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { supabase } from './supabase.js'

// ============================================
// Todos CRUD 操作
// ============================================

/**
 * 获取用户所有 todos
 * @param {string} userId - 用户 ID
 * @param {Object} options - 查询选项
 * @param {boolean} options.includeCompleted - 是否包含已完成 (默认 true)
 * @returns {Promise<Array>} todos 列表
 */
export async function getAllTodos(userId, { includeCompleted = true } = {}) {
  let query = supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!includeCompleted) {
    query = query.eq('is_complete', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

/**
 * 获取单个 todo
 * @param {string} id - todo ID
 * @param {string} userId - 用户 ID (权限验证)
 * @returns {Promise<Object>} todo 对象
 */
export async function getTodoById(id, userId) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * 创建新 todo
 * @param {string} userId - 用户 ID
 * @param {Object} todo - todo 数据
 * @param {string} todo.title - 标题 (必填)
 * @param {string} todo.description - 描述 (可选)
 * @param {string} todo.priority - 优先级: low|medium|high
 * @param {Date} todo.dueDate - 截止日期 (可选)
 * @returns {Promise<Object>} 新创建的 todo
 */
export async function createTodo(userId, { title, description, priority, dueDate }) {
  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: userId,
      title,
      description,
      priority: priority || 'medium',
      due_date: dueDate || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 更新 todo
 * @param {string} id - todo ID
 * @param {string} userId - 用户 ID (权限验证)
 * @param {Object} updates - 更新字段
 * @returns {Promise<Object>} 更新后的 todo
 */
export async function updateTodo(id, userId, updates) {
  // 移除 undefined 字段，避免覆盖为 null
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  )

  const { data, error } = await supabase
    .from('todos')
    .update(cleanUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 删除 todo
 * @param {string} id - todo ID
 * @param {string} userId - 用户 ID (权限验证)
 * @returns {Promise<void>}
 */
export async function deleteTodo(id, userId) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * 切换 todo 完成状态
 * @param {string} id - todo ID
 * @param {string} userId - 用户 ID (权限验证)
 * @returns {Promise<Object>} 更新后的 todo
 */
export async function toggleTodoComplete(id, userId) {
  // 先获取当前状态
  const { data: current } = await supabase
    .from('todos')
    .select('is_complete')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!current) throw new Error('Todo not found')

  // 切换状态
  const { data, error } = await supabase
    .from('todos')
    .update({ is_complete: !current.is_complete })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// 批量操作 (可选扩展)
// ============================================

/**
 * 批量删除已完成的 todos
 * @param {string} userId - 用户 ID
 * @returns {Promise<number>} 删除数量
 */
export async function clearCompletedTodos(userId) {
  const { data, error } = await supabase
    .from('todos')
    .delete()
    .eq('user_id', userId)
    .eq('is_complete', true)
    .select()

  if (error) throw error
  return data?.length || 0
}

/**
 * 获取统计信息
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} { total, completed, pending, byPriority }
 */
export async function getTodosStats(userId) {
  const { data, error } = await supabase
    .from('todos')
    .select('is_complete, priority')

  if (error) throw error

  const total = data.length
  const completed = data.filter(t => t.is_complete).length
  const pending = total - completed

  const byPriority = {
    high: data.filter(t => t.priority === 'high').length,
    medium: data.filter(t => t.priority === 'medium').length,
    low: data.filter(t => t.priority === 'low').length
  }

  return { total, completed, pending, byPriority }
}
