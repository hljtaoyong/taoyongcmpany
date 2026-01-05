/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 @/lib/posts 的 getPostBySlug/getRelatedPosts, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 @/components/ui/button 的 Button, 依赖 react-router-dom 的 useParams/Link
 * [OUTPUT]: 导出 BlogPost 文章详情页面,Markdown 渲染/相关文章/点赞,苹果极简风格
 * [POS]: pages 层博客文章详情页,展示单篇文章内容
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { getPostBySlug, getRelatedPosts, likePost } from '@/lib/posts'
import { fadeInUp } from '@/lib/motion'
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  PenTool
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// 简单的 Markdown 渲染
function MarkdownContent({ content }) {
  const renderMarkdown = (text) => {
    if (!text) return ''

    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-6 mb-4 text-gray-900">${line.slice(2)}</h1>`
        if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-5 mb-3 text-gray-900">${line.slice(3)}</h2>`
        if (line.startsWith('### ')) return `<h3 class="text-xl font-bold mt-4 mb-2 text-gray-900">${line.slice(4)}</h3>`
        if (line.startsWith('- ')) return `<li class="ml-6 my-1 text-gray-700">${line.slice(2)}</li>`
        if (line.match(/^\d+\. /)) return `<li class="ml-6 my-1 text-gray-700">${line.replace(/^\d+\. /, '')}</li>`
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
        if (line.startsWith('```')) return ''
        if (line.startsWith('    ')) return `<pre class="bg-gray-100 p-4 rounded-lg my-2 overflow-x-auto text-sm text-gray-800">${line.slice(4)}</pre>`
        line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
        if (!line.trim()) return '<br />'
        if (line.startsWith('<') || line.startsWith('<br') || line.startsWith('<h') || line.startsWith('<li') || line.startsWith('<pre')) {
          return line
        }
        return `<p class="my-2 text-gray-700">${line}</p>`
      })
      .join('\n')
  }

  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

// ============================================
// 主页面 - BlogPost
// ============================================

export function BlogPost() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    async function loadPost() {
      if (!slug) return

      try {
        setLoading(true)
        const data = await getPostBySlug(slug)
        setPost(data)

        if (data) {
          const related = await getRelatedPosts(
            data.id,
            data.category,
            data.tags || []
          )
          setRelatedPosts(related)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [slug])

  const handleLike = async () => {
    if (!post) return

    try {
      await likePost(post.id)
      setPost({
        ...post,
        like_count: (post.like_count || 0) + 1
      })
      setIsLiked(true)
    } catch (err) {
      console.error('点赞失败:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        })
      } catch (err) {
        console.log('分享取消')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章不存在</h1>
          <Link to="/blog">
            <Button className="bg-blue-600 hover:bg-blue-700">返回博客</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* 返回按钮 */}
        <Link to="/blog">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回博客
          </motion.button>
        </Link>

        {/* 文章头部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* 封面图片 */}
          {post.cover_image && (
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8 bg-gray-100">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 分类和标签 */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {post.category && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {post.category}
              </span>
            )}
            {post.tags && post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 标题 */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* 摘要 */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">
              {post.excerpt}
            </p>
          )}

          {/* 元信息 */}
          <div className="flex items-center justify-between text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at || post.created_at).toLocaleDateString('zh-CN')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.ceil(post.content.length / 400)} 分钟阅读
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.view_count || 0} 次阅读
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                disabled={isLiked}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-50 text-red-600'
                    : 'hover:bg-red-50 text-gray-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {post.like_count || 0}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 文章内容 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
        >
          <MarkdownContent content={post.content} />
        </motion.div>

        {/* 相关文章 */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* 作者操作 */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-8 border-t border-gray-200 flex gap-2"
          >
            <Link to={`/blog/edit/${post.slug}`}>
              <Button variant="outline" className="gap-2">
                <PenTool className="w-4 h-4" />
                编辑文章
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default BlogPost
