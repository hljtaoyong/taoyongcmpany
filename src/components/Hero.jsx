/**
 * [INPUT]: 依赖 @/components/ui/button 的 Button, 依赖 lucide-react 的 ArrowRight
 * [OUTPUT]: 导出 Hero 英雄区域组件
 * [POS]: 页面层核心展示区,位于 Header 下方
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container max-w-screen-2xl px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              微拟物设计语言
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            渐变与光影的
            <span className="ml-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              完美融合
            </span>
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            基于 shadcn/ui 的现代化设计系统，融合微拟物美学。
            <br className="hidden md:inline" />
            所有色彩派生自 CSS 变量，一切设计皆可追溯。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2">
              开始使用
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              查看文档
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
