/**
 * [INPUT]: 依赖 class-variance-authority 的 cva, 依赖 @/lib/utils 的 cn
 * [OUTPUT]: 导出 Badge 组件、badgeVariants 样式配置
 * [POS]: components/ui 的标签组件,支持渐变背景
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ========================================
   微拟物设计语言 - Badge 渐变配置
   ======================================== */

const BADGE_STYLES = {
  default: 'linear-gradient(135deg, hsl(var(--primary)) 0%, color-mix(in srgb, hsl(var(--primary)) 90%, black) 100%)',
  secondary: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, color-mix(in srgb, hsl(var(--secondary)) 90%, black) 100%)',
  destructive: 'linear-gradient(135deg, hsl(var(--destructive)) 0%, color-mix(in srgb, hsl(var(--destructive)) 90%, black) 100%)',
  outline: 'transparent',
}

const badgeVariants = cva(
  [
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "shadow-[0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]",
    "hover:scale-[1.02]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-transparent text-primary-foreground",
        secondary: "border-transparent text-secondary-foreground",
        destructive: "border-transparent text-destructive-foreground",
        outline: "text-foreground border-input bg-background hover:bg-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant = "default", ...props }) {
  const style = BADGE_STYLES[variant]
  const needsCustomStyle = variant !== "outline"

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={needsCustomStyle ? { background: style } : undefined}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
