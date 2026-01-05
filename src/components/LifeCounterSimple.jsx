/**
 * [INPUT]: 依赖 react 的 useState/useEffect
 * [OUTPUT]: 导出 LifeCounterSimple 简化版人生计时器
 * [POS]: components 层简化版人生进度条,不依赖认证系统
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'life-counter-config'

export function LifeCounterSimple() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {
      birthDate: '1990-01-01',
      lifeExpectancy: 80,
    }
  })

  const [percentage, setPercentage] = useState(0)

  // 计算生命进度
  useEffect(() => {
    const calculate = () => {
      const birth = new Date(config.birthDate)
      const now = new Date()
      const death = new Date(birth)
      death.setFullYear(birth.getFullYear() + config.lifeExpectancy)

      const elapsed = now - birth
      const total = death - birth
      const pct = Math.min((elapsed / total) * 100, 100)

      setPercentage(pct)
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [config])

  // 保存配置
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
    }}>
      {/* 进度条容器 */}
      <div
        style={{
          height: '4px',
          background: '#e5e7eb',
          cursor: 'pointer',
        }}
        onClick={() => {
          const newDate = prompt('请输入出生日期 (YYYY-MM-DD):', config.birthDate)
          if (newDate) {
            setConfig(prev => ({ ...prev, birthDate: newDate }))
          }
        }}
      >
        {/* 进度 */}
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            transition: 'width 0.3s ease',
          }}
        />

        {/* 流光效果 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '128px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            animation: 'flow 2s linear infinite',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 设置按钮 */}
      <button
        onClick={() => {
          const newExpectancy = prompt('请输入预期寿命:', config.lifeExpectancy)
          if (newExpectancy && !isNaN(Number(newExpectancy))) {
            setConfig(prev => ({ ...prev, lifeExpectancy: Number(newExpectancy) }))
          }
        }}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          padding: '4px 8px',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10000,
        }}
      >
        ⚙ 设置
      </button>

      <style>{`
        @keyframes flow {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(800px); }
        }
      `}</style>
    </div>
  )
}
