/**
 * [INPUT]: 依赖 react-router-dom 的 BrowserRouter/Routes/Route/Location, 依赖 framer-motion 的 AnimatePresence/motion, 依赖 @/lib/motion 的 pageTransition, 依赖 @/pages/LandingPage 的 LandingPage, 依赖 @/pages/DesignSystem 的 DesignSystem, 依赖 @/pages/TodosPage 的 TodosPage, 依赖 @/pages/AlarmsPage 的 AlarmsPage, 依赖 @/pages/NotesPage 的 NotesPage, 依赖 @/components/Sidebar 的 Sidebar, 依赖 @/components/LifeCounter 的 LifeCounter
 * [OUTPUT]: 导出 App 根组件,配置所有路由与页面过渡动画,包含侧边栏和底部人生计时器
 * [POS]: 应用的主容器,包裹路由与布局,Apple 级页面切换效果
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { LandingPage } from "./pages/LandingPage"
import { DesignSystem } from "./pages/DesignSystem"
import { TodosPage } from "./pages/TodosPage"
import { AlarmsPage } from "./pages/AlarmsPage"
import { NotesPage } from "./pages/NotesPage"
import { Sidebar } from "./components/Sidebar"
import { LifeCounter } from "./components/LifeCounter"

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
  const isAppPage = ['/todos', '/alarms', '/notes'].includes(location.pathname)

  return (
    <>
      {isAppPage && <Sidebar />}
      <main className={isAppPage ? 'ml-64 mb-20' : ''}>
        <AnimatedRoutes />
      </main>
      {isAppPage && <LifeCounter birthDate="1990-01-01" lifeExpectancy={80} />}
    </>
  )
}

export default App
