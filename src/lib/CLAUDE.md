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
posts.js: 博客文章 CRUD 操作,getAll/getBySlug/create/update/delete/publish/unpublish/search/getRelated
googleCalendar.js: Google Calendar API 集成,OAuth 认证/事件 CRUD/loadGoogleAPI
ai.js: 外部 AI 调用接口,chatAI/summarizeText/translateText/chatAIStream/getTaskPrioritySuggestions
miniprogram.js: 微信小程序集成,扫码登录/数据同步/订阅消息/生成小程序码
screenshot.ts: 屏幕捕获与裁剪,captureScreen/startSelection/captureScreenArea,快门音效/复制下载

## 跨端通讯协议

### 网站 → 小程序
1. **用户登录**: `mpLogin(code)` → 微信 code2session → profiles 表记录 openid/unionid
2. **订阅消息**:
   - 任务提醒: `sendTaskReminder(task)` → 模板消息推送
   - 闹钟提醒: `sendAlarmReminder(alarm)` → 模板消息推送
   - 周报: `sendWeeklyReport(tasks)` → 模板消息推送
3. **小程序码**: `generateMPQRCode(scene, page)` → Base64 图片

### 小程序 → 网站
1. **身份验证**: JWT token (Supabase auth)
2. **数据同步**: RESTful API (`/api/todos`, `/api/alarms`, `/api/notes`)
3. **WebSocket**: 实时更新 (Supabase realtime)

法则: 成员完整·一行一文件·父级链接·技术词前置

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
