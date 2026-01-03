/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 @/lib/todos 的 CRUD 函数, 依赖 @/lib/googleCalendar 的 日历同步, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 @/components/AuthModal 的 AuthModal, 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/input 的 Input
 * [OUTPUT]: 导出 TodosPage 完整页面,todos 列表/增删改查/筛选统计/登录弹窗/日历同步,渐变背景 + 微拟物设计
 * [POS]: pages 层 todos 应用页,核心功能页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  clearCompletedTodos,
  getTodosStats
} from '@/lib/todos'
import { staggerContainer, staggerItem, tapScale, hoverLift } from '@/lib/motion'
import {
  loadGoogleAPI,
  isGoogleAuthenticated,
  googleSignIn,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '@/lib/googleCalendar'

// ============================================
// 子组件 - 统计卡片 (升级版)
// ============================================

function StatCard({ label, value, icon: Icon, color, bgGradient }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverLift.hover}
      className={`relative overflow-hidden rounded-2xl p-6 ${bgGradient} shadow-lg`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/80">{label}</span>
          {Icon && <Icon className={`w-5 h-5 ${color}`} />}
        </div>
        <div className="text-4xl font-bold text-white">{value}</div>
      </div>
    </motion.div>
  )
}

// ============================================
// 子组件 - Todo 表单 (升级版)
// ============================================

function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({ title, priority })
      setTitle('')
      setPriority('medium')
    } finally {
      setIsSubmitting(false)
    }
  }

  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  }

  return (
    <motion.form
      variants={staggerItem}
      onSubmit={handleSubmit}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
      style={{
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      }}
    >
      <div className="flex gap-3">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加新任务..."
          className="flex-1 bg-white/50 border-white/30"
          disabled={isSubmitting}
        />
        <motion.button
          type="submit"
          variants={tapScale}
          whileTap="pressed"
          disabled={isSubmitting || !title.trim()}
          className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-shadow"
          style={{
            boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)'
          }}
        >
          {isSubmitting ? '添加中...' : '添加'}
        </motion.button>
      </div>
      <div className="flex gap-2 mt-3">
        {['low', 'medium', 'high'].map((p) => (
          <motion.button
            key={p}
            type="button"
            variants={tapScale}
            whileTap="pressed"
            onClick={() => setPriority(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              priority === p
                ? `${priorityColors[p]} text-white shadow-lg`
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            {p === 'low' ? '低' : p === 'medium' ? '中' : '高'}
          </motion.button>
        ))}
      </div>
    </motion.form>
  )
}

// ============================================
// 子组件 - Todo 列表项 (升级版 + 日历同步)
// ============================================

function TodoItem({ todo, onToggle, onDelete, onPriorityChange, onSyncToCalendar, onUnsyncFromCalendar, isSyncing }) {
  const priorityConfig = {
    low: {
      color: 'text-blue-500',
      bg: 'bg-blue-500',
      label: '低',
      gradient: 'from-blue-400 to-blue-600'
    },
    medium: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500',
      label: '中',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    high: {
      color: 'text-red-500',
      bg: 'bg-red-500',
      label: '高',
      gradient: 'from-red-400 to-red-600'
    }
  }

  const config = priorityConfig[todo.priority]

  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverLift.hover}
      className={`relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all ${
        todo.is_complete ? 'opacity-60' : ''
      }`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      }}
    >
      {/* 优先级指示条 */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.gradient}`} />

      {/* 日历同步标记 */}
      {todo.is_synced_to_calendar && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            已同步
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* 完成状态复选框 */}
        <motion.button
          onClick={() => onToggle(todo.id)}
          variants={tapScale}
          whileTap="pressed"
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.is_complete
              ? 'bg-gradient-to-r from-green-400 to-green-600 border-green-500'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {todo.is_complete && (
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg ${todo.is_complete ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${config.gradient}`}>
              优先级: {config.label}
            </span>
            {todo.due_date && (
              <span className="text-xs text-gray-400">
                截止: {new Date(todo.due_date).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <select
            value={todo.priority}
            onChange={(e) => onPriorityChange(todo.id, e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border-0 bg-gray-100 text-gray-700 focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>

          {/* 日历同步按钮 */}
          {todo.is_synced_to_calendar ? (
            <motion.button
              onClick={() => onUnsyncFromCalendar(todo.id, todo.google_calendar_event_id)}
              variants={tapScale}
              whileTap="pressed"
              disabled={isSyncing}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="取消日历同步"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => onSyncToCalendar(todo.id)}
              variants={tapScale}
              whileTap="pressed"
              disabled={isSyncing}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                isSyncing
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="同步到日历"
            >
              {isSyncing ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </motion.button>
          )}

          <motion.button
            onClick={() => onDelete(todo.id)}
            variants={tapScale}
            whileTap="pressed"
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// 主页面 - TodosPage
// ============================================

export function TodosPage() {
  const { user, loading: authLoading } = useAuth()
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false)
  const [syncingTodoId, setSyncingTodoId] = useState(null)

  // 加载 Google API
  useEffect(() => {
    if (user && !googleApiLoaded) {
      loadGoogleAPI()
        .then(() => setGoogleApiLoaded(true))
        .catch(() => console.log('Google API 加载失败'))
    }
  }, [user])

  // 加载 todos
  const loadTodos = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const data = await getAllTodos(user.id, { includeCompleted: true })
      setTodos(data)

      const statsData = await getTodosStats(user.id)
      setStats(statsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadTodos()
    }
  }, [user, authLoading])

  // 创建 todo
  const handleCreateTodo = async ({ title, priority }) => {
    if (!user) return

    try {
      const newTodo = await createTodo(user.id, { title, priority })
      setTodos([newTodo, ...todos])
      await loadTodos()
    } catch (err) {
      setError(err.message)
    }
  }

  // 切换完成状态
  const handleToggle = async (id) => {
    if (!user) return

    try {
      await toggleTodoComplete(id, user.id)
      setTodos(todos.map(t =>
        t.id === id ? { ...t, is_complete: !t.is_complete } : t
      ))
      await loadTodos()
    } catch (err) {
      setError(err.message)
    }
  }

  // 删除 todo
  const handleDelete = async (id) => {
    if (!user) return

    try {
      await deleteTodo(id, user.id)
      setTodos(todos.filter(t => t.id !== id))
      await loadTodos()
    } catch (err) {
      setError(err.message)
    }
  }

  // 修改优先级
  const handlePriorityChange = async (id, priority) => {
    if (!user) return

    try {
      await updateTodo(id, user.id, { priority })
      setTodos(todos.map(t =>
        t.id === id ? { ...t, priority } : t
      ))
    } catch (err) {
      setError(err.message)
    }
  }

  // 清除已完成
  const handleClearCompleted = async () => {
    if (!user) return

    try {
      await clearCompletedTodos(user.id)
      await loadTodos()
    } catch (err) {
      setError(err.message)
    }
  }

  // 同步到 Google Calendar
  const handleSyncToCalendar = async (todoId) => {
    if (!user) return

    try {
      setSyncingTodoId(todoId)

      // 检查 Google 认证状态
      if (!isGoogleAuthenticated()) {
        await googleSignIn()
      }

      const todo = todos.find(t => t.id === todoId)
      if (!todo) throw new Error('任务不存在')

      // 计算事件时间（使用当前时间作为开始时间，1小时后作为结束时间）
      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

      // 创建日历事件
      const eventId = await createCalendarEvent({
        title: todo.title,
        description: todo.description || `优先级: ${todo.priority}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })

      // 更新 todo
      await updateTodo(todoId, user.id, {
        google_calendar_event_id: eventId,
        is_synced_to_calendar: true
      })

      await loadTodos()
    } catch (err) {
      console.error('同步失败:', err)
      setError(err.message || '同步失败，请检查 Google 授权')
    } finally {
      setSyncingTodoId(null)
    }
  }

  // 取消日历同步
  const handleUnsyncFromCalendar = async (todoId, eventId) => {
    if (!user) return

    try {
      setSyncingTodoId(todoId)

      // 删除日历事件
      await deleteCalendarEvent(eventId)

      // 更新 todo
      await updateTodo(todoId, user.id, {
        google_calendar_event_id: null,
        is_synced_to_calendar: false
      })

      await loadTodos()
    } catch (err) {
      console.error('取消同步失败:', err)
      setError(err.message || '取消同步失败')
    } finally {
      setSyncingTodoId(null)
    }
  }

  // 筛选 todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.is_complete
    if (filter === 'completed') return todo.is_complete
    return true
  })

  // 未登录状态
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-4">请先登录</h1>
            <p className="text-gray-600">登录后即可使用 Todos 功能</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => setAuthModalOpen(true)}
              size="lg"
              className="gap-2 px-8 py-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              style={{
                boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.5)'
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* 统计卡片 */}
        {stats && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <StatCard
              label="总任务"
              value={stats.total}
              icon={() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              color="text-white"
              bgGradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <StatCard
              label="已完成"
              value={stats.completed}
              icon={() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="text-white"
              bgGradient="bg-gradient-to-br from-green-400 to-emerald-600"
            />
            <StatCard
              label="进行中"
              value={stats.pending}
              icon={() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="text-white"
              bgGradient="bg-gradient-to-br from-blue-400 to-cyan-600"
            />
          </motion.div>
        )}

        {/* 添加表单 */}
        <TodoForm onSubmit={handleCreateTodo} />

        {/* 筛选器 */}
        <motion.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="flex gap-2 mt-8 mb-6"
        >
          {['all', 'active', 'completed'].map((f) => (
            <motion.button
              key={f}
              variants={tapScale}
              whileTap="pressed"
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'
              }`}
            >
              {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
            </motion.button>
          ))}
          {stats?.completed > 0 && (
            <motion.button
              variants={tapScale}
              whileTap="pressed"
              onClick={handleClearCompleted}
              className="ml-auto px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              清除已完成
            </motion.button>
          )}
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4"
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

        {/* Todos 列表 */}
        {!loading && filteredTodos.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onPriorityChange={handlePriorityChange}
                onSyncToCalendar={handleSyncToCalendar}
                onUnsyncFromCalendar={handleUnsyncFromCalendar}
                isSyncing={syncingTodoId === todo.id}
              />
            ))}
          </motion.div>
        )}

        {/* 空状态 */}
        {!loading && filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {filter === 'all' ? '暂无任务，开始添加吧！' : '该分类下暂无任务'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TodosPage
