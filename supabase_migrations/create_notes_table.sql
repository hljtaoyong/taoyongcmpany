-- ============================================
-- Supabase Notes 表创建脚本
-- 执行方式: Supabase Dashboard → SQL Editor → 粘贴执行
-- ============================================

-- 1. 创建 notes 表
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'yellow', -- yellow, pink, blue, green, purple
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON public.notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- 3. 启用 Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 自动更新 updated_at 触发器
CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 测试数据 (可选)
-- ============================================

INSERT INTO public.notes (user_id, title, content, color, is_pinned) VALUES
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '购物清单',
    '- 牛奶
- 鸡蛋
- 面包
- 水果',
    'yellow',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '会议记录',
    '本周五下午 3 点，项目进度会议。

议题：
1. 前端开发进度
2. 后端 API 对接
3. 测试计划',
    'pink',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '灵感',
    '新的产品想法：一个 AI 驱动的便签应用...',
    'blue',
    false
  );

-- ============================================
-- 完成!
-- ============================================
