/**
 * [INPUT]: 依赖 react-router-dom 的 BrowserRouter/Routes/Route/Location, 依赖 framer-motion 的 AnimatePresence/motion, 依赖 @/lib/motion 的 pageTransition, 依赖 @/pages/LandingPage 的 LandingPage, 依赖 @/pages/DesignSystem 的 DesignSystem, 依赖 @/pages/TodosPage 的 TodosPage, 依赖 @/pages/AlarmsPage 的 AlarmsPage, 依赖 @/pages/NotesPage 的 NotesPage
 * [OUTPUT]: 导出 App 根组件,配置所有路由与页面过渡动画
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
      <AnimatedRoutes />
    </Router>
  )
}

export default App
