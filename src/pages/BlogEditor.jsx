/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 @/lib/posts 的 createPost/updatePost/getPostById/generateSlug/isSlugExists, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/input 的 Input, 依赖 @/components/ui/textarea 的 Textarea, 依赖 react-router-dom 的 useParams/Link
 * [OUTPUT]: 导出 BlogEditor 博客编辑器,文章创建/编辑/预览/发布,Markdown 支持
 * [POS]: pages 层博客编辑器,用于创建和编辑博客文章
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import {
  createPost,
  updatePost,
  getPostBySlug,
  generateSlug,
  isSlugExists
} from '@/lib/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fadeInUp } from '@/lib/motion'
import {
  Save,
  Eye,
  PenTool,
  X,
  Upload,
  Image as ImageIcon,
  ChevronLeft
} from 'lucide-react'

// ============================================
// Markdown 预览组件
// ============================================

function MarkdownPreview({ content }) {
  const renderMarkdown = (text) => {
    if (!text) return '<p class="text-gray-400 italic">预览内容将在这里显示...</p>'

    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-6 mb-4">${line.slice(2)}</h1>`
        if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-5 mb-3">${line.slice(3)}</h2>`
        if (line.startsWith('### ')) return `<h3 class="text-xl font-bold mt-4 mb-2">${line.slice(4)}</h3>`
        if (line.startsWith('- ')) return `<li class="ml-6 my-1">${line.slice(2)}</li>`
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
        if (line.startsWith('    ')) return `<pre class="bg-gray-100 p-4 rounded-lg my-2 overflow-x-auto text-sm">${line.slice(4)}</pre>`
        if (line.startsWith('```')) return ''
        if (!line.trim()) return '<br />'
        if (line.startsWith('<')) return line
        return `<p class="my-2">${line}</p>`
      })
      .join('\n')
  }

  return (
    <div
      className="prose prose-sm max-w-none p-6 bg-white rounded-xl border border-gray-200 min-h-[400px]"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

// ============================================
// 主页面 - BlogEditor
// ============================================

export function BlogEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [isEditMode, setIsEditMode] = useState(!!slug)

  // 表单状态
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  // UI 状态
  const [activeTab, setActiveTab] = useState('write') // write | preview
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [slugError, setSlugError] = useState('')

  // 加载文章（编辑模式）
  useEffect(() => {
    async function loadPost() {
      if (!slug) return

      try {
        // 根据 slug 查找文章
        const post = await getPostBySlug(slug)
        if (!post) {
          setError('文章不存在')
          return
        }

        setTitle(post.title)
        setContent(post.content)
        setExcerpt(post.excerpt || '')
        setCoverImage(post.cover_image || '')
        setCategory(post.category || '')
        setTags(post.tags ? post.tags.join(', ') : '')
        setIsPublished(post.is_published)
        setIsFeatured(post.is_featured)
      } catch (err) {
        setError('加载文章失败')
      }
    }

    loadPost()
  }, [slug])

  // 自动生成 slug
  useEffect(() => {
    if (title && !isEditMode) {
      const newSlug = generateSlug(title)
      // 验证 slug 是否存在
      isSlugExists(newSlug).then(exists => {
        if (exists) {
          setSlugError('此 URL 已被使用，请修改标题')
        } else {
          setSlugError('')
        }
      })
    }
  }, [title, isEditMode])

  const handleSave = async (publish = false) => {
    if (!user) {
      setError('请先登录')
      return
    }

    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空')
      return
    }

    const postSlug = isEditMode ? slug : generateSlug(title)
    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    setSaving(true)
    setError(null)

    try {
      if (isEditMode) {
        // 获取文章
        const post = await getPostBySlug(slug)
        if (post) {
          await updatePost(post.id, user.id, {
            title,
            slug: postSlug,
            content,
            excerpt: excerpt || content.substring(0, 200) + '...',
            coverImage: coverImage || null,
            category: category || null,
            tags: tagsArray,
            isPublished: publish,
            isFeatured
          })
        }
      } else {
        await createPost(user.id, {
          title,
          slug: postSlug,
          content,
          excerpt: excerpt || content.substring(0, 200) + '...',
          coverImage: coverImage || null,
          category: category || null,
          tags: tagsArray,
          isPublished: publish,
          isFeatured
        })
      }

      navigate(`/blog/${postSlug}`)
    } catch (err) {
      setError(err.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 未登录状态
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">登录后即可创建文章</p>
          <Link to="/blog">
            <Button>返回博客</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Link to="/blog">
              <Button variant="ghost" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                返回
              </Button>
            </Link>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '保存草稿'}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600"
              >
                <PenTool className="w-4 h-4" />
                {saving ? '发布中...' : '发布文章'}
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? '编辑文章' : '创建新文章'}
          </h1>
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* 编辑器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          style={{
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
          }}
        >
          {/* 基本信息 */}
          <div className="p-6 space-y-4 border-b border-gray-200">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题..."
              className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
            />
            {slugError && (
              <p className="text-sm text-red-600">{slugError}</p>
            )}

            <Input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="摘要（可选，留空则自动生成）..."
              className="border-gray-300"
            />

            <div className="flex gap-4">
              <Input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="封面图片 URL（可选）..."
                className="flex-1"
              />
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">上传</span>
              </label>
            </div>

            <div className="flex gap-4">
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="分类（可选）..."
                className="flex-1"
              />
              <Input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="标签（用逗号分隔）..."
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">设为精选</span>
              </label>
            </div>
          </div>

          {/* 标签页 */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('write')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'write'
                    ? 'text-violet-600 border-b-2 border-violet-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                编辑
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'text-violet-600 border-b-2 border-violet-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                预览
              </button>
            </div>
          </div>

          {/* 编辑区 */}
          <div className="p-6">
            {activeTab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始写作... 支持 Markdown 语法

# 标题
## 副标题

**粗体** *斜体*

- 列表项1
- 列表项2

```
代码块
```

[链接](https://example.com)"
                className="w-full min-h-[400px] p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-violet-500 focus:outline-none resize-y font-mono text-sm"
              />
            ) : (
              <MarkdownPreview content={content} />
            )}
          </div>
        </motion.div>

        {/* Markdown 快速参考 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="font-semibold text-gray-800 mb-3">Markdown 快速参考</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <code className="text-violet-600"># 标题</code>
              <p className="text-gray-500 text-xs mt-1">一级标题</p>
            </div>
            <div>
              <code className="text-violet-600">**粗体**</code>
              <p className="text-gray-500 text-xs mt-1">粗体文字</p>
            </div>
            <div>
              <code className="text-violet-600">*斜体*</code>
              <p className="text-gray-500 text-xs mt-1">斜体文字</p>
            </div>
            <div>
              <code className="text-violet-600">[文字](链接)</code>
              <p className="text-gray-500 text-xs mt-1">超链接</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BlogEditor
