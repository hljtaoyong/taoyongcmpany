-- ============================================
-- Supabase Todos 表创建脚本
-- 执行方式: Supabase Dashboard → SQL Editor → 粘贴执行
-- ============================================

-- 1. 创建 todos 表
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium', -- low | medium | high
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_is_complete ON public.todos(is_complete);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);

-- 3. 启用 Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
-- 用户只能查看自己的 todos
CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的 todos
CREATE POLICY "Users can insert own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的 todos
CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的 todos
CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 测试数据 (无需认证即可插入的公开测试数据)
-- ============================================

-- 注意: 由于 RLS 策略，需要临时禁用 RLS 才能插入测试数据
-- 或在 SQL Editor 中以 authenticated 用户身份插入

-- 方式1: 临时禁用 RLS 插入测试数据
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;

-- 插入测试 todos (使用示例 UUID，实际使用时替换为真实用户 ID)
INSERT INTO public.todos (user_id, title, description, is_complete, priority, due_date) VALUES
  (
    '00000000-0000-0000-0000-000000000000'::UUID, -- 示例用户 ID
    '学习 React 19',
    '掌握 React 19 的新特性和最佳实践',
    false,
    'high',
    NOW() + INTERVAL '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '完成 Supabase 集成',
    '配置认证、数据库和实时订阅',
    false,
    'high',
    NOW() + INTERVAL '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '设计系统组件库',
    '使用 shadcn/ui 构建可复用组件',
    true,
    'medium',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '优化页面性能',
    '实现代码分割和懒加载',
    false,
    'low',
    NOW() + INTERVAL '14 days'
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '编写单元测试',
    '使用 Vitest 覆盖核心功能',
    false,
    'medium',
    NOW() + INTERVAL '10 days'
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '部署到生产环境',
    '配置 CI/CD 流程',
    false,
    'high',
    NOW() + INTERVAL '5 days'
  );

-- 重新启用 RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 验证插入
-- ============================================

SELECT
  id,
  title,
  is_complete,
  priority,
  created_at
FROM public.todos
ORDER BY created_at DESC;

-- ============================================
-- 完成!
-- ============================================
-- 表结构: public.todos
-- 记录数: 6 条测试数据
-- RLS: 已启用 (用户只能访问自己的数据)
-- ============================================
