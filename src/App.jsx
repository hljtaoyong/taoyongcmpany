/**
 * [INPUT]: 依赖 react-router-dom 的 BrowserRouter/Routes/Route/Location, 依赖 framer-motion 的 AnimatePresence/motion, 依赖 @/lib/motion 的 pageTransition, 依赖 @/pages/LandingPage 的 LandingPage, 依赖 @/pages/DesignSystem 的 DesignSystem, 依赖 @/pages/TodosPage 的 TodosPage, 依赖 @/pages/AlarmsPage 的 AlarmsPage, 依赖 @/pages/NotesPage 的 NotesPage, 依赖 @/pages/BlogPage 的 BlogPage, 依赖 @/pages/BlogPost 的 BlogPost, 依赖 @/pages/BlogEditor 的 BlogEditor, 依赖 @/components/Sidebar 的 Sidebar, 依赖 @/components/LifeCounter 的 LifeCounter, 依赖 @/components/OCRPanel 的 OCRPanel, 依赖 @/components/ScreenshotPreview 的 ScreenshotPreview, 依赖 @/hooks/useScreenshotKeyboard 的 useScreenshotKeyboard
 * [OUTPUT]: 导出 App 根组件,配置所有路由与页面过渡动画,包含侧边栏/底部人生计时器/截图OCR功能
 * [POS]: 应用的主容器,包裹路由与布局,Apple 级页面切换效果,集成截图与OCR系统
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LandingPage } from "./pages/LandingPage"
import { DesignSystem } from "./pages/DesignSystem"
import { TodosPage } from "./pages/TodosPage"
import { AlarmsPage } from "./pages/AlarmsPage"
import { NotesPage } from "./pages/NotesPage"
import { BlogPage } from "./pages/BlogPage"
import { BlogPost } from "./pages/BlogPost"
import { BlogEditor } from "./pages/BlogEditor"
import { Sidebar } from "./components/Sidebar"
import { LifeChroniclesDashboard } from "./components/LifeCounter"
import { OCRPanel } from "./components/OCRPanel"
import { ScreenshotPreview } from "./components/ScreenshotPreview"
import { useScreenshotKeyboard } from "./hooks/useScreenshotKeyboard"

// 页面过渡动画配置 - Apple 级丝滑过渡
const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 40 }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
}

// 页面包装器 - 应用过渡动画
function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  )
}

// 路由配置 - 带 AnimatePresence
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <LandingPage />
            </PageWrapper>
          }
        />
        <Route
          path="/design-system"
          element={
            <PageWrapper>
              <DesignSystem />
            </PageWrapper>
          }
        />
        <Route
          path="/todos"
          element={
            <PageWrapper>
              <TodosPage />
            </PageWrapper>
          }
        />
        <Route
          path="/alarms"
          element={
            <PageWrapper>
              <AlarmsPage />
            </PageWrapper>
          }
        />
        <Route
          path="/notes"
          element={
            <PageWrapper>
              <NotesPage />
            </PageWrapper>
          }
        />
        <Route
          path="/blog"
          element={
            <PageWrapper>
              <BlogPage />
            </PageWrapper>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PageWrapper>
              <BlogPost />
            </PageWrapper>
          }
        />
        <Route
          path="/blog/new"
          element={
            <PageWrapper>
              <BlogEditor />
            </PageWrapper>
          }
        />
        <Route
          path="/blog/edit/:slug"
          element={
            <PageWrapper>
              <BlogEditor />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

// 应用布局 - 根据路由决定是否显示侧边栏和人生计时器
function AppLayout() {
  const location = useLocation()
  const isAppPage = ['/todos', '/alarms', '/notes', '/blog'].includes(location.pathname) ||
                   location.pathname.startsWith('/blog/')
  const [sidebarWidth, setSidebarWidth] = useState('w-64')

  // ============================================
  // 截图与 OCR 功能
  // ============================================

  const [currentScreenshot, setCurrentScreenshot] = useState(null)
  const [showOCRPanel, setShowOCRPanel] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // 快捷键监听 (Alt+S)
  useScreenshotKeyboard({
    onCapture: (area, imageData) => {
      setCurrentScreenshot(imageData)
      setShowPreview(true)
    },
    disabled: !isAppPage, // 仅在应用页面启用
  })

  // OCR 面板回调
  const handleOCRClose = () => {
    setShowOCRPanel(false)
    setShowPreview(false)
  }

  const handleExtractTask = (taskTitle) => {
    console.log('Task extracted:', taskTitle)
    // 可以添加成功提示
  }

  const handleSaveNote = (noteText) => {
    console.log('Note saved:', noteText)
    // 可以添加成功提示
  }

  useEffect(() => {
    const handleSidebarToggle = (e) => {
      const { isCollapsed } = e.detail
      setSidebarWidth(isCollapsed ? 'w-20' : 'w-64')
    }

    window.addEventListener('sidebar-toggle', handleSidebarToggle)
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle)
  }, [])

  const marginClass = sidebarWidth === 'w-20' ? 'ml-20' : 'ml-64'

  return (
    <>
      {isAppPage && <Sidebar />}
      <main className={isAppPage ? `${marginClass} mb-20 transition-all duration-300` : ''}>
        <AnimatedRoutes />
      </main>
      {isAppPage && <LifeChroniclesDashboard />}

      {/* 截图与 OCR 功能 */}
      {currentScreenshot && (
        <>
          <ScreenshotPreview
            imageData={currentScreenshot}
            onClose={() => {
              setCurrentScreenshot(null)
              setShowPreview(false)
            }}
            onOCR={() => setShowOCRPanel(true)}
          />
          <OCRPanel
            isOpen={showOCRPanel}
            onClose={handleOCRClose}
            imageData={currentScreenshot}
            onExtractTask={handleExtractTask}
            onSaveNote={handleSaveNote}
          />
        </>
      )}
    </>
  )
}

export default App
