/**
 * [INPUT]: 无外部依赖,纯动画配置对象
 * [OUTPUT]: 导出 Framer Motion variants 预设 (Apple 级 Spring 物理引擎)
 * [POS]: lib 层动画配置,被所有 landing 组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/* ========================================
   Apple 级动效系统 - Spring 物理引擎

   设计哲学:
   - Spring 物理引擎 > 线性缓动
   - 自然的起势 + 优雅的落定
   - 物理的重量感与惯性

   Spring 参数说明:
   - stiffness: 刚度 (200-500), 越大越快
   - damping: 阻尼 (20-40), 越小越弹
   - mass: 质量 (0.5-1.5), 影响惯性和体感时长
   ======================================== */

// ============================================
// Apple Spring 配置预设
// ============================================

/** 标准交互 - 按钮、卡片 hover */
export const snappy = { type: "spring", stiffness: 400, damping: 30 }

/** 柔和过渡 - 面板展开、模态框 */
export const gentle = { type: "spring", stiffness: 300, damping: 35 }

/** 弹性强调 - 成功反馈、关键元素 */
export const bouncy = { type: "spring", stiffness: 500, damping: 25, mass: 0.8 }

/** 优雅落定 - 页面过渡、大元素移动 */
export const smooth = { type: "spring", stiffness: 200, damping: 40, mass: 1.2 }

/** 惯性滑动 - 列表、轮播 */
export const inertia = { type: "spring", stiffness: 150, damping: 20, mass: 0.5 }

// ============================================
// 基础动画模式 (Spring 版)
// ============================================

/** 淡入上移 - 优雅进场 */
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
}

/** 淡入下移 */
export const fadeInDown = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
}

/** 弹性缩放 - 强调元素 */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

/** 左侧滑入 */
export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  }
}

/** 右侧滑入 */
export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  }
}

// ============================================
// 序列动画 (Stagger)
// ============================================

/** 交错容器 - 子元素依次进场 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
}

/** 交错项目 - 单个子元素 */
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  }
}

// ============================================
// 微交互 (Micro-interactions)
// ============================================

/** 卡片悬浮提升 - Apple Card 效果 */
export const hoverLift = {
  rest: {
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

/** 按钮点击回弹 - 即时反馈 */
export const tapScale = {
  rest: { scale: 1 },
  pressed: {
    scale: 0.96,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
}

/** 图标悬浮 - 微动效 */
export const iconHover = {
  rest: { rotate: 0, scale: 1 },
  hover: {
    rotate: 5,
    scale: 1.1,
    transition: { type: "spring", stiffness: 400, damping: 20 }
  }
}

// ============================================
// 模态框动画
// ============================================

/** 模态框遮罩 */
export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
}

/** 模态框内容 - 优雅落定 */
export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 35 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
}

// ============================================
// 页面路由过渡
// ============================================

/** 页面切换 - 丝滑过渡 */
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 40 }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
}

// ============================================
// 视口触发配置
// ============================================

export const viewportConfig = {
  once: true,
  amount: 0.3,
  margin: '-100px'
}

// ============================================
// 工厂函数
// ============================================

/**
 * 获取标准的 motion props (带视口触发)
 * @param {Object} variants - 动画变体对象
 * @returns {Object} Framer Motion props
 */
export const getMotionProps = (variants = fadeInUp) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: viewportConfig,
  variants
})

/**
 * 获取带悬停效果的 motion props
 * @param {Object} variants - 动画变体对象
 * @param {Object} hoverVariants - 悬停变体对象
 * @returns {Object} Framer Motion props
 */
export const getHoverMotionProps = (variants = fadeInUp, hoverVariants = hoverLift) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: viewportConfig,
  variants: { ...variants, ...hoverVariants },
  whileHover: 'hover'
})

/**
 * 获取带点击效果的 motion props
 * @param {Object} tapVariants - 点击变体对象
 * @returns {Object} Framer Motion props
 */
export const getTapMotionProps = (tapVariants = tapScale) => ({
  variants: tapVariants,
  whileTap: 'pressed'
})
