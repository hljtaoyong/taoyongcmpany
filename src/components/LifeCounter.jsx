/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 framer-motion 的 motion
 * [OUTPUT]: 导出 LifeCounter 人生倒数计时器组件,显示已活时间、剩余时间、流逝百分比
 * [POS]: 布局层底部固定组件,显示人生计时和"时间在流逝"
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function LifeCounter({ birthDate = '1990-01-01', lifeExpectancy = 80 }) {
  const [lifeStats, setLifeStats] = useState(null)

  useEffect(() => {
    const calculateLifeStats = () => {
      const birth = new Date(birthDate)
      const now = new Date()
      const death = new Date(birth)
      death.setFullYear(birth.getFullYear() + lifeExpectancy)

      // 已经过去的时间（毫秒）
      const elapsed = now - birth
      // 总人生时间（毫秒）
      const total = death - birth
      // 剩余时间（毫秒）
      const remaining = death - now

      // 已活百分比
      const percentage = Math.min((elapsed / total) * 100, 100)

      // 计算年龄
      const ageInDays = Math.floor(elapsed / (1000 * 60 * 60 * 24))
      const years = Math.floor(ageInDays / 365.25)
      const days = Math.floor(ageInDays % 365.25)

      // 剩余时间
      const remainingDays = Math.floor(remaining / (1000 * 60 * 60 * 24))
      const remainingYears = Math.floor(remainingDays / 365.25)
      const remainingDaysRemainder = Math.floor(remainingDays % 365.25)

      setLifeStats({
        years,
        days,
        remainingYears,
        remainingDays: remainingDaysRemainder,
        percentage,
        ageInDays
      })
    }

    calculateLifeStats()
    const interval = setInterval(calculateLifeStats, 1000)

    return () => clearInterval(interval)
  }, [birthDate, lifeExpectancy])

  if (!lifeStats) return null

  const { years, days, remainingYears, remainingDays, percentage, ageInDays } = lifeStats

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700/50 z-40">
      <div className="flex items-center justify-between px-8 py-4">
        {/* 左侧 - 时间进度 */}
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
              <span className="text-sm text-gray-400">已活</span>
            </div>
            <p className="text-2xl font-bold">
              {years}<span className="text-lg text-gray-400 ml-1">年</span>
              {days}<span className="text-lg text-gray-400 ml-1">天</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">剩余</span>
            </div>
            <p className="text-2xl font-bold">
              {remainingYears}<span className="text-lg text-gray-400 ml-1">年</span>
              {remainingDays}<span className="text-lg text-gray-400 ml-1">天</span>
            </p>
          </div>
        </div>

        {/* 中间 - 进度条 */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {/* 闪烁的光效 */}
            <motion.div
              className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">出生</span>
            <span className="text-sm font-semibold text-purple-400">{percentage.toFixed(2)}%</span>
            <span className="text-xs text-gray-500">终点</span>
          </div>
        </div>

        {/* 右侧 - 哲学文字 */}
        <div className="text-right">
          <motion.p
            key={ageInDays}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            时间在流逝
          </motion.p>
          <p className="text-xs text-gray-500">
            第 {ageInDays.toLocaleString()} 天
          </p>
        </div>
      </div>

      {/* 装饰性渐变光效 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </div>
  )
}
