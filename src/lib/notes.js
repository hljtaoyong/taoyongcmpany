/**
 * [INPUT]: 依赖 @/lib/supabase 的 supabase 客户端
 * [OUTPUT]: 导出便签 CRUD 操作函数 - getAll/getById/create/update/delete/togglePin
 * [POS]: lib 层便签数据操作模块,被 NotesPage 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { supabase } from './supabase'

// ============================================
// 获取所有便签
// ============================================

/**
 * 获取用户的所有便签
 * @param {string} userId - 用户 ID
 * @returns {Promise<Array>}
 */
export async function getAllNotes(userId) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('获取便签失败:', error)
    throw error
  }

  return data
}

// ============================================
// 获取单个便签
// ============================================

/**
 * 根据 ID 获取便签
 * @param {string} noteId - 便签 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function getNoteById(noteId, userId) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('获取便签失败:', error)
    throw error
  }

  return data
}

// ============================================
// 创建便签
// ============================================

/**
 * 创建新便签
 * @param {string} userId - 用户 ID
 * @param {Object} noteData - 便签数据
 * @returns {Promise<Object>}
 */
export async function createNote(userId, noteData) {
  const { title, content, color = 'yellow' } = noteData

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: title || null,
      content,
      color,
      is_pinned: false,
    })
    .select()
    .single()

  if (error) {
    console.error('创建便签失败:', error)
    throw error
  }

  return data
}

// ============================================
// 更新便签
// ============================================

/**
 * 更新便签
 * @param {string} noteId - 便签 ID
 * @param {string} userId - 用户 ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateNote(noteId, userId, updates) {
  const updateData = {}

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.color !== undefined) updateData.color = updates.color

  const { data, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('更新便签失败:', error)
    throw error
  }

  return data
}

// ============================================
// 删除便签
// ============================================

/**
 * 删除便签
 * @param {string} noteId - 便签 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<void>}
 */
export async function deleteNote(noteId, userId) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) {
    console.error('删除便签失败:', error)
    throw error
  }
}

// ============================================
// 切换置顶状态
// ============================================

/**
 * 切换便签置顶状态
 * @param {string} noteId - 便签 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function toggleNotePin(noteId, userId) {
  // 先获取当前状态
  const note = await getNoteById(noteId, userId)

  const { data, error } = await supabase
    .from('notes')
    .update({ is_pinned: !note.is_pinned })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('切换置顶状态失败:', error)
    throw error
  }

  return data
}
