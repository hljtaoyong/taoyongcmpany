/**
 * [INPUT]: 依赖 react 的 useEffect/useCallback
 * [OUTPUT]: 对外提供 useScreenshotKeyboard Hook,监听 Ctrl+Shift+S 快捷键触发截图
 * [POS]: hooks/ 的快捷键监听模块,被 App 组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useCallback } from 'react'
import { startSelection, type ScreenshotArea } from '@/lib/screenshot'

export interface UseScreenshotKeyboardOptions {
  onCapture: (area: ScreenshotArea, imageData: string) => void
  shortcut?: string // 默认 'Ctrl+Shift+S'
  disabled?: boolean
}

/**
 * 截图快捷键 Hook
 * 快捷键: Ctrl+Shift+S (Windows/Linux) 或 Cmd+Shift+S (Mac)
 *
 * @example
 * ```tsx
 * useScreenshotKeyboard({
 *   onCapture: (area, imageData) => {
 *     setCurrentScreenshot(imageData)
 *     setShowOCRPanel(true)
 *   }
 * })
 * ```
 */
export function useScreenshotKeyboard({
  onCapture,
  shortcut = 'Ctrl+Shift+S',
  disabled = false,
}: UseScreenshotKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return

      // 检测 Ctrl+Shift+S 或 Cmd+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        e.stopPropagation()
        console.log('📸 触发截图快捷键')
        startSelection(
          (area, imageData) => {
            console.log('✅ 截图成功:', area)
            onCapture(area, imageData)
          },
          () => {
            console.log('❌ 用户取消截图')
          }
        )
      }
    },
    [onCapture, disabled]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    trigger: () => {
      startSelection(
        (area, imageData) => {
          onCapture(area, imageData)
        },
        () => {
          console.log('Screenshot cancelled')
        }
      )
    },
  }
}
