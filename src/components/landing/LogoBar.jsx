/**
 * [INPUT]: 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/fadeInUp
 * [OUTPUT]: 导出 LogoBar Section 组件
 * [POS]: landing 层信任背书组件,位于 Hero 之后
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from "framer-motion"
import { getMotionProps, staggerContainer, fadeInUp } from "@/lib/motion"

const DEFAULT_LOGOS = [
  { name: "Company 1", icon: "🏢" },
  { name: "Company 2", icon: "🚀" },
  { name: "Company 3", icon: "💎" },
  { name: "Company 4", icon: "⚡" },
  { name: "Company 5", icon: "🔥" },
  { name: "Company 6", icon: "🌟" },
]

export function LogoBar({
  title = "被行业领先者信赖",
  logos = DEFAULT_LOGOS
}) {
  return (
    <section className="border-y border-border/40 bg-muted/20 py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          {...getMotionProps()}
        >
          <p className="mb-8 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>

          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
            {...getMotionProps(staggerContainer)}
          >
            {logos.map((logo, index) => (
              <motion.div
                key={index}
                className="flex h-12 items-center justify-center text-2xl grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100 hover:scale-110"
                {...getMotionProps(fadeInUp)}
              >
                <span className="text-3xl">{logo.icon}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
