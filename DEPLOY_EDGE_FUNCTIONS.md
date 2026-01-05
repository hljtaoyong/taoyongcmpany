# Supabase Edge Functions 部署指南

## 前置要求

1. 安装 Supabase CLI
```bash
npm install -g supabase
```

2. 登录 Supabase
```bash
supabase login
```

3. 链接项目
```bash
cd F:\taoyongcmpany
supabase link --project-ref YOUR_PROJECT_REF
```

## 配置 Secrets

在 Supabase Dashboard → Settings → Edge Functions 中配置以下密钥：

### AI 服务
- `OPENAI_API_KEY`: OpenAI API Key (用于 GPT-4o)
- `ANTHROPIC_API_KEY`: Anthropic API Key (用于 Claude 3.5 Sonnet)
- `GEMINI_API_KEY`: Google AI API Key (用于 Gemini 1.5 Pro)

### 微信小程序
- `WECHAT_APPID`: 微信小程序 AppID
- `WECHAT_APPSECRET`: 微信小程序 AppSecret

## 部署 Functions

```bash
# 部署所有函数
supabase functions deploy

# 单独部署某个函数
supabase functions deploy ai-bridge
supabase functions deploy mp-sync
supabase functions deploy ai-task-breakdown
```

## 执行数据库迁移

在 Supabase Dashboard → SQL Editor 中执行：

1. `supabase_migrations/create_profiles_table.sql`
2. 其他已有的表迁移

## 本地开发

```bash
# 启动本地开发服务器
supabase functions serve

# 测试函数
curl -X POST http://localhost:54321/functions/v1/ai-bridge \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","prompt":"Hello","stream":false}'
```

## 生产环境端点

部署后，Edge Functions 可通过以下 URL 访问：

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-bridge
https://YOUR_PROJECT_REF.supabase.co/functions/v1/mp-sync
https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-task-breakdown
```

## 验证部署

1. 测试 AI Bridge:
```javascript
const { data } = await supabase.functions.invoke('ai-bridge', {
  body: { model: 'gpt-4o', prompt: '你好', stream: false }
})
```

2. 测试小程序登录 (需要微信 code):
```javascript
const { data } = await supabase.functions.invoke('mp-sync', {
  body: { action: 'login', code: '微信登录code' }
})
```

3. 测试任务拆解:
```javascript
const { data } = await supabase.functions.invoke('ai-task-breakdown', {
  body: { input: '下周二要去上海出差' }
})
```

## 监控日志

在 Supabase Dashboard → Edge Functions → Logs 中查看函数调用日志。
