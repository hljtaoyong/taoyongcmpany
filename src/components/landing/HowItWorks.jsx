/**
 * [INPUT]: 依赖 @/components/ui/card 的 Card, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/staggerContainer/fadeInUp
 * [OUTPUT]: 导出 HowItWorks Section 组件
 * [POS]: landing 层步骤说明组件,展示产品使用流程
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { getMotionProps, staggerContainer, fadeInUp } from "@/lib/motion"

const DEFAULT_STEPS = [
  {
    step: 1,
    title: "安装依赖",
    description: "一键安装 shadcn/ui 组件库，集成 TailwindCSS v4",
    visual: "📦"
  },
  {
    step: 2,
    title: "配置设计系统",
    description: "定义 CSS 变量，建立统一的色彩与组件规范",
    visual: "🎨"
  },
  {
    step: 3,
    title: "构建页面",
    description: "使用预设组件快速搭建 Landing Page，无需从零开始",
    visual: "🚀"
  },
  {
    step: 4,
    title: "部署上线",
    description: "Vite 构建优化，秒级部署，立即可用",
    visual: "✨"
  }
]

export function HowItWorks({
  headline = "简单四步，快速启动",
  steps = DEFAULT_STEPS
}) {
  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-muted/10 to-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          {...getMotionProps()}
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {headline}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="absolute top-24 left-0 right-0 hidden lg:block">
            <div className="mx-16 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            {...getMotionProps(staggerContainer)}
          >
            {steps.map((step, index) => (
              <motion.div key={index} {...getMotionProps(fadeInUp)}>
                <div className="relative">
                  {/* Step Number */}
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold shadow-[0_4px_12px_color-mix(in_srgb,hsl(var(--primary))_35%,_transparent),inset_0_1px_0_rgba(255,255,255,0.2)] mx-auto">
                    {step.step}
                  </div>

                  {/* Connector Arrow (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%]">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}

                  <Card variant="flat" className="p-6 text-center">
                    <div className="mb-4 text-4xl">{step.visual}</div>
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </Card>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
