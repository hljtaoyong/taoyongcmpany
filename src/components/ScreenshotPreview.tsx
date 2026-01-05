/**
 * [INPUT]: 依赖 react 的 useState, 依赖 framer-motion 的 motion/AnimatePresence, 依赖 lucide-react 的图标, 依赖 @/lib/screenshot 的 downloadScreenshot/copyScreenshotToClipboard
 * [OUTPUT]: 导出 ScreenshotPreview 组件,提供右下角浮窗预览与放大查看功能
 * [POS]: components/ 的截图预览组件,被 App 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ScanText, Download, Copy, Expand, Check } from 'lucide-react'
import { downloadScreenshot, copyScreenshotToClipboard } from '@/lib/screenshot'

// ============================================
// 类型定义
// ============================================

interface ScreenshotPreviewProps {
  imageData: string
  onClose: () => void
  onOCR: () => void
}

// ============================================
// ScreenshotPreview 主组件
// ============================================

export function ScreenshotPreview({
  imageData,
  onClose,
  onOCR,
}: ScreenshotPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyScreenshotToClipboard(imageData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadScreenshot(imageData, `screenshot-${timestamp}.png`)
  }

  return (
    <>
      {/* 右下角浮窗 */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* 缩略图 */}
              <div className="relative w-48 h-32 bg-gray-100">
                <img
                  src={imageData}
                  alt="Screenshot"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                />
                {/* 放大按钮 */}
                <button
                  onClick={() => setIsExpanded(true)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-colors"
                >
                  <Expand className="w-3 h-3 text-gray-700" />
                </button>
              </div>

              {/* 操作按钮 */}
              <div className="p-2 flex gap-1">
                <button
                  onClick={onOCR}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  <ScanText className="w-3.5 h-3.5" />
                  OCR 识别
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="复制到剪贴板"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="下载"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="关闭"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 放大预览 */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* 图片容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-8 z-50 flex items-center justify-center"
            >
              <div className="relative max-w-5xl max-h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* 图片 */}
                <img
                  src={imageData}
                  alt="Screenshot"
                  className="max-w-full max-h-[calc(100vh-8rem)] object-contain"
                />

                {/* 关闭按钮 */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>

                {/* 底部操作栏 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg">
                  <button
                    onClick={onOCR}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <ScanText className="w-4 h-4" />
                    OCR 识别
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ScreenshotPreview
