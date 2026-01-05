# 授权与设置完整清单

## 🔴 必需项 (基础功能运行)

### 1. 环境变量配置 (.env)

**文件位置**: `F:\taoyongcmpany\.env`

**检查方法**:
```bash
cat .env
```

**必需配置**:
```bash
# Supabase 项目 URL (Supabase Dashboard → Project Settings → API)
VITE_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase 匿名公钥 (Supabase Dashboard → Project Settings → API)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**如何获取**:
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制 **Project URL** 和 **anon public key**

---

### 2. 数据库表创建

**执行方式**: Supabase Dashboard → SQL Editor → 粘贴执行

#### ✅ 已有表 (可能已创建)
- `todos` - 待办任务 (src/pages/TodosPage)
- `alarms` - 闹钟提醒 (src/pages/AlarmsPage)
- `notes` - 即时便签 (src/pages/NotesPage)
- `posts` - 博客文章 (src/pages/BlogPage)

#### ⚠️ 需要创建的表

**1. profiles 表扩展** (微信集成需要)
```sql
-- 文件: supabase_migrations/create_profiles_table.sql
-- 执行: Supabase Dashboard → SQL Editor → 粘贴此文件内容 → Run
```

**验证方法**:
```sql
-- 在 Supabase SQL Editor 中执行
SELECT * FROM profiles LIMIT 1;

-- 检查列是否包含 wechat_openid, wechat_unionid
```

**2. Google Calendar 同步字段** (可选)
```sql
-- 文件: supabase_migrations/add_calendar_sync.sql
-- 功能: 为 todos 表添加 Google Calendar 同步字段
```

---

### 3. Google OAuth 认证 (用户登录)

**配置位置**: Supabase Dashboard → Authentication → Providers

**步骤**:
1. 进入 **Authentication** → **Providers**
2. 启用 **Google** provider
3. 配置回调 URL: `https://你的域名.com/auth/callback`
4. 本地开发: `http://localhost:5173/auth/callback`

**验证方法**:
- 访问网站，点击登录按钮
- 检查是否能弹出 Google 登录窗口

---

## 🟡 可选项 (高级功能)

### 4. Edge Functions Secrets (AI 功能)

**配置位置**: Supabase Dashboard → Settings → Edge Functions

#### 方案 A: 仅使用本地 OCR (推荐新手)
**无需配置 Secrets** ✅
- Tesseract.js 在浏览器本地运行
- 完全免费，无需 API Key
- 支持中英文混合识别

#### 方案 B: 启用 AI 功能 (需 API Key)
**如果需要以下功能，需要配置 Secrets**:

| 功能 | Secret Key | 获取地址 |
|------|-----------|---------|
| **AI 助手对话** | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| **AI 任务拆解** | `OPENAI_API_KEY` | 同上 (GPT-4o) |
| **Claude 对话** | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| **Gemini 对话** | `GEMINI_API_KEY` | [makersuite.google.com](https://makersuite.google.com/app/apikey) |
| **OCR (备选)** | `OPENAI_API_KEY` | 同上 (GPT-4o Vision) |

**配置步骤**:
1. 进入 Supabase Dashboard → **Settings** → **Edge Functions**
2. 点击 **Add Secret**
3. Name: `OPENAI_API_KEY`, Value: `sk-...`
4. 重复添加其他 Secrets

**验证方法**:
```javascript
// 在浏览器控制台测试
const { data, error } = await supabase.functions.invoke('ai-bridge', {
  body: { model: 'gpt-4o', prompt: '你好', stream: false }
})
console.log(data) // 应该返回 AI 回复
```

---

### 5. 微信小程序集成 (可选)

**配置位置**: Supabase Dashboard → Settings → Edge Functions

**Secrets**:
| Secret Key | 获取地址 |
|-----------|---------|
| `WECHAT_APPID` | 微信公众平台 → 开发 → 开发管理 → 开发者ID |
| `WECHAT_APPSECRET` | 微信公众平台 → 开发 → 开发管理 → 开发者密码 |

**依赖**: 需要先配置 `profiles` 表 (见第 2 条)

---

## 🟢 Edge Functions 部署 (可选)

### 前置要求
```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录
supabase login

# 3. 链接项目 (替换 YOUR_PROJECT_REF)
supabase link --project-ref YOUR_PROJECT_REF
```

**获取 PROJECT_REF**:
- Supabase Dashboard → Project Settings → General → **Project Reference**

### 部署命令

```bash
# 方式 1: 部署所有函数
supabase functions deploy

# 方式 2: 单独部署
supabase functions deploy ai-bridge
supabase functions deploy mp-sync
supabase functions deploy ai-task-breakdown
supabase functions deploy ocr-bridge
```

### 验证部署

```bash
# 测试 AI Bridge
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-bridge \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","prompt":"Hello","stream":false}'
```

---

## 📋 快速检查清单

### ✅ 基础功能 (必须)
- [ ] `.env` 文件已配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase 项目已创建
- [ ] 数据库表已创建: `todos`, `alarms`, `notes`, `posts`
- [ ] Google OAuth 已启用 (用户登录)
- [ ] `profiles` 表已创建 (如果需要微信集成)

### ✅ AI 功能 (可选)
- [ ] Edge Functions 已部署: `ai-bridge`, `ai-task-breakdown`, `ocr-bridge`
- [ ] `OPENAI_API_KEY` 已配置 (Supabase Dashboard → Settings → Edge Functions)
- [ ] 其他 API Keys 已配置 (可选): `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`

### ✅ 微信集成 (可选)
- [ ] `WECHAT_APPID` 和 `WECHAT_APPSECRET` 已配置
- [ ] `mp-sync` Edge Function 已部署
- [ ] 微信小程序已创建并关联

---

## 🧪 测试方法

### 测试 1: 环境变量是否正确
```javascript
// 浏览器控制台
console.log(import.meta.env.VITE_SUPABASE_URL) // 应该显示 URL
```

### 测试 2: 数据库连接
```javascript
// 浏览器控制台
const { data, error } = await supabase.from('todos').select('*')
console.log(error) // 应该为 null
```

### 测试 3: 用户登录
- 访问网站
- 点击登录按钮
- 检查是否能成功登录

### 测试 4: 截图 OCR 功能 (本地)
1. 进入 `/todos` 或 `/notes` 页面
2. 按 `Alt+S` 触发截图
3. 拖拽选择区域
4. 点击确认
5. 点击"OCR 识别"
6. 检查是否能识别出文字

### 测试 5: AI 功能 (需要 API Key)
```javascript
// 浏览器控制台
const { data, error } = await supabase.functions.invoke('ai-bridge', {
  body: { model: 'gpt-4o', prompt: '你好', stream: false }
})
console.log(data)
```

---

## ⚠️ 常见问题

### Q1: 登录后立即退出
**原因**: `profiles` 表未创建或触发器未设置
**解决**: 执行 `create_profiles_table.sql`

### Q2: OCR 识别失败
**原因**: Tesseract.js 语言包未下载完成
**解决**: 等待首次加载完成 (约 20MB)，之后会缓存

### Q3: Edge Function 调用失败
**原因**: API Key 未配置或函数未部署
**解决**: 检查 Supabase Dashboard → Settings → Edge Functions

### Q4: 快捷键 Alt+S 无反应
**原因**: 不在应用页面或浏览器权限被拦截
**解决**:
- 确保在 `/todos`, `/alarms`, `/notes`, `/blog` 页面
- 检查浏览器是否允许屏幕录制权限

---

## 📞 获取帮助

**检查日志位置**:
- Supabase Dashboard → Edge Functions → Logs
- 浏览器控制台 (F12 → Console)

**当前代码状态**:
- ✅ 所有代码已提交到 Git
- ✅ Vercel 正在自动部署
- ⏳ 等待部署完成后访问生产环境测试
