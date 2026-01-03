/**
 * [INPUT]: 依赖 @radix-ui/react-slot 的 Slot, 依赖 class-variance-authority 的 cva, 依赖 @/lib/utils 的 cn, 依赖 framer-motion 的 motion
 * [OUTPUT]: 导出 Button 组件、buttonVariants 样式配置
 * [POS]: components/ui 的核心交互原语,Apple 级点击回弹效果
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/* ========================================
   微拟物设计语言 - 渐变 + 立体阴影配置
   所有颜色派生自 CSS 变量 + color-mix
   ======================================== */

const BUTTON_STYLES = {
  default: {
    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, color-mix(in srgb, hsl(var(--primary)) 85%, black) 50%, color-mix(in srgb, hsl(var(--primary)) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, hsl(var(--primary)) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, hsl(var(--primary)) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  destructive: {
    background: 'linear-gradient(135deg, hsl(var(--destructive)) 0%, color-mix(in srgb, hsl(var(--destructive)) 85%, black) 50%, color-mix(in srgb, hsl(var(--destructive)) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, hsl(var(--destructive)) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, hsl(var(--destructive)) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  outline: {
    background: 'transparent',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
    hoverBoxShadow: '0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  secondary: {
    background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, color-mix(in srgb, hsl(var(--secondary)) 90%, black) 50%, color-mix(in srgb, hsl(var(--secondary)) 80%, black) 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.05)',
    hoverBoxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.08)',
  },
  ghost: {
    background: 'transparent',
    boxShadow: 'none',
    hoverBoxShadow: 'none',
  },
  link: {
    background: 'transparent',
    boxShadow: 'none',
    hoverBoxShadow: 'none',
  },
}

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap text-sm font-medium",
    "rounded-2xl",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "hover:scale-[1.02]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-4 text-xs rounded-xl",
        default: "h-9 px-5 py-2 rounded-2xl",
        lg: "h-12 px-10 rounded-2xl",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Apple 级按钮点击回弹动画
const buttonTap = {
  rest: { scale: 1 },
  pressed: {
    scale: 0.96,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
}

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button"
  const [isHovered, setIsHovered] = React.useState(false)

  const styleConfig = BUTTON_STYLES[variant] || BUTTON_STYLES.default
  const needsCustomStyle = !['ghost', 'link'].includes(variant)

  const combinedStyle = needsCustomStyle ? {
    background: styleConfig.background,
    boxShadow: isHovered ? styleConfig.hoverBoxShadow : styleConfig.boxShadow,
    ...style,
  } : style

  const buttonContent = (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      style={combinedStyle}
      onMouseEnter={(e) => { setIsHovered(true); props.onMouseEnter?.(e) }}
      onMouseLeave={(e) => { setIsHovered(false); props.onMouseLeave?.(e) }}
      {...props}
    />
  )

  // 使用 Framer Motion 添加点击回弹效果
  return (
    <motion.div
      variants={buttonTap}
      initial="rest"
      whileTap="pressed"
    >
      {buttonContent}
    </motion.div>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
