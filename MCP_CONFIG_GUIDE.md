# Supabase MCP 配置指南

## 当前状态

✅ `.mcp.json` 配置文件已创建在项目根目录
⏳ 需要你填写 Supabase 凭证

---

## 配置步骤

### 第一步：获取 Supabase 凭证

#### 1. 获取 Project URL
- 打开 https://supabase.com/dashboard
- 选择你之前创建的项目
- 点击左侧 **Project Settings** (齿轮图标)
- 点击 **API** 子菜单
- 复制 **Project URL**（格式：`https://xxxxx.supabase.co`）

#### 2. 获取 Service Role Key
- 在同一个 **API** 页面
- 找到 **service_role** key
- 点击右侧的 "Show" 查看完整密钥
- 点击 "Copy" 复制（⚠️ 此密钥拥有完全权限，切勿泄露）

---

### 第二步：填入配置文件

打开项目根目录的 `.mcp.json` 文件，替换以下内容：

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--supabase-url",
        "你复制的Project URL",
        "--supabase-key",
        "你复制的service_role key"
      ]
    }
  }
}
```

**示例**：
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--supabase-url",
        "https://abcdefgh.supabase.co",
        "--supabase-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsInJlbSI6InNlcnZpY2Vfcm9sZV9hcGkiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiZXhwIjoxOTgzODA4MDAwLCJpYXQiOjE3MjY4MDAwMDAsInN1YiI6InN1Yl9yb2xlIn0.very-long-key-here"
      ]
    }
  }
}
```

---

### 第三步：重启 Claude Code

配置完成后，**完全退出** Claude Code 并重新启动。

---

## 验证连接

重启后，在对话中输入：

```
列出我 Supabase 数据库中的所有表
```

如果配置成功，我会返回当前的表列表（可能为空或只有默认表）。

---

## 下一步：创建 todos 表

连接成功后，我会帮你：
1. 创建 todos 表
2. 插入测试数据
3. 创建前端 todos.js 操作模块

---

## 常见问题

**Q: 提示 "command not found"**
A: 确保已安装 Node.js 18+，运行 `node -v` 检查

**Q: 连接超时**
A: 检查网络，确认 Supabase 项目未暂停

**Q: "Invalid API key"**
A: 确认使用的是 `service_role` key，不是 `anon` key

**Q: MCP 图标不显示**
A: 检查 JSON 格式是否正确（可使用 jsonlint.com 验证）
