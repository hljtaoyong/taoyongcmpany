/**
 * [INPUT]: 依赖 @/lib/utils 的 cn, 依赖 framer-motion 的 motion
 * [OUTPUT]: 导出 Card 系列组件 (Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter)
 * [POS]: components/ui 的容器组件,支持凸起/内凹/平面三种变体,Apple 级悬浮动画
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/* ========================================
   微拟物设计语言 - Card 变体配置
   raised: 凸起效果 (外投影 + 顶部高光)
   inset: 内凹效果 (内阴影)
   flat: 平面效果 (轻阴影)
   ======================================== */

const cardVariants = cva(
  "rounded-2xl border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        raised: "",
        inset: "",
        flat: "",
      },
    },
    defaultVariants: {
      variant: "raised",
    },
  }
)

const getCardStyle = (variant) => {
  switch (variant) {
    case "raised":
      return {
        boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.05)',
      }
    case "inset":
      return {
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
      }
    case "flat":
    default:
      return {
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }
  }
}

// Apple 级卡片悬浮动画
const cardMotion = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.05)',
    transition: { type: "spring", stiffness: 400, damping: 30 }
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 12px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.08)',
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

const Card = React.forwardRef(({ className, variant = "raised", ...props }, ref) => {
  // 只有 raised 变体使用悬浮动画
  const useMotion = variant === "raised"

  const cardContent = (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      style={variant !== "raised" ? getCardStyle(variant) : undefined}
      {...props}
    />
  )

  if (useMotion) {
    return (
      <motion.div
        variants={cardMotion}
        initial="rest"
        whileHover="hover"
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
