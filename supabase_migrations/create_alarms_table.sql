-- ============================================
-- Supabase Alarms 表创建脚本
-- 执行方式: Supabase Dashboard → SQL Editor → 粘贴执行
-- ============================================

-- 1. 创建 alarms 表
CREATE TABLE IF NOT EXISTS public.alarms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  alarm_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- daily, weekly, monthly
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_alarms_user_id ON public.alarms(user_id);
CREATE INDEX IF NOT EXISTS idx_alarms_alarm_time ON public.alarms(alarm_time);
CREATE INDEX IF NOT EXISTS idx_alarms_is_active ON public.alarms(is_active);

-- 3. 启用 Row Level Security
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
CREATE POLICY "Users can view own alarms"
  ON public.alarms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alarms"
  ON public.alarms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alarms"
  ON public.alarms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alarms"
  ON public.alarms FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 自动更新 updated_at 触发器
CREATE TRIGGER set_alarms_updated_at
  BEFORE UPDATE ON public.alarms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 测试数据 (可选)
-- ============================================

-- 示例闹钟数据
INSERT INTO public.alarms (user_id, title, description, alarm_time, is_recurring, recurrence_pattern) VALUES
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '晨会提醒',
    '每日 9:00 AM 团队晨会',
    NOW() + INTERVAL '1 hour',
    true,
    'daily'
  ),
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '午休时间',
    '12:00 PM 午餐休息',
    (NOW() + INTERVAL '3 hours')::TIMESTAMPTZ,
    true,
    'daily'
  );

-- ============================================
-- 完成!
-- ============================================
