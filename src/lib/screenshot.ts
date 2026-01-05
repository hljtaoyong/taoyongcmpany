/**
 * [INPUT]: 依赖浏览器原生 API (getDisplayMedia/Canvas/MediaRecorder), 依赖 @/lib/supabase 的 supabase
 * [OUTPUT]: 对外提供 captureScreenshot/startSelection/captureScreenArea 函数,截图选择器 UI 组件
 * [POS]: lib/ 的屏幕捕获与图像处理模块,被 OCRPanel 和 ScreenshotPreview 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================
// 类型定义
// ============================================

export interface ScreenshotArea {
  x: number
  y: number
  width: number
  height: number
}

export interface ScreenshotResult {
  blob: Blob
  base64: string
  dataUrl: string
  area: ScreenshotArea
}

export interface SelectionBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
  width: number
  height: number
}

// ============================================
// 屏幕捕获
// ============================================

/**
 * 获取屏幕媒体流（全屏截图）
 */
export async function captureScreen(): Promise<string> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'never',
      },
      audio: false,
    })

    const video = document.createElement('video')
    video.srcObject = stream
    await video.play()

    // 创建 Canvas
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    // 停止流
    stream.getTracks().forEach(track => track.stop())

    // 返回 Base64
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Failed to capture screen:', error)
    throw new Error('无法捕获屏幕，请检查权限设置')
  }
}

/**
 * 获取屏幕媒体流（用于裁剪）
 */
export async function getScreenStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'never',
      },
      audio: false,
    })
  } catch (error) {
    console.error('Failed to get screen stream:', error)
    throw new Error('无法获取屏幕流，请检查权限设置')
  }
}

// ============================================
// Canvas 裁剪
// ============================================

/**
 * 从屏幕流中裁剪指定区域
 */
export async function captureScreenArea(
  stream: MediaStream,
  area: ScreenshotArea
): Promise<ScreenshotResult> {
  const video = document.createElement('video')
  video.srcObject = stream
  await video.play()

  // 创建裁剪后的 Canvas
  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height

  const ctx = canvas.getContext('2d')!

  // 裁剪指定区域
  ctx.drawImage(
    video,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height
  )

  // 停止流
  stream.getTracks().forEach(track => track.stop())

  // 转换为 Blob 和 Base64
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png')
  })

  const base64 = canvas.toDataURL('image/png')
  const dataUrl = base64

  return {
    blob,
    base64,
    dataUrl,
    area,
  }
}

// ============================================
// 选择器工具
// ============================================

/**
 * 启动截图选择器
 */
export function startSelection(
  onConfirm: (area: ScreenshotArea, imageData: string) => void,
  onCancel: () => void
): void {
  // 创建蒙层
  const overlay = document.createElement('div')
  overlay.id = 'screenshot-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    z-index: 9999;
    cursor: crosshair;
  `

  // 创建选择框
  const selectionBox = document.createElement('div')
  selectionBox.id = 'screenshot-selection'
  selectionBox.style.cssText = `
    position: absolute;
    display: none;
    border: 2px solid #007AFF;
    background: rgba(0, 122, 255, 0.1);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  `

  // 创建尺寸标签
  const sizeLabel = document.createElement('div')
  sizeLabel.id = 'screenshot-size-label'
  sizeLabel.style.cssText = `
    position: absolute;
    display: none;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    border-radius: 4px;
    pointer-events: none;
    white-space: nowrap;
  `

  // 创建工具栏
  const toolbar = document.createElement('div')
  toolbar.id = 'screenshot-toolbar'
  toolbar.style.cssText = `
    position: absolute;
    display: none;
    padding: 8px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    gap: 8px;
    z-index: 10000;
  `

  // 确认按钮
  const confirmBtn = document.createElement('button')
  confirmBtn.textContent = '✓ 确认'
  confirmBtn.style.cssText = `
    padding: 6px 16px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  `
  confirmBtn.onmouseover = () => confirmBtn.style.background = '#0051D5'
  confirmBtn.onmouseout = () => confirmBtn.style.background = '#007AFF'

  // 取消按钮
  const cancelBtn = document.createElement('button')
  cancelBtn.textContent = '✕ 取消'
  cancelBtn.style.cssText = `
    padding: 6px 16px;
    background: #f5f5f7;
    color: #1d1d1f;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  `
  cancelBtn.onmouseover = () => cancelBtn.style.background = '#e5e5e7'
  cancelBtn.onmouseout = () => cancelBtn.style.background = '#f5f5f7'

  toolbar.appendChild(confirmBtn)
  toolbar.appendChild(cancelBtn)

  document.body.appendChild(overlay)
  document.body.appendChild(selectionBox)
  document.body.appendChild(sizeLabel)
  document.body.appendChild(toolbar)

  let isSelecting = false
  let startX = 0
  let startY = 0
  let currentX = 0
  let currentY = 0

  // 鼠标按下
  overlay.addEventListener('mousedown', (e) => {
    isSelecting = true
    startX = e.clientX
    startY = e.clientY
    currentX = e.clientX
    currentY = e.clientY

    selectionBox.style.display = 'block'
    sizeLabel.style.display = 'block'
  })

  // 鼠标移动
  overlay.addEventListener('mousemove', (e) => {
    if (!isSelecting) return

    currentX = e.clientX
    currentY = e.clientY

    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)
    const left = Math.min(startX, currentX)
    const top = Math.min(startY, currentY)

    // 更新选择框
    selectionBox.style.left = `${left}px`
    selectionBox.style.top = `${top}px`
    selectionBox.style.width = `${width}px`
    selectionBox.style.height = `${height}px`

    // 更新尺寸标签
    sizeLabel.textContent = `${width} × ${height}`
    sizeLabel.style.left = `${left + width + 10}px`
    sizeLabel.style.top = `${top}px`

    // 更新工具栏位置
    toolbar.style.display = 'flex'
    toolbar.style.left = `${left + width - 180}px`
    toolbar.style.top = `${top + height + 10}px`

    // 确保工具栏不超出屏幕
    const toolbarRect = toolbar.getBoundingClientRect()
    if (toolbarRect.right > window.innerWidth) {
      toolbar.style.left = `${left}px`
    }
    if (toolbarRect.bottom > window.innerHeight) {
      toolbar.style.top = `${top - 50}px`
    }
  })

  // 鼠标释放
  overlay.addEventListener('mouseup', () => {
    isSelecting = false
  })

  // 确认截图
  confirmBtn.addEventListener('click', async () => {
    const area: ScreenshotArea = {
      x: Math.min(startX, currentX),
      y: Math.min(startY, currentY),
      width: Math.abs(currentX - startX),
      height: Math.abs(currentY - startY),
    }

    // 快门效果
    triggerShutterEffect()

    try {
      const stream = await getScreenStream()
      const result = await captureScreenArea(stream, area)
      onConfirm(area, result.dataUrl)
    } catch (error) {
      console.error('Screenshot failed:', error)
      alert('截图失败，请重试')
      onCancel()
    }

    cleanup()
  })

  // 取消截图
  cancelBtn.addEventListener('click', () => {
    onCancel()
    cleanup()
  })

  // ESC 键取消
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
      cleanup()
    }
  }
  document.addEventListener('keydown', handleEscape)

  // 清理函数
  function cleanup() {
    document.removeEventListener('keydown', handleEscape)
    overlay.remove()
    selectionBox.remove()
    sizeLabel.remove()
    toolbar.remove()
  }
}

// ============================================
// 快门效果
// ============================================

/**
 * 触发快门效果（白光闪烁 + 音效）
 */
export function triggerShutterEffect(): void {
  // 创建白光闪屏
  const flash = document.createElement('div')
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 99999;
    opacity: 1;
    transition: opacity 0.15s ease-out;
    pointer-events: none;
  `
  document.body.appendChild(flash)

  // 淡出并移除
  requestAnimationFrame(() => {
    flash.style.opacity = '0'
    setTimeout(() => flash.remove(), 150)
  })

  // 播放快门音效
  playShutterSound()
}

/**
 * 播放快门音效
 */
function playShutterSound(): void {
  // 创建 Web Audio API 音效
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  // 创建振荡器（模拟快门声）
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 1000
  oscillator.type = 'square'

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

// ============================================
// 辅助函数
// ============================================

/**
 * 将 Base64 转换为 Blob
 */
export function base64ToBlob(base64: string): Blob {
  const arr = base64.split(',')
  const mime = (arr[0] as string).match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1] as string)
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * 下载截图
 */
export function downloadScreenshot(dataUrl: string, filename = 'screenshot.png'): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

/**
 * 将截图复制到剪贴板
 */
export async function copyScreenshotToClipboard(dataUrl: string): Promise<void> {
  try {
    const blob = base64ToBlob(dataUrl)
    await (navigator as any).clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    throw new Error('无法复制到剪贴板')
  }
}
