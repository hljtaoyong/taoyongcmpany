/**
 * [INPUT]: 依赖 @/lib/utils 的 cn
 * [OUTPUT]: 导出 Input 组件
 * [POS]: components/ui 的表单输入组件,支持内凹微拟物效果
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-base",
        "transition-all duration-200",
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus-visible:shadow-[inset_0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.03)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
