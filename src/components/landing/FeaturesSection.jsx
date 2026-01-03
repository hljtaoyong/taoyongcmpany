/**
 * [INPUT]: 依赖 @/components/ui/card 的 Card, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/staggerContainer/fadeInUp
 * [OUTPUT]: 导出 FeaturesSection 组件
 * [POS]: landing 层功能特性展示组件,支持 grid/bento/alternating 布局
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Palette,
  Zap,
  Shield,
  Sparkles,
  Layers,
  Code2
} from "lucide-react"
import { getMotionProps, staggerContainer, fadeInUp } from "@/lib/motion"

const ICON_MAP = {
  Palette,
  Zap,
  Shield,
  Sparkles,
  Layers,
  Code2,
}

const DEFAULT_FEATURES = [
  {
    icon: "Palette",
    title: "微拟物设计语言",
    description: "融合渐变与立体阴影，打造精致细腻的视觉体验。所有色彩派生自 CSS 变量，确保全局一致性。",
    span: "col-span-1"
  },
  {
    icon: "Zap",
    title: "极致性能",
    description: "基于 Vite 6 构建，毫秒级热更新。代码分割与懒加载优化，LCP < 2.5s。",
    span: "col-span-1"
  },
  {
    icon: "Shield",
    title: "类型安全",
    description: "完整的 TypeScript 支持，编译时错误检测。告别运行时惊喜，让代码更可靠。",
    span: "col-span-1"
  },
  {
    icon: "Sparkles",
    title: "shadcn/ui 组件库",
    description: "30+ 精心设计的组件，可直接复制粘贴。完全可定制，无运行时依赖。",
    span: "col-span-1 md:col-span-2"
  },
  {
    icon: "Layers",
    title: "响应式布局",
    description: "移动优先设计，完美适配各种屏幕尺寸。从手机到 4K 显示器，始终保持最佳体验。",
    span: "col-span-1"
  },
  {
    icon: "Code2",
    title: "开发体验",
    description: "清晰的代码结构，完善的文档体系。GEB 分形文档系统，代码与文档始终同步。",
    span: "col-span-1"
  },
]

export function FeaturesSection({
  headline = "构建现代化产品所需的一切",
  subheadline = "从设计系统到开发工具，全流程覆盖",
  features = DEFAULT_FEATURES,
  layout = "bento"
}) {
  const getIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName]
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null
  }

  const gridClass = layout === "bento"
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 md:grid-cols-3"

  return (
    <section id="features" className="py-20 md:py-28 lg:py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          {...getMotionProps()}
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheadline}
          </p>
        </motion.div>

        <motion.div
          className={`grid gap-6 ${gridClass}`}
          {...getMotionProps(staggerContainer)}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={feature.span || ""}
              {...getMotionProps(fadeInUp)}
            >
              <Card
                variant="raised"
                className="h-full p-6 transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_4px_12px_color-mix(in_srgb,hsl(var(--primary))_35%,_transparent),inset_0_1px_0_rgba(255,255,255,0.2)]">
                  {getIcon(feature.icon)}
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
