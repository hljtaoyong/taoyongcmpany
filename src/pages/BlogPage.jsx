/**
 * [INPUT]: 依赖 react 的 useState/useEffect, 依赖 @/lib/posts 的 getAllPosts/getCategories/getTags, 依赖 @/contexts/AuthContext 的 useAuth, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的动效预设, 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/input 的 Input, 依赖 react-router-dom 的 Link
 * [OUTPUT]: 导出 BlogPage 博客列表页面,文章列表/分类筛选/标签筛选/搜索,苹果极简风格
 * [POS]: pages 层博客列表页,展示所有博客文章
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllPosts,
  getCategories,
  getTags,
  searchPosts
} from '@/lib/posts'
import { staggerContainer, staggerItem, tapScale, hoverLift } from '@/lib/motion'
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Search,
  PenTool,
  Tag,
  Folder,
  ChevronRight
} from 'lucide-react'

// ============================================
// 子组件 - 文章卡片
// ============================================

function PostCard({ post }) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={hoverLift.hover}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
    >
      {/* 封面图片 */}
      {post.cover_image && (
        <Link to={`/blog/${post.slug}`}>
          <div className="relative h-48 overflow-hidden bg-gray-100">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      )}

      {/* 文章内容 */}
      <div className="p-6">
        {/* 分类和标签 */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.category && (
            <Link
              to={`/blog?category=${encodeURIComponent(post.category)}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              <Folder className="w-3 h-3" />
              {post.category}
            </Link>
          )}
          {post.tags && post.tags.slice(0, 2).map((tag) => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </Link>
          ))}
        </div>

        {/* 标题 */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* 摘要 */}
        {post.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* 元信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.published_at || post.created_at).toLocaleDateString('zh-CN')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.ceil(post.content.length / 400)} 分钟阅读
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {post.like_count || 0}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ============================================
// 主页面 - BlogPage
// ============================================

export function BlogPage() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // 筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)

  // 加载文章
  const loadPosts = async (category = null, tag = null) => {
    try {
      setLoading(true)
      setError(null)
      const { posts: data } = await getAllPosts({
        category,
        tag,
        includeDrafts: !!user
      })
      setPosts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 加载分类和标签
  const loadFilters = async () => {
    try {
      const [cats, tags] = await Promise.all([
        getCategories(),
        getTags()
      ])
      setCategories(cats || [])
      setAllTags(tags || [])
    } catch (err) {
      console.error('加载筛选失败:', err)
    }
  }

  useEffect(() => {
    loadPosts()
    loadFilters()
  }, [])

  // 搜索
  useEffect(() => {
    if (searchQuery.trim()) {
      searchPosts(searchQuery)
        .then(setPosts)
        .catch(() => {
          // 如果搜索失败，使用前端筛选
          const filtered = posts.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          setPosts(filtered)
        })
    } else {
      loadPosts(selectedCategory, selectedTag)
    }
  }, [searchQuery])

  // 切换分类
  const handleCategoryChange = (category) => {
    const newCategory = selectedCategory === category ? null : category
    setSelectedCategory(newCategory)
    loadPosts(newCategory, selectedTag)
  }

  // 切换标签
  const handleTagChange = (tag) => {
    const newTag = selectedTag === tag ? null : tag
    setSelectedTag(newTag)
    loadPosts(selectedCategory, newTag)
  }

  // 活跃文章数量
  const activePosts = posts.filter(p => p.is_published || user)

  // 未登录状态提示
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              个人博客
            </h1>
            <p className="text-gray-600 text-lg">
              登录后可以查看所有文章，包括草稿
            </p>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="mt-6 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              使用 Google 登录
            </Button>
          </motion.div>

          {/* 显示已发布的文章 */}
          {!loading && posts.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </motion.div>
          )}
        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                个人博客
              </h1>
              <p className="text-gray-600">
                分享技术、记录生活、交流想法
              </p>
            </div>

            {user && (
              <Link to="/blog/new">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <PenTool className="w-4 h-4" />
                  写文章
                </Button>
              </Link>
            )}
          </div>

          {/* 搜索框 */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文章..."
              className="pl-12"
            />
          </div>

          {/* 分类筛选 */}
          {categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">分类</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !selectedCategory
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  全部
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">标签</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            加载中...
          </div>
        )}

        {/* 文章列表 */}
        {!loading && activePosts.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activePosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.div>
        )}

        {/* 空状态 */}
        {!loading && activePosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <PenTool className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              {searchQuery ? '没有找到相关文章' : '暂无文章，开始创作吧！'}
            </p>
          </motion.div>
        )}
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}

export default BlogPage
