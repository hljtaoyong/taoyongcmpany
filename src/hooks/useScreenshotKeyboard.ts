/**
 * [INPUT]: 依赖 react 的 useEffect/useCallback
 * [OUTPUT]: 对外提供 useScreenshotKeyboard Hook,监听 Alt+S 快捷键触发截图
 * [POS]: hooks/ 的快捷键监听模块,被 App 组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useCallback } from 'react'
import { startSelection, type ScreenshotArea } from '@/lib/screenshot'

export interface UseScreenshotKeyboardOptions {
  onCapture: (area: ScreenshotArea, imageData: string) => void
  shortcut?: string // 默认 'Alt+S'
  disabled?: boolean
}

/**
 * 截图快捷键 Hook
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
  shortcut = 'Alt+S',
  disabled = false,
}: UseScreenshotKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return

      // 检测 Alt+S
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        startSelection(
          (area, imageData) => {
            onCapture(area, imageData)
          },
          () => {
            // 用户取消截图
            console.log('Screenshot cancelled')
          }
        )
      }
    },
    [onCapture, disabled]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
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
