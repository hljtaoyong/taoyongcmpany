-- ============================================
-- 博客文章表创建脚本
-- 执行方式: Supabase Dashboard → SQL Editor → 粘贴执行
-- ============================================

-- 1. 创建 posts 表
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL, -- Markdown 内容
  excerpt TEXT, -- 摘要
  cover_image TEXT, -- 封面图片 URL
  category TEXT, -- 分类
  tags TEXT[], -- 标签数组
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE, -- 是否精选
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ, -- 发布时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON public.posts(is_published);

-- 3. 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_posts_fulltext ON public.posts USING gin(
  to_tsvector('simple', title || ' ' || COALESCE(excerpt, '') || ' ' || content)
);

-- 4. 启用 Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
-- 所有人可以查看已发布的文章
CREATE POLICY "Anyone can view published posts"
  ON public.posts FOR SELECT
  USING (is_published = true);

-- 作者可以查看自己的所有文章（包括草稿）
CREATE POLICY "Authors can view own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

-- 只有作者可以创建文章
CREATE POLICY "Authors can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 只有作者可以更新自己的文章
CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- 只有作者可以删除自己的文章
CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- 6. 自动更新 updated_at 触发器
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. 创建浏览计数函数（可选）
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 示例数据（可选，删除后可插入自己的文章）
-- ============================================

-- 示例博客文章
INSERT INTO public.posts (
  user_id,
  title,
  slug,
  content,
  excerpt,
  category,
  tags,
  is_published,
  is_featured,
  published_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000'::UUID,
    '欢迎来到我的博客',
    'welcome-to-my-blog',
    '# 欢迎来到我的博客

这是我的第一篇博客文章！这个博客是基于以下技术构建的：

- React 19
- Vite 6
- TailwindCSS v4
- Supabase
- Framer Motion

## 关于这个博客

这里我会分享关于：
- 前端开发
- 技术教程
- 项目经验
- 个人思考

希望你能喜欢！
',
    '这是我的第一篇博客文章，欢迎来到我的个人博客！',
    '生活',
    ARRAY['博客', '介绍'],
    true,
    true,
    NOW()
  );

-- ============================================
-- 完成!
-- ============================================
