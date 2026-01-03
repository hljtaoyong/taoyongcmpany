-- ============================================
-- 添加 Google Calendar 同步支持
-- 执行方式: Supabase Dashboard → SQL Editor → 粘贴执行
-- ============================================

-- 添加 Google Calendar 事件 ID 字段
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- 添加是否已同步到日历的标记
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS is_synced_to_calendar BOOLEAN DEFAULT FALSE;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_todos_calendar_event_id ON public.todos(google_calendar_event_id);

-- ============================================
-- 完成!
-- ============================================
