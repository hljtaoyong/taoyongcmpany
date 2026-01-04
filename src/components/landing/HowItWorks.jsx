/**
 * [INPUT]: 依赖 @/components/ui/card 的 Card, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设
 * [OUTPUT]: 导出 HowItWorks Section 组件,产品使用流程说明,科技感风格
 * [POS]: landing 层步骤说明组件,展示产品使用流程
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Bell, StickyNote, Calendar } from "lucide-react"
import { getMotionProps, staggerContainer, fadeInUp } from "@/lib/motion"

const DEFAULT_STEPS = [
  {
    step: 1,
    title: "创建任务",
    description: "添加待办事项，设置优先级，一键同步到 Google Calendar",
    icon: CheckCircle,
    color: "violet"
  },
  {
    step: 2,
    title: "设置闹钟",
    description: "配置多时段提醒，支持重复规则，准时响铃",
    icon: Bell,
    color: "fuchsia"
  },
  {
    step: 3,
    title: "记录便签",
    description: "快速捕捉灵感，颜色分类整理，一键置顶",
    icon: StickyNote,
    color: "blue"
  },
  {
    step: 4,
    title: "高效管理",
    description: "统一视图管理所有事项，统计进度，提升效率",
    icon: Calendar,
    color: "emerald"
  }
]

export function HowItWorks({
  headline = "简单四步，开启智能生产力",
  subheadline = "无需复杂配置，即开即用",
  steps = DEFAULT_STEPS
}) {
  const colorStyles = {
    violet: {
      gradient: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-500/20",
      icon: "text-violet-400",
      iconBg: "bg-violet-500/20"
    },
    fuchsia: {
      gradient: "from-fuchsia-500/20 to-fuchsia-500/5",
      border: "border-fuchsia-500/20",
      icon: "text-fuchsia-400",
      iconBg: "bg-fuchsia-500/20"
    },
    blue: {
      gradient: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/20",
      icon: "text-blue-400",
      iconBg: "bg-blue-500/20"
    },
    emerald: {
      gradient: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
      iconBg: "bg-emerald-500/20"
    }
  }

  return (
    <section className="py-20 md:py-28 lg:py-32 relative overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/50 to-slate-950">
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          {...getMotionProps()}
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent mb-4">
            {headline}
          </h2>
          <p className="text-lg text-slate-400">{subheadline}</p>
        </motion.div>

        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="absolute top-24 left-0 right-0 hidden lg:block">
            <div className="mx-16 h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          </div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            {...getMotionProps(staggerContainer)}
          >
            {steps.map((step, index) => {
              const Icon = step.icon
              const styles = colorStyles[step.color]

              return (
                <motion.div key={index} {...getMotionProps(fadeInUp)}>
                  <div className="relative">
                    {/* Step Number */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-2xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.4)] mx-auto"
                    >
                      {step.step}
                    </motion.div>

                    {/* Connector Arrow (Desktop) */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-[60%] w-[80%]">
                        <ArrowRight className="h-6 w-6 text-violet-500/50" />
                      </div>
                    )}

                    <Card
                      className={`p-6 text-center bg-gradient-to-br ${styles.gradient} border ${styles.border} hover:opacity-80 transition-all cursor-pointer group`}
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${styles.iconBg} mx-auto group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${styles.icon}`} />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-white">{step.title}</h3>
                      <p className="text-slate-400 text-sm">{step.description}</p>
                    </Card>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Quick Start CTA */}
        <motion.div
          className="mt-16 text-center"
          {...getMotionProps(fadeInUp)}
        >
          <p className="text-slate-400 mb-4">立即开始，提升你的生产力</p>
          <div className="flex gap-4 justify-center">
            <a
              href="/todos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              开始使用
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
