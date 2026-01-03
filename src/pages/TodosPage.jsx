/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 @/lib/todos 的 CRUD 函数, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设
 * [OUTPUT]: 导出 TodosPage 完整页面,todos 列表/增删改查/筛选统计
 * [POS]: pages 层 todos 应用页,核心功能页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
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

// ============================================
// 子组件 - 统计卡片
// ============================================

function StatCard({ label, value, color }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverLift.hover}
      className="bg-card rounded-xl p-4 border border-border shadow-sm"
    >
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </motion.div>
  )
}

// ============================================
// 子组件 - Todo 表单
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

  return (
    <motion.form
      variants={staggerItem}
      onSubmit={handleSubmit}
      className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="添加新任务..."
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isSubmitting}
        >
          <option value="low">低优先级</option>
          <option value="medium">中优先级</option>
          <option value="high">高优先级</option>
        </select>
        <motion.button
          type="submit"
          variants={tapScale}
          whileTap="pressed"
          disabled={isSubmitting || !title.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '添加中...' : '添加'}
        </motion.button>
      </div>
    </motion.form>
  )
}

// ============================================
// 子组件 - Todo 列表项
// ============================================

function TodoItem({ todo, onToggle, onDelete, onPriorityChange }) {
  const priorityColors = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  }

  const priorityLabels = {
    low: '低',
    medium: '中',
    high: '高'
  }

  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverLift.hover}
      className={`bg-card rounded-lg p-4 border border-border shadow-sm transition-all ${
        todo.is_complete ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 完成状态复选框 */}
        <motion.button
          onClick={() => onToggle(todo.id)}
          variants={tapScale}
          whileTap="pressed"
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            todo.is_complete
              ? 'bg-primary border-primary'
              : 'border-border hover:border-primary'
          }`}
        >
          {todo.is_complete && (
            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${todo.is_complete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className={priorityColors[todo.priority]}>
              优先级: {priorityLabels[todo.priority]}
            </span>
            {todo.due_date && (
              <span>截止: {new Date(todo.due_date).toLocaleDateString('zh-CN')}</span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <select
            value={todo.priority}
            onChange={(e) => onPriorityChange(todo.id, e.target.value)}
            className="text-xs px-2 py-1 rounded border border-input bg-background"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
          <motion.button
            onClick={() => onDelete(todo.id)}
            variants={tapScale}
            whileTap="pressed"
            className="p-1 text-destructive hover:bg-destructive/10 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const [filter, setFilter] = useState('all') // all | active | completed
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 加载 todos
  const loadTodos = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const data = await getAllTodos(user.id, { includeCompleted: true })
      setTodos(data)

      // 加载统计
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
      await loadTodos() // 刷新统计
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
      await loadTodos() // 刷新统计
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
      await loadTodos() // 刷新统计
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

  // 筛选 todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.is_complete
    if (filter === 'completed') return todo.is_complete
    return true
  })

  // 未登录状态
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">请先登录</h1>
          <p className="text-muted-foreground">登录后即可使用 Todos 功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">我的任务</h1>
          <p className="text-muted-foreground mt-2">高效管理你的日常任务</p>
        </motion.div>

        {/* 统计卡片 */}
        {stats && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <StatCard label="总任务" value={stats.total} color="text-foreground" />
            <StatCard label="已完成" value={stats.completed} color="text-green-500" />
            <StatCard label="进行中" value={stats.pending} color="text-blue-500" />
          </motion.div>
        )}

        {/* 添加表单 */}
        <TodoForm onSubmit={handleCreateTodo} />

        {/* 筛选器 */}
        <motion.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="flex gap-2 mt-6 mb-4"
        >
          {['all', 'active', 'completed'].map((f) => (
            <motion.button
              key={f}
              variants={tapScale}
              whileTap="pressed"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
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
              className="ml-auto px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg"
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
            className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            加载中...
          </div>
        )}

        {/* Todos 列表 */}
        {!loading && filteredTodos.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onPriorityChange={handlePriorityChange}
              />
            ))}
          </motion.div>
        )}

        {/* 空状态 */}
        {!loading && filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            {filter === 'all' ? '暂无任务，开始添加吧！' : '该分类下暂无任务'}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TodosPage
