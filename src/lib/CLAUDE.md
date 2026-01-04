# lib/
> L2 | 父级: ../CLAUDE.md

成员清单
utils.js: cn() 工具函数,clsx + tailwind-merge 类名合并去重
motion.js: Apple 级动效系统,Spring 物理引擎预设
supabase.js: Supabase 客户端初始化,从环境变量读取凭证
auth.js: 认证工具函数,signInWithGoogle/signOut/getCurrentUser
todos.js: todos CRUD 操作,getAll/getById/create/update/delete/toggle/stats
alarms.js: alarms CRUD 操作,getAll/getById/create/update/delete/toggle/clearCompleted/calculateNextTime
notes.js: notes CRUD 操作,getAll/getById/create/update/delete/togglePin/clearPinned
googleCalendar.js: Google Calendar API 集成,OAuth 认证/事件 CRUD/loadGoogleAPI
ai.js: 外部 AI 调用接口,chatAI/summarizeText/translateText/chatAIStream/getTaskPrioritySuggestions
miniprogram.js: 微信小程序集成,扫码登录/数据同步/订阅消息/生成小程序码

Apple 动效配置
- snappy: 标准交互 (stiffness: 400, damping: 30)
- gentle: 柔和过渡 (stiffness: 300, damping: 35)
- bouncy: 弹性强调 (stiffness: 500, damping: 25, mass: 0.8)
- smooth: 优雅落定 (stiffness: 200, damping: 40, mass: 1.2)
- inertia: 惯性滑动 (stiffness: 150, damping: 20, mass: 0.5)

动画模式
- fadeInUp/fadeInDown: 淡入位移
- scaleIn: 弹性缩放
- slideInLeft/slideInRight: 滑入
- staggerContainer/staggerItem: 交错进场
- hoverLift: 卡片悬浮提升
- tapScale: 按钮点击回弹
- pageTransition: 页面路由过渡

法则: 成员完整·一行一文件·父级链接·技术词前置

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
