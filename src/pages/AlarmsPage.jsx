/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 @/lib/alarms 的 CRUD 函数, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 @/components/AuthModal 的 AuthModal, 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/input 的 Input
 * [OUTPUT]: 导出 AlarmsPage 完整页面,闹钟列表/增删改查/浏览器通知,渐变背景 + 微拟物设计
 * [POS]: pages 层闹钟应用页,核心功能页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllAlarms,
  createAlarm,
  updateAlarm,
  deleteAlarm,
  toggleAlarmActive,
  markAlarmCompleted,
  clearCompletedAlarms
} from '@/lib/alarms'
import { staggerContainer, staggerItem, tapScale, hoverLift } from '@/lib/motion'

// ============================================
// 浏览器通知工具
// ============================================

// 请求通知权限
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// 发送通知
function sendNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })
  }
}

// ============================================
// 子组件 - 闹钟表单
// ============================================

function AlarmForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [alarmTime, setAlarmTime] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState('daily')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !alarmTime) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title,
        description,
        alarmTime: new Date(alarmTime).toISOString(),
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : null
      })
      setTitle('')
      setDescription('')
      setAlarmTime('')
      setIsRecurring(false)
      setRecurrencePattern('daily')
    } finally {
      setIsSubmitting(false)
    }
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
      <div className="space-y-4">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="闹钟标题..."
          className="bg-white/50 border-white/30"
          disabled={isSubmitting}
        />
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述（可选）..."
          className="bg-white/50 border-white/30"
          disabled={isSubmitting}
        />
        <Input
          type="datetime-local"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
          className="bg-white/50 border-white/30"
          disabled={isSubmitting}
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">重复闹钟</span>
          </label>

          {isRecurring && (
            <select
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/50 border border-white/30 text-sm"
            >
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          )}
        </div>

        <motion.button
          type="submit"
          variants={tapScale}
          whileTap="pressed"
          disabled={isSubmitting || !title.trim() || !alarmTime}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-shadow"
          style={{
            boxShadow: '0 4px 14px 0 rgba(251, 146, 60, 0.4)'
          }}
        >
          {isSubmitting ? '添加中...' : '添加闹钟'}
        </motion.button>
      </div>
    </motion.form>
  )
}

// ============================================
// 子组件 - 闹钟列表项
// ============================================

function AlarmItem({ alarm, onToggle, onEdit, onDelete, onComplete }) {
  const isOverdue = new Date(alarm.alarm_time) < new Date() && !alarm.is_completed

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRecurrenceLabel = (pattern) => {
    const labels = {
      daily: '每天',
      weekly: '每周',
      monthly: '每月'
    }
    return labels[pattern] || ''
  }

  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverLift.hover}
      className={`relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all ${
        alarm.is_completed ? 'opacity-60' : ''
      } ${isOverdue ? 'ring-2 ring-red-400' : ''}`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      }}
    >
      {/* 状态指示条 */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        alarm.is_completed
          ? 'bg-gradient-to-b from-green-400 to-green-600'
          : isOverdue
          ? 'bg-gradient-to-b from-red-400 to-red-600'
          : 'bg-gradient-to-b from-orange-400 to-pink-500'
      }`} />

      <div className="flex items-start gap-4">
        {/* 开关 */}
        <motion.button
          onClick={() => onToggle(alarm.id)}
          variants={tapScale}
          whileTap="pressed"
          className={`mt-1 flex-shrink-0 w-12 h-6 rounded-full p-1 transition-all ${
            alarm.is_active
              ? 'bg-gradient-to-r from-orange-400 to-pink-500'
              : 'bg-gray-300'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
            alarm.is_active ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </motion.button>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg ${alarm.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {alarm.title}
          </h3>
          {alarm.description && (
            <p className="text-sm text-gray-500 mt-1">{alarm.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {formatTime(alarm.alarm_time)}
            </span>
            {alarm.is_recurring && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {getRecurrenceLabel(alarm.recurrence_pattern)}
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {!alarm.is_completed && (
            <motion.button
              onClick={() => onComplete(alarm.id)}
              variants={tapScale}
              whileTap="pressed"
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="标记完成"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          )}
          <motion.button
            onClick={() => onDelete(alarm.id)}
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
// 主页面 - AlarmsPage
// ============================================

export function AlarmsPage() {
  const { user, loading: authLoading } = useAuth()
  const [alarms, setAlarms] = useState([])
  const [notificationPermission, setNotificationPermission] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // 加载闹钟
  const loadAlarms = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const data = await getAllAlarms(user.id, { includeCompleted: true })
      setAlarms(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 初始化通知权限
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission === 'granted')
    }
  }, [])

  // 检查闹钟并触发通知
  useEffect(() => {
    if (!user || alarms.length === 0) return

    const interval = setInterval(async () => {
      const now = new Date()

      for (const alarm of alarms) {
        if (!alarm.is_active || alarm.is_completed) continue

        const alarmTime = new Date(alarm.alarm_time)
        const timeDiff = now - alarmTime

        // 如果闹钟时间已到（在最近 1 分钟内）
        if (timeDiff >= 0 && timeDiff < 60000) {
          sendNotification(alarm.title, {
            body: alarm.description || '闹钟响了！',
            tag: alarm.id,
            requireInteraction: true
          })

          // 如果不是循环闹钟，自动标记为完成
          if (!alarm.is_recurring) {
            await markAlarmCompleted(alarm.id, user.id)
            await loadAlarms()
          }
        }
      }
    }, 10000) // 每 10 秒检查一次

    return () => clearInterval(interval)
  }, [alarms, user])

  useEffect(() => {
    if (!authLoading && user) {
      loadAlarms()
    }
  }, [user, authLoading])

  // 创建闹钟
  const handleCreateAlarm = async (alarmData) => {
    if (!user) return

    try {
      // 请求通知权限
      if (!notificationPermission) {
        const granted = await requestNotificationPermission()
        if (granted) {
          setNotificationPermission(true)
        }
      }

      await createAlarm(user.id, alarmData)
      await loadAlarms()
    } catch (err) {
      setError(err.message)
    }
  }

  // 切换激活状态
  const handleToggle = async (id) => {
    if (!user) return

    try {
      await toggleAlarmActive(id, user.id)
      await loadAlarms()
    } catch (err) {
      setError(err.message)
    }
  }

  // 删除闹钟
  const handleDelete = async (id) => {
    if (!user) return

    try {
      await deleteAlarm(id, user.id)
      await loadAlarms()
    } catch (err) {
      setError(err.message)
    }
  }

  // 标记完成
  const handleComplete = async (id) => {
    if (!user) return

    try {
      await markAlarmCompleted(id, user.id)
      await loadAlarms()
    } catch (err) {
      setError(err.message)
    }
  }

  // 活跃闹钟
  const activeAlarms = alarms.filter(a => !a.is_completed)
  const completedCount = alarms.filter(a => a.is_completed).length

  // 未登录状态
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-4">请先登录</h1>
            <p className="text-gray-600">登录后即可使用闹钟功能</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => setAuthModalOpen(true)}
              size="lg"
              className="gap-2 px-8 py-6 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              style={{
                boxShadow: '0 10px 40px -10px rgba(251, 146, 60, 0.5)'
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent mb-3">
            闹钟提醒
          </h1>
          <p className="text-gray-600 text-lg">设置提醒，不错过任何重要时刻</p>
        </motion.div>

        {/* 通知权限提示 */}
        {!notificationPermission && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-6"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div>
                <p className="font-medium">开启通知权限</p>
                <p className="text-sm">添加闹钟时会自动请求浏览器通知权限</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 统计信息 */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="text-sm font-medium text-white/80 mb-1">活跃闹钟</div>
            <div className="text-4xl font-bold">{activeAlarms.length}</div>
          </motion.div>
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 text-gray-700 shadow-lg"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
            }}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">已完成</div>
            <div className="text-4xl font-bold">{completedCount}</div>
          </motion.div>
        </motion.div>

        {/* 添加表单 */}
        <AlarmForm onSubmit={handleCreateAlarm} />

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-6"
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

        {/* 闹钟列表 */}
        {!loading && activeAlarms.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4 mt-8"
          >
            {activeAlarms.map((alarm) => (
              <AlarmItem
                key={alarm.id}
                alarm={alarm}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onComplete={handleComplete}
              />
            ))}
          </motion.div>
        )}

        {/* 空状态 */}
        {!loading && activeAlarms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">暂无闹钟，创建一个吧！</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AlarmsPage
