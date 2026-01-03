/**
 * [INPUT]: 依赖 @/components/ui/card 的 Card, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/staggerContainer/fadeInUp, 依赖 lucide-react 的 X
 * [OUTPUT]: 导出 ProblemSection 组件
 * [POS]: landing 层痛点唤醒组件,位于 LogoBar 之后
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { getMotionProps, staggerContainer, fadeInUp } from "@/lib/motion"

const DEFAULT_PAINS = [
  {
    title: "设计系统混乱",
    description: "组件风格不统一，维护成本高昂，每次修改都需要反复确认"
  },
  {
    title: "开发效率低下",
    description: "重复造轮子，缺乏复用性，项目启动时间过长"
  },
  {
    title: "用户体验欠佳",
    description: "交互反馈不清晰，动效生硬，无法提供流畅的使用体验"
  },
  {
    title: "协作沟通困难",
    description: "设计与开发割裂，需求传达不准确，版本管理混乱"
  }
]

export function ProblemSection({
  headline = "还在为这些问题烦恼？",
  painPoints = DEFAULT_PAINS
}) {
  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-background to-muted/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          {...getMotionProps()}
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {headline}
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          {...getMotionProps(staggerContainer)}
        >
          {painPoints.map((pain, index) => (
            <motion.div key={index} {...getMotionProps(fadeInUp)}>
              <Card variant="inset" className="p-6 h-full border-destructive/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                  <X className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{pain.title}</h3>
                <p className="text-muted-foreground">{pain.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
