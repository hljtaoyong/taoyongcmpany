/**
 * [INPUT]: 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/badge 的 Badge, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/fadeInUp
 * [OUTPUT]: 导出 Hero Section 组件
 * [POS]: landing 层首屏组件,位于页面最顶部
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { getMotionProps, fadeInUp, staggerContainer, scaleIn } from "@/lib/motion"

export function Hero({
  badge = "🚀 全新发布 v2.0",
  headline = "构建令人惊艳的\n数字产品体验",
  subheadline = "现代化的设计系统，融合微拟物美学与极致性能。从原型到生产，一站式解决方案。",
  primaryCTA = "立即开始",
  secondaryCTA = "查看演示",
  socialProof = "已有 10,000+ 开发者信赖",
  primaryHref = "#cta",
  secondaryHref = "#features"
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          {...getMotionProps(staggerContainer)}
        >
          {/* Badge */}
          <motion.div {...getMotionProps(fadeInUp)}>
            <Badge className="mb-6 px-4 py-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Sparkles className="mr-2 h-4 w-4" />
              {badge}
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
            {...getMotionProps(fadeInUp)}
          >
            {headline.split('\n').map((line, i) => (
              <span key={i} className="block">
                {line.split(' ').map((word, j) => (
                  <span key={j} className="inline-block">
                    {word === '数字' || word === '体验' ? (
                      <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {word}{' '}
                      </span>
                    ) : (
                      <>{word} </>
                    )}
                  </span>
                ))}
              </span>
            ))}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mb-8 text-lg text-muted-foreground md:text-xl"
            {...getMotionProps(fadeInUp)}
          >
            {subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-center"
            {...getMotionProps(fadeInUp)}
          >
            <Button size="lg" className="gap-2" asChild>
              <a href={primaryHref}>
                {primaryCTA}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={secondaryHref}>{secondaryCTA}</a>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.p
            className="text-sm text-muted-foreground"
            {...getMotionProps(fadeInUp)}
          >
            {socialProof}
          </motion.p>

          {/* Hero Visual Placeholder */}
          <motion.div
            className="mt-16 rounded-3xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted/20 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]"
            {...getMotionProps(scaleIn)}
          >
            <div className="aspect-video rounded-2xl bg-muted/50 flex items-center justify-center">
              <p className="text-muted-foreground">Hero Visual / Screenshot / Video</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
