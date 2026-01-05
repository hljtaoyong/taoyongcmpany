/**
 * [INPUT]: 依赖 react 的 useState/useEffect/useCallback, 依赖 framer-motion 的 motion/AnimatePresence, 依赖 tesseract.js 的 OCR 引擎, 依赖 @/lib/supabase 的 supabase, 依赖 lucide-react 的图标
 * [OUTPUT]: 导出 OCRPanel 组件,提供截图/OCR/打字机动画/任务提取功能
 * [POS]: components/ 的 OCR 侧边栏组件,被 App 消费,与 NotesPage/TodosPage 联动
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Save, Loader2, ScanText, Sparkles, Check } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { downloadScreenshot, copyScreenshotToClipboard } from '@/lib/screenshot'

// ============================================
// 类型定义
// ============================================

interface OCRPanelProps {
  isOpen: boolean
  onClose: () => void
  imageData: string
  onExtractTask?: (text: string) => void
  onSaveNote?: (text: string) => void
}

interface TaskSuggestion {
  title: string
  due_date: string | null
  priority: 'high' | 'medium' | 'low'
  category: string
}

// ============================================
// 打字机动画 Hook
// ============================================

function useTypewriter(text: string, speed = 20) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      setIsComplete(false)
      return
    }

    let index = 0
    let timer: NodeJS.Timeout

    const type = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        timer = setTimeout(type, speed)
      } else {
        setIsComplete(true)
      }
    }

    type()

    return () => clearTimeout(timer)
  }, [text, speed])

  return { displayedText, isComplete }
}

// ============================================
// OCRPanel 主组件
// ============================================

export function OCRPanel({
  isOpen,
  onClose,
  imageData,
  onExtractTask,
  onSaveNote,
}: OCRPanelProps) {
  const { user } = useAuth()

  // OCR 状态
  const [ocrText, setOcrText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 打字机动画
  const { displayedText, isComplete: isTypewriterComplete } = useTypewriter(ocrText, 15)

  // 任务建议
  const [taskSuggestion, setTaskSuggestion] = useState<TaskSuggestion | null>(null)
  const [showTaskSuggestion, setShowTaskSuggestion] = useState(false)

  // 复制状态
  const [copied, setCopied] = useState(false)

  // Tesseract worker 引用
  const workerRef = useRef<Tesseract.Worker | null>(null)

  // ============================================
  // OCR 识别 (Tesseract.js)
  // ============================================

  const performOCR = useCallback(async () => {
    if (!imageData) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setOcrText('')
    setTaskSuggestion(null)
    setShowTaskSuggestion(false)

    try {
      // 创建 Tesseract Worker
      const worker = await createWorker('chi_sim+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      workerRef.current = worker

      // 执行 OCR
      const { data: { text } } = await worker.recognize(imageData)

      // 清理文本
      const cleanedText = text
        .split('\n')
        .filter(line => line.trim())
        .join('\n')
        .trim()

      if (!cleanedText) {
        throw new Error('未能识别出文字，请确保图片清晰')
      }

      setOcrText(cleanedText)

      // 分析任务建议
      await analyzeTaskSuggestions(cleanedText)
    } catch (err) {
      console.error('OCR failed:', err)
      setError(err instanceof Error ? err.message : 'OCR 识别失败')
    } finally {
      setIsProcessing(false)
      // 终止 worker
      if (workerRef.current) {
        await workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [imageData])

  // ============================================
  // AI 任务建议分析
  // ============================================

  const analyzeTaskSuggestions = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-task-breakdown', {
        body: { input: text, analyzeOnly: true },
      })

      if (error) throw error

      if (data?.tasks?.[0]) {
        setTaskSuggestion(data.tasks[0])
        // 延迟显示建议
        setTimeout(() => setShowTaskSuggestion(true), 1000)
      }
    } catch (err) {
      console.error('Failed to analyze task:', err)
      // 不阻塞主流程，任务建议失败不影响 OCR
    }
  }

  // ============================================
  // 操作函数
  // ============================================

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ocrText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleSaveNote = async () => {
    if (!ocrText || !user) return

    try {
      const { error } = await supabase.from('notes').insert({
        user_id: user.id,
        title: ocrText.split('\n')[0].slice(0, 50) + '...',
        content: ocrText,
        category: 'OCR 识别',
      })

      if (error) throw error

      onSaveNote?.(ocrText)
      onClose()
    } catch (err) {
      console.error('Failed to save note:', err)
      alert('保存便签失败')
    }
  }

  const handleExtractTask = async () => {
    if (!taskSuggestion || !user) return

    try {
      const { error } = await supabase.from('todos').insert({
        user_id: user.id,
        title: taskSuggestion.title,
        due_date: taskSuggestion.due_date,
        priority: taskSuggestion.priority,
        category: taskSuggestion.category,
        status: 'pending',
      })

      if (error) throw error

      onExtractTask?.(taskSuggestion.title)
      onClose()
    } catch (err) {
      console.error('Failed to create task:', err)
      alert('创建任务失败')
    }
  }

  // ============================================
  // 生命周期
  // ============================================

  useEffect(() => {
    if (isOpen && imageData) {
      performOCR()
    }

    return () => {
      // 清理 worker
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [isOpen, imageData, performOCR])

  // ============================================
  // 渲染
  // ============================================

  return (
    <>
      {/* 遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ScanText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">OCR 文字识别</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 截图预览 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">截图预览</h3>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={imageData}
                    alt="Screenshot"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* 识别进度 */}
              {isProcessing && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="font-medium text-blue-900">正在识别文字...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-blue-700 mt-2">{progress}%</p>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={performOCR}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    重试
                  </button>
                </div>
              )}

              {/* 识别结果 */}
              {ocrText && !isProcessing && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">识别结果</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[200px]">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                      {displayedText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-4 bg-blue-600 align-middle ml-0.5"
                      />
                    </pre>
                  </div>
                </div>
              )}

              {/* 任务建议 */}
              <AnimatePresence>
                {showTaskSuggestion && taskSuggestion && isTypewriterComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          AI 检测到待办任务
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                          "{taskSuggestion.title}"
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleExtractTask}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            创建任务
                          </button>
                          <button
                            onClick={() => setShowTaskSuggestion(false)}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                          >
                            忽略
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 底部操作栏 */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  disabled={!ocrText || isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!ocrText || isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  保存为便签
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default OCRPanel
