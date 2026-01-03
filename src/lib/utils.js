/**
 * [INPUT]: 依赖 clsx 的条件类名合并, 依赖 tailwind-merge 的 twMerge 去重
 * [OUTPUT]: 导出 cn() 工具函数
 * [POS]: lib 层工具函数,被所有 UI 组件依赖
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
