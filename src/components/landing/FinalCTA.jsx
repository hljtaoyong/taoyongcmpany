/**
 * [INPUT]: 依赖 @/components/ui/button 的 Button, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/fadeInUp
 * [OUTPUT]: 导出 FinalCTA Section 组件
 * [POS]: landing 层最终号召组件,位于页面底部
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { getMotionProps, fadeInUp, staggerContainer } from "@/lib/motion"

export function FinalCTA({
  headline = "准备好开始了吗？",
  subheadline = "加入数千名开发者的行列，使用我们的设计系统构建下一代 Web 应用",
  primaryCTA = "立即开始",
  secondaryCTA = "查看文档",
  primaryHref = "#",
  secondaryHref = "#docs"
}) {
  return (
    <section id="cta" className="py-20 md:py-28 lg:py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwIDAtMiAyLTJoLTRjLTIgMC00IDItNCA0IDAgMiAyIDQgMiA0aDRjMiAwIDQtMiA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center text-primary-foreground"
          {...getMotionProps(staggerContainer)}
        >
          <motion.div
            className="mb-6 flex justify-center"
            {...getMotionProps(fadeInUp)}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
              <Sparkles className="h-8 w-8" />
            </div>
          </motion.div>

          <motion.h2
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            {...getMotionProps(fadeInUp)}
          >
            {headline}
          </motion.h2>

          <motion.p
            className="mb-8 text-lg text-primary-foreground/80 max-w-2xl mx-auto"
            {...getMotionProps(fadeInUp)}
          >
            {subheadline}
          </motion.p>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            {...getMotionProps(fadeInUp)}
          >
            <Button
              size="lg"
              className="gap-2 bg-white text-primary hover:bg-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]"
              asChild
            >
              <a href={primaryHref}>
                {primaryCTA}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <a href={secondaryHref}>{secondaryCTA}</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
