/**
 * [INPUT]: 依赖 react 的 useState/useEffect/useRef/useMemo/useCallback, 依赖 framer-motion 的 motion/AnimatePresence, 依赖 @/lib/supabase 的 supabase, 依赖 lucide-react 的 Star/Settings/Clock, 依赖 @/contexts/AuthContext 的 useAuth
 * [OUTPUT]: 导出 LifeChroniclesDashboard 人生旅程动态仪表盘,双视图切换/金色锚点/流光动画/Apple 气泡/8位小数精度
 * [POS]: 布局层底部固定组件,实时显示生命进度与任务里程碑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Settings, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// ============================================
// 配置常量
// ============================================

const STORAGE_KEY = 'life-chronicles-config'
const GOLD_STAR_COLOR = '#FFD700'
const FLOW_GRADIENT = 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)'

// ============================================
// 金色锚点组件 (memo 优化)
// ============================================

const GoldStarAnchor = memo(({ milestone, position, onHover }) => {
  const [isHovered, setIsHovered] = useState(false)
  const date = new Date(milestone.completed_at).toLocaleDateString('zh-CN')

  return (
    <motion.div
      className="absolute -top-1 group"
      style={{ left: `${position}%` }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        delay: position * 0.01, // 错开动画
      }}
      onHoverStart={() => {
        setIsHovered(true)
        onHover(milestone)
      }}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* 金色光晕 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{ background: GOLD_STAR_COLOR }}
          />
        )}
      </AnimatePresence>

      {/* 星星图标 */}
      <motion.div
        animate={isHovered ? {
          scale: [1, 1.3, 1],
          rotate: [0, 15, -15, 0],
        } : {}}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Star
          className="w-4 h-4 cursor-pointer transition-transform hover:scale-110"
          style={{ fill: GOLD_STAR_COLOR, color: GOLD_STAR_COLOR }}
        />
      </motion.div>

      {/* 气泡提示 */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 whitespace-nowrap z-50"
          style={{
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          <div className="text-xs font-semibold text-gray-900">
            ⭐ {milestone.title}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {date} 完成
          </div>
          {/* 小三角 */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-white/90" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
})

// ============================================
// 主组件 - LifeChroniclesDashboard
// ============================================

export function LifeChroniclesDashboard() {
  const { user } = useAuth()
  const rafRef = useRef(null)
  const updateIntervalRef = useRef(null)

  // ============================================
  // 配置状态
  // ============================================

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {
      birthDate: '1990-01-01',
      lifeExpectancy: 80,
      viewMode: 'days', // 'days' | 'weeks'
      showSettings: false,
    }
  })

  const [lifeData, setLifeData] = useState({
    elapsed: 0,
    total: 0,
    remaining: 0,
    percentage: 0, // 8位小数精度
    elapsedUnits: 0,
    remainingUnits: 0,
    unitName: '',
  })

  const [milestones, setMilestones] = useState([])
  const [hoveredMilestone, setHoveredMilestone] = useState(null)
  const [showBubble, setShowBubble] = useState(false)
  const [newMilestonePulse, setNewMilestonePulse] = useState(null)

  // ============================================
  // 核心计算逻辑 (requestAnimationFrame 驱动)
  // ============================================

  const calculateLifeStats = useCallback(() => {
    const birth = new Date(config.birthDate)
    const now = new Date()
    const death = new Date(birth)
    death.setFullYear(birth.getFullYear() + config.lifeExpectancy)

    const elapsed = now - birth
    const total = death - birth
    const remaining = death - now

    // 高精度百分比 (8位小数)
    const percentage = Math.min((elapsed / total) * 100, 100)

    // 计算单位
    let unitName, elapsedUnits, remainingUnits
    if (config.viewMode === 'days') {
      unitName = '天'
      elapsedUnits = Math.floor(elapsed / (1000 * 60 * 60 * 24))
      remainingUnits = Math.floor(remaining / (1000 * 60 * 60 * 24))
    } else {
      unitName = '周'
      elapsedUnits = Math.floor(elapsed / (1000 * 60 * 60 * 24 * 7))
      remainingUnits = Math.floor(remaining / (1000 * 60 * 60 * 24 * 7))
    }

    setLifeData({
      elapsed,
      total,
      remaining,
      percentage,
      elapsedUnits,
      remainingUnits,
      unitName,
    })
  }, [config])

  // ============================================
  // 启动实时计算 (RAF + 非阻塞更新)
  // ============================================

  useEffect(() => {
    let lastUpdateTime = 0
    const UPDATE_INTERVAL = 100 // 数字每 100ms 更新一次

    const animate = (timestamp) => {
      if (timestamp - lastUpdateTime >= UPDATE_INTERVAL) {
        calculateLifeStats()
        lastUpdateTime = timestamp
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [calculateLifeStats])

  // ============================================
  // 获取金色锚点 (重大项目)
  // ============================================

  useEffect(() => {
    if (!user) return

    const fetchMilestones = async () => {
      const { data } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'Major Project') // 标记为重大项目
        .eq('status', 'completed')
        .order('completed_at', { ascending: true })

      if (data) {
        setMilestones(data)
      }
    }

    fetchMilestones()

    // 实时订阅
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const todo = payload.new
          if (todo.category === 'Major Project' && todo.status === 'completed') {
            // 触发金光闪烁特效
            setNewMilestonePulse({
              title: todo.title,
              completed_at: todo.updated_at || todo.created_at,
            })

            setTimeout(() => setNewMilestonePulse(null), 2000)
          }

          // 重新获取锚点
          fetchMilestones()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // ============================================
  // 计算锚点位置
  // ============================================

  const anchorPositions = useMemo(() => {
    const birth = new Date(config.birthDate)
    return milestones.map((milestone) => {
      const completedTime = new Date(milestone.completed_at || milestone.created_at).getTime()
      const elapsed = completedTime - birth.getTime()
      return (elapsed / lifeData.total) * 100
    })
  }, [milestones, lifeData.total, config.birthDate])

  // ============================================
  // 配置持久化
  // ============================================

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // ============================================
  // 渲染
  // ============================================

  return (
    <>
      {/* 底部进度条 - 4px 高度 */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* 进度条容器 */}
        <div
          className="relative h-1 bg-gray-200 cursor-pointer group"
          style={{
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => setShowBubble(!showBubble)}
        >
          {/* 已度过部分 - GPU 加速 (transform: scaleX) */}
          <motion.div
            className="absolute top-0 left-0 h-full origin-left"
            style={{
              background: FLOW_GRADIENT,
              transformOrigin: 'left',
            }}
            animate={{
              scaleX: lifeData.percentage / 100,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }}
          />

          {/* 流光动画 */}
          <motion.div
            className="absolute top-0 bottom-0 w-32"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            }}
            animate={{
              x: ['-10%', '110%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* 新完成的任务 - 金光闪烁特效 */}
          <AnimatePresence>
            {newMilestonePulse && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 2, 3],
                  opacity: [1, 0.8, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                style={{
                  left: `${lifeData.percentage}%`,
                  background: GOLD_STAR_COLOR,
                  boxShadow: '0 0 20px 5px rgba(255, 215, 0, 0.6)',
                }}
              />
            )}
          </AnimatePresence>

          {/* 金色锚点 */}
          {anchorPositions.map((position, i) => (
            <GoldStarAnchor
              key={milestones[i].id}
              milestone={milestones[i]}
              position={position}
              onHover={setHoveredMilestone}
            />
          ))}
        </div>

        {/* Apple 风格气泡提示 */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4"
            >
              <div
                className="px-6 py-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 min-w-[300px]"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                }}
              >
                {/* 内容 */}
                {hoveredMilestone ? (
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {hoveredMilestone.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(hoveredMilestone.completed_at || hoveredMilestone.created_at).toLocaleDateString('zh-CN')} 完成
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 百分比 - 8位小数 */}
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {lifeData.percentage.toFixed(8)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">生命进度</div>
                    </div>

                    {/* 数值 */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-semibold text-gray-900">
                          {lifeData.elapsedUnits.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">已度过{lifeData.unitName}</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-gray-900">
                          {lifeData.remainingUnits.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">剩余{lifeData.unitName}</div>
                      </div>
                    </div>

                    {/* 小三角 */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-white/90" />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 设置按钮 */}
        <motion.button
          onClick={() => updateConfig('showSettings', !config.showSettings)}
          className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </motion.button>
      </div>

      {/* 设置面板 */}
      <AnimatePresence>
        {config.showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50"
          >
            <div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 min-w-[280px]"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              }}
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                设置
              </h3>

              {/* 出生日期 */}
              <div className="space-y-2 mb-4">
                <label className="text-sm text-gray-700">出生日期</label>
                <input
                  type="date"
                  value={config.birthDate}
                  onChange={(e) => updateConfig('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 预期寿命 */}
              <div className="space-y-2 mb-4">
                <label className="text-sm text-gray-700">预期寿命</label>
                <input
                  type="number"
                  value={config.lifeExpectancy}
                  onChange={(e) => updateConfig('lifeExpectancy', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="120"
                />
              </div>

              {/* 视图模式 */}
              <div className="space-y-2">
                <label className="text-sm text-gray-700">显示模式</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateConfig('viewMode', 'days')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      config.viewMode === 'days'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    天数
                  </button>
                  <button
                    onClick={() => updateConfig('viewMode', 'weeks')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      config.viewMode === 'weeks'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    周数
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LifeChroniclesDashboard
