/**
 * [INPUT]: 依赖 @/components/ui/button 的 Button, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 react-router-dom 的 Link
 * [OUTPUT]: 导出 FinalCTA Section 组件,科技感最终号召,功能按钮直达各模块
 * [POS]: landing 层最终号召组件,位于页面底部
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Zap, CheckCircle, Bell, StickyNote } from "lucide-react"
import { getMotionProps, fadeInUp, staggerContainer } from "@/lib/motion"

export function FinalCTA() {
  return (
    <section id="cta" className="py-20 md:py-28 lg:py-32 relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 right-1/4 translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-[120px]"
        />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center"
          {...getMotionProps(staggerContainer)}
        >
          {/* Icon */}
          <motion.div
            className="mb-8 flex justify-center"
            {...getMotionProps(fadeInUp)}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur-xl opacity-50" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_40px_rgba(139,92,246,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            {...getMotionProps(fadeInUp)}
          >
            <span className="block bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
              准备好开启
            </span>
            <span className="block mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              智能生产力之旅了吗？
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            className="mb-12 text-lg text-slate-300 max-w-2xl mx-auto"
            {...getMotionProps(fadeInUp)}
          >
            三大核心功能，一键直达。立即体验下一代生产力工具。
          </motion.p>

          {/* Action Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12"
            {...getMotionProps(fadeInUp)}
          >
            <Link to="/todos">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer"
              >
                <CheckCircle className="h-8 w-8 text-violet-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">任务管理</h3>
                <p className="text-sm text-slate-400">优先级排序 · 日历同步</p>
              </motion.div>
            </Link>

            <Link to="/alarms">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all cursor-pointer"
              >
                <Bell className="h-8 w-8 text-fuchsia-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">智能闹钟</h3>
                <p className="text-sm text-slate-400">多时段提醒 · 重复设置</p>
              </motion.div>
            </Link>

            <Link to="/notes">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
              >
                <StickyNote className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">即时便签</h3>
                <p className="text-sm text-slate-400">快速记录 · 颜色分类</p>
              </motion.div>
            </Link>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            {...getMotionProps(fadeInUp)}
          >
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all text-lg px-8 py-6"
              asChild
            >
              <Link to="/todos">
                <Zap className="h-5 w-5" />
                立即开始使用
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/50 transition-all text-lg px-8 py-6"
              asChild
            >
              <Link to="/design-system">查看设计系统</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
