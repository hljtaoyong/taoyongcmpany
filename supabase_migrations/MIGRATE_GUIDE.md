# 数据库迁移执行指南

## 📋 执行清单

### 步骤 1: 进入 Supabase SQL Editor

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New query** 创建新查询

---

### 步骤 2: 按顺序执行以下 SQL 文件

**重要**: 按顺序执行，不要跳过！

#### ✅ 2.1 创建 todos 表

**操作**: 复制 `supabase_migrations/create_todos_table.sql` 的内容，粘贴到 SQL Editor，点击 **Run**

**验证执行结果**:
```sql
-- 在 SQL Editor 中执行
SELECT COUNT(*) FROM public.todos;
-- 应该返回: 6 (测试数据)
```

---

#### ✅ 2.2 创建 alarms 表

**操作**: 复制 `supabase_migrations/create_alarms_table.sql` 的内容，粘贴到 SQL Editor，点击 **Run**

**验证执行结果**:
```sql
-- 在 SQL Editor 中执行
SELECT COUNT(*) FROM public.alarms;
-- 应该返回: 2 (测试数据)
```

---

#### ✅ 2.3 创建 notes 表

**操作**: 复制 `supabase_migrations/create_notes_table.sql` 的内容，粘贴到 SQL Editor，点击 **Run**

**验证执行结果**:
```sql
-- 在 SQL Editor 中执行
SELECT COUNT(*) FROM public.notes;
-- 应该返回: 3 (测试数据)
```

---

#### ✅ 2.4 创建 posts 表

**操作**: 复制 `supabase_migrations/create_posts_table.sql` 的内容，粘贴到 SQL Editor，点击 **Run**

**验证执行结果**:
```sql
-- 在 SQL Editor 中执行
SELECT COUNT(*) FROM public.posts;
-- 应该返回: 1 (示例文章)
```

---

#### ⭐ 2.5 创建 profiles 表 (重要！用户登录需要)

**操作**: 复制 `supabase_migrations/create_profiles_table.sql` 的内容，粘贴到 SQL Editor，点击 **Run**

**验证执行结果**:
```sql
-- 在 SQL Editor 中执行
-- 检查表结构
\d public.profiles

-- 检查列是否包含微信字段
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
-- 应该看到: wechat_openid, wechat_unionid
```

---

## 🧪 全部执行完成后验证

### 验证 1: 检查所有表是否创建成功

```sql
-- 在 SQL Editor 中执行
SELECT
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = pg_tables.tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('todos', 'alarms', 'notes', 'posts', 'profiles')
ORDER BY tablename;
```

**期望结果**:
| tablename | column_count |
|-----------|--------------|
| alarms | 9 |
| notes | 7 |
| posts | 18 |
| profiles | 8 |
| todos | 9 |

---

### 验证 2: 检查 RLS 策略是否启用

```sql
-- 在 SQL Editor 中执行
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('todos', 'alarms', 'notes', 'posts', 'profiles');
```

**期望结果**: 所有表的 `rowsecurity` 应该为 `true`

---

### 验证 3: 检查触发器是否创建

```sql
-- 在 SQL Editor 中执行
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**期望结果**: 应该看到多个表的 `updated_at` 触发器和 `profiles` 表的用户创建触发器

---

## ⚠️ 常见问题

### Q1: 执行时提示 "relation already exists"

**原因**: 表已经存在

**解决方案**:
```sql
-- 检查表是否存在
SELECT * FROM pg_tables WHERE tablename = 'todos';

-- 如果存在且想重新创建，先删除
DROP TABLE IF EXISTS public.todos CASCADE;

-- 然后重新执行创建脚本
```

---

### Q2: 执行时提示 "function already exists"

**原因**: `handle_updated_at()` 函数已经存在

**解决方案**:
```sql
-- 先删除函数
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- 然后重新执行创建脚本
```

---

### Q3: 测试数据的 UUID 是什么？

**说明**: 迁移文件使用的是示例 UUID `00000000-0000-0000-0000-000000000000`

**实际使用时**:
- 这些测试数据仅用于验证表结构
- 真实用户登录后，会创建自己的数据
- RLS 策略确保用户只能访问自己的数据

**清理测试数据** (可选):
```sql
-- 清理测试数据
DELETE FROM public.todos WHERE user_id = '00000000-0000-0000-0000-000000000000'::UUID;
DELETE FROM public.alarms WHERE user_id = '00000000-0000-0000-0000-000000000000'::UUID;
DELETE FROM public.notes WHERE user_id = '00000000-0000-0000-0000-000000000000'::UUID;
DELETE FROM public.posts WHERE user_id = '00000000-0000-0000-0000-000000000000'::UUID;
```

---

## 📝 一键执行所有迁移 (高级用户)

如果你想一次性执行所有迁移，可以创建一个合并脚本：

```sql
-- ============================================
-- 一键执行所有数据库迁移
-- ============================================

-- 1. 创建通用函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建 todos 表
-- (粘贴 create_todos_table.sql 的内容，去掉测试数据部分)

-- 3. 创建 alarms 表
-- (粘贴 create_alarms_table.sql 的内容，去掉测试数据部分)

-- 4. 创建 notes 表
-- (粘贴 create_notes_table.sql 的内容，去掉测试数据部分)

-- 5. 创建 posts 表
-- (粘贴 create_posts_table.sql 的内容，去掉测试数据部分)

-- 6. 创建 profiles 表
-- (粘贴 create_profiles_table.sql 的内容)
```

---

## ✅ 完成检查清单

- [ ] todos 表已创建 (6 条测试数据)
- [ ] alarms 表已创建 (2 条测试数据)
- [ ] notes 表已创建 (3 条测试数据)
- [ ] posts 表已创建 (1 条示例文章)
- [ ] profiles 表已创建 (包含微信字段)
- [ ] 所有表的 RLS 已启用
- [ ] 所有触发器已创建

---

## 🚀 下一步

数据库迁移完成后：

1. **配置 Google OAuth** (用户登录)
   - Supabase Dashboard → Authentication → Providers → Google

2. **测试用户注册/登录**
   - 访问你的网站
   - 点击登录按钮
   - 使用 Google 登录

3. **验证数据隔离**
   - 注册两个不同账号
   - 登录账号 A 创建 todo
   - 登录账号 B 检查看不到 A 的数据

4. **(可选) 配置 AI Secrets**
   - Supabase Dashboard → Settings → Edge Functions

---

## 📞 需要帮助？

如果遇到问题，检查：
- Supabase Dashboard → SQL Editor → Query History (查看执行历史)
- Supabase Dashboard → Logs (查看错误日志)
- 浏览器控制台 (F12 → Console) 查看 Supabase 错误信息
