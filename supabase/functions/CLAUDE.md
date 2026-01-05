# functions/
> L2 | 父级: ../CLAUDE.md

成员清单
ai-bridge/: AI 调度中心,多模型切换/GPT-4o/Claude/Gemini,Stream 响应,上下文检索 (notes/todos)
mp-sync/: 小程序集成网关,微信登录/订阅消息/小程序码生成,JWT 校验,profiles 表扩展
ai-task-breakdown/: AI 任务自动拆解,自然语言转任务列表,日期解析,自动调度提醒

## I/O 契约

### ai-bridge
INPUT: `{ model: 'gpt-4o'|'claude-3.5-sonnet'|'gemini-1.5-pro', prompt: string, stream: boolean, context: { userId, includeNotes, includeTodos, limit } }`
OUTPUT: `ReadableStream` - SSE 格式流式响应
ENDPOINT: `/functions/v1/ai-bridge`
SECRETS: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`

### mp-sync
INPUT (login): `{ code: string }` → OUTPUT: `{ profile: { id, wechat_openid, wechat_unionid } }`
INPUT (send-message): `{ template_id, page, data }` → OUTPUT: `{ success: boolean }`
INPUT (get-qrcode): `?scene=xxx&page=xxx` → OUTPUT: `{ qrcode: base64 }`
ENDPOINT: `/functions/v1/mp-sync/{login|send-message|get-qrcode}`
SECRETS: `WECHAT_APPID`, `WECHAT_APPSECRET`

### ai-task-breakdown
INPUT: `{ input: string }` (自然语言需求)
OUTPUT: `{ success, summary, tasksCreated, tasksFailed, tasks: [{ title, description, due_date, priority, category }] }`
ENDPOINT: `/functions/v1/ai-task-breakdown`
SECRETS: `OPENAI_API_KEY`

法则: 成员完整·一行一文件·父级链接·技术词前置

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
