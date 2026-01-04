/**
 * [INPUT]: 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/badge 的 Badge, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 react-router-dom 的 Link
 * [OUTPUT]: 导出 Hero Section 组件,科技感首屏,功能按钮直达各模块
 * [POS]: landing 层首屏组件,位于页面最顶部
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Zap, CheckCircle, Bell, StickyNote, Rocket } from "lucide-react"
import { getMotionProps, fadeInUp, staggerContainer, scaleIn } from "@/lib/motion"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

        {/* Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-violet-600/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]"
        />
      </div>

      {/* Scanning Line Effect */}
      <motion.div
        animate={{
          y: [-1000, 1000],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none"
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-5xl text-center"
          {...getMotionProps(staggerContainer)}
        >
          {/* Badge */}
          <motion.div {...getMotionProps(fadeInUp)}>
            <Badge className="mb-6 px-4 py-2 text-sm border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <Sparkles className="mr-2 h-4 w-4" />
              🚀 全新发布 v2.0 - Google Calendar 同步已上线
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            {...getMotionProps(fadeInUp)}
          >
            <span className="block bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
              智能生产力
            </span>
            <span className="block mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
              重新定义效率
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mb-10 text-lg text-slate-300 md:text-xl max-w-2xl mx-auto"
            {...getMotionProps(fadeInUp)}
          >
            集成任务管理、智能闹钟、即时便签于一体。
            <br className="hidden sm:block" />
            Google Calendar 双向同步，让工作流丝滑衔接。
          </motion.p>

          {/* CTA Buttons - Real Functionality */}
          <motion.div
            className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center"
            {...getMotionProps(fadeInUp)}
          >
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all"
              asChild
            >
              <Link to="/todos">
                <Zap className="h-5 w-5" />
                立即开始
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/50 transition-all"
              asChild
            >
              <Link to="/design-system">查看设计系统</Link>
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            {...getMotionProps(scaleIn)}
          >
            <Link to="/todos">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                    <CheckCircle className="h-6 w-6 text-violet-400" />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1">任务管理</h3>
                <p className="text-sm text-slate-400">优先级排序 · 日历同步</p>
              </motion.div>
            </Link>

            <Link to="/alarms">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-fuchsia-500/20 group-hover:bg-fuchsia-500/30 transition-colors">
                    <Bell className="h-6 w-6 text-fuchsia-400" />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1">智能闹钟</h3>
                <p className="text-sm text-slate-400">多时段提醒 · 重复设置</p>
              </motion.div>
            </Link>

            <Link to="/notes">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <StickyNote className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1">即时便签</h3>
                <p className="text-sm text-slate-400">快速记录 · 颜色分类</p>
              </motion.div>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="mt-12 flex items-center justify-center gap-2"
            {...getMotionProps(fadeInUp)}
          >
            <div className="flex -space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              已有 <span className="text-violet-400 font-semibold">10,000+</span> 用户信赖
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  )
}
