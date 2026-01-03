/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 @/lib/notes 的 CRUD 函数, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 @/components/AuthModal 的 AuthModal, 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/input 的 Input, 依赖 @/components/ui/textarea 的 Textarea
 * [OUTPUT]: 导出 NotesPage 完整页面,便签网格/增删改查/置顶/颜色,渐变背景 + 微拟物设计
 * [POS]: pages 层便签应用页,核心功能页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  toggleNotePin
} from '@/lib/notes'
import { staggerContainer, staggerItem, tapScale, hoverLift } from '@/lib/motion'

// 颜色配置
const NOTE_COLORS = {
  yellow: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    hover: 'hover:bg-yellow-200',
    text: 'text-yellow-800'
  },
  pink: {
    bg: 'bg-pink-100',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-200',
    text: 'text-pink-800'
  },
  blue: {
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-200',
    text: 'text-blue-800'
  },
  green: {
    bg: 'bg-green-100',
    border: 'border-green-200',
    hover: 'hover:bg-green-200',
    text: 'text-green-800'
  },
  purple: {
    bg: 'bg-purple-100',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-200',
    text: 'text-purple-800'
  }
}

// ============================================
// 子组件 - 便签卡片
// ============================================

function NoteCard({ note, onEdit, onDelete, onTogglePin, onColorChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(note.title || '')
  const [content, setContent] = useState(note.content)

  const handleSave = async () => {
    await onEdit(note.id, { title, content })
    setIsEditing(false)
  }

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow

  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverLift.hover}
      className={`relative ${colorConfig.bg} ${colorConfig.border} border rounded-2xl p-5 transition-all ${
        note.is_pinned ? 'ring-2 ring-purple-400' : ''
      }`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      }}
    >
      {/* 置顶标记 */}
      {note.is_pinned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.5 4.5l-9 9-2.5-2.5-1.5 1.5 4 4L19 6l-1.5-1.5z" />
          </svg>
        </div>
      )}

      {isEditing ? (
        // 编辑模式
        <div className="space-y-3">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题"
            className="bg-white/50 border-white/30"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="内容..."
            className="w-full min-h-[120px] p-3 rounded-lg bg-white/50 border border-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-2">
            <motion.button
              variants={tapScale}
              whileTap="pressed"
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium shadow-md hover:bg-purple-600 transition-colors"
            >
              保存
            </motion.button>
            <motion.button
              variants={tapScale}
              whileTap="pressed"
              onClick={() => {
                setIsEditing(false)
                setTitle(note.title || '')
                setContent(note.content)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              取消
            </motion.button>
          </div>
        </div>
      ) : (
        // 查看模式
        <div>
          <h3 className={`font-semibold text-lg mb-2 ${colorConfig.text}`}>
            {note.title || '无标题'}
          </h3>
          <p className={`text-gray-700 whitespace-pre-wrap break-words ${colorConfig.text}`}>
            {note.content}
          </p>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10">
            <div className="flex gap-2">
              <motion.button
                variants={tapScale}
                whileTap="pressed"
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
                title="编辑"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
              <motion.button
                variants={tapScale}
                whileTap="pressed"
                onClick={() => onTogglePin(note.id)}
                className={`p-2 rounded-lg transition-colors ${
                  note.is_pinned ? 'text-purple-600 bg-purple-100' : 'text-gray-600 hover:bg-black/5'
                }`}
                title={note.is_pinned ? '取消置顶' : '置顶'}
              >
                <svg className="w-4 h-4" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </motion.button>
            </div>
            <div className="flex gap-2">
              {/* 颜色选择器 */}
              <div className="flex gap-1">
                {Object.keys(NOTE_COLORS).map((color) => (
                  <motion.button
                    key={color}
                    variants={tapScale}
                    whileTap="pressed"
                    onClick={() => onColorChange(note.id, color)}
                    className={`w-6 h-6 rounded-full ${NOTE_COLORS[color].bg} ${
                      NOTE_COLORS[color].border
                    } border-2 ${
                      note.color === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                    } transition-all`}
                    title={color}
                  />
                ))}
              </div>
              <motion.button
                variants={tapScale}
                whileTap="pressed"
                onClick={() => onDelete(note.id)}
                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// 子组件 - 新建便签表单
// ============================================

function NewNoteForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('yellow')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({ title, content, color })
      setTitle('')
      setContent('')
      setColor('yellow')
      onCancel()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${NOTE_COLORS[color].bg} ${NOTE_COLORS[color].border} border rounded-2xl p-6`}
      style={{
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题（可选）"
          className="bg-white/50 border-white/30"
          disabled={isSubmitting}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写点什么..."
          className="w-full min-h-[150px] p-3 rounded-lg bg-white/50 border border-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {Object.keys(NOTE_COLORS).map((c) => (
              <motion.button
                key={c}
                type="button"
                variants={tapScale}
                whileTap="pressed"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full ${NOTE_COLORS[c].bg} ${
                  NOTE_COLORS[c].border
                } border-2 ${
                  color === c ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                } transition-all`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <motion.button
              type="button"
              variants={tapScale}
              whileTap="pressed"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              type="submit"
              variants={tapScale}
              whileTap="pressed"
              disabled={isSubmitting || !content.trim()}
              className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-shadow"
              style={{
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)'
              }}
            >
              {isSubmitting ? '创建中...' : '创建'}
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}

// ============================================
// 主页面 - NotesPage
// ============================================

export function NotesPage() {
  const { user, loading: authLoading } = useAuth()
  const [notes, setNotes] = useState([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // 加载便签
  const loadNotes = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const data = await getAllNotes(user.id)
      setNotes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadNotes()
    }
  }, [user, authLoading])

  // 创建便签
  const handleCreateNote = async (noteData) => {
    if (!user) return

    try {
      await createNote(user.id, noteData)
      await loadNotes()
    } catch (err) {
      setError(err.message)
    }
  }

  // 编辑便签
  const handleEditNote = async (noteId, updates) => {
    if (!user) return

    try {
      await updateNote(noteId, user.id, updates)
      await loadNotes()
    } catch (err) {
      setError(err.message)
    }
  }

  // 删除便签
  const handleDeleteNote = async (noteId) => {
    if (!user) return

    try {
      await deleteNote(noteId, user.id)
      await loadNotes()
    } catch (err) {
      setError(err.message)
    }
  }

  // 切换置顶
  const handleTogglePin = async (noteId) => {
    if (!user) return

    try {
      await toggleNotePin(noteId, user.id)
      await loadNotes()
    } catch (err) {
      setError(err.message)
    }
  }

  // 修改颜色
  const handleColorChange = async (noteId, color) => {
    if (!user) return

    try {
      await updateNote(noteId, user.id, { color })
      await loadNotes()
    } catch (err) {
      setError(err.message)
    }
  }

  // 未登录状态
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-4">请先登录</h1>
            <p className="text-gray-600">登录后即可使用便签功能</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => setAuthModalOpen(true)}
              size="lg"
              className="gap-2 px-8 py-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              style={{
                boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.5)'
              }}
            >
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
              使用 Google 登录
            </Button>
          </motion.div>
        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-3">
              我的便签
            </h1>
            <p className="text-gray-600 text-lg">快速记录，捕捉灵感</p>
          </div>
          <motion.button
            variants={tapScale}
            whileTap="pressed"
            onClick={() => setShowNewForm(!showNewForm)}
            className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all ${
              showNewForm
                ? 'bg-gray-200 text-gray-700'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
            }`}
            style={
              !showNewForm
                ? { boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)' }
                : {}
            }
          >
            {showNewForm ? '取消' : '+ 新建便签'}
          </motion.button>
        </motion.div>

        {/* 新建表单 */}
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <NewNoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setShowNewForm(false)}
            />
          </motion.div>
        )}

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            加载中...
          </div>
        )}

        {/* 便签网格 */}
        {!loading && notes.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onColorChange={handleColorChange}
              />
            ))}
          </motion.div>
        )}

        {/* 空状态 */}
        {!loading && notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">暂无便签，创建一个吧！</p>
            <motion.button
              variants={tapScale}
              whileTap="pressed"
              onClick={() => setShowNewForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-medium shadow-lg"
              style={{
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)'
              }}
            >
              + 新建便签
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default NotesPage
