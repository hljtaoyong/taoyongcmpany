/**
 * [INPUT]: 依赖 @/lib/supabase 的 supabase 客户端
 * [OUTPUT]: 导出博客文章 CRUD 操作函数 - getAll/getBySlug/create/update/delete/publish/unpublish
 * [POS]: lib 层博客数据操作模块,被 BlogPage 和 BlogPost 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { supabase } from './supabase'

// ============================================
// 获取所有文章
// ============================================

/**
 * 获取文章列表
 * @param {Object} options - 查询选项
 * @returns {Promise<Array>}
 */
export async function getAllPosts(options = {}) {
  const {
    category = null,
    tag = null,
    featuredOnly = false,
    includeDrafts = false,
    limit = 20,
    offset = 0
  } = options

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })

  // 非作者只能看已发布的文章
  if (!includeDrafts) {
    query = query.eq('is_published', true)
  }

  if (featuredOnly) {
    query = query.eq('is_featured', true)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('获取文章列表失败:', error)
    throw error
  }

  return { posts: data, total: count || 0 }
}

// ============================================
// 获取单篇文章
// ============================================

/**
 * 根据 slug 获取文章
 * @param {string} slug - 文章 slug
 * @returns {Promise<Object>}
 */
export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('获取文章失败:', error)
    throw error
  }

  // 增加浏览次数
  await supabase
    .from('posts')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id)

  return { ...data, view_count: (data.view_count || 0) + 1 }
}

// ============================================
// 根据 ID 获取文章
// ============================================

/**
 * 根据 ID 获取文章
 * @param {string} postId - 文章 ID
 * @returns {Promise<Object>}
 */
export async function getPostById(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (error) {
    console.error('获取文章失败:', error)
    throw error
  }

  return data
}

// ============================================
// 创建文章
// ============================================

/**
 * 创建新文章
 * @param {string} userId - 用户 ID
 * @param {Object} postData - 文章数据
 * @returns {Promise<Object>}
 */
export async function createPost(userId, postData) {
  const {
    title,
    slug,
    content,
    excerpt,
    coverImage,
    category,
    tags,
    isPublished = false,
    isFeatured = false
  } = postData

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      title,
      slug,
      content,
      excerpt,
      cover_image: coverImage,
      category,
      tags,
      is_published: isPublished,
      is_featured: isFeatured,
      published_at: isPublished ? new Date().toISOString() : null
    })
    .select()
    .single()

  if (error) {
    console.error('创建文章失败:', error)
    throw error
  }

  return data
}

// ============================================
// 更新文章
// ============================================

/**
 * 更新文章
 * @param {string} postId - 文章 ID
 * @param {string} userId - 用户 ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Object>}
 */
export async function updatePost(postId, userId, updates) {
  const updateData = {}

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.slug !== undefined) updateData.slug = updates.slug
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt
  if (updates.coverImage !== undefined) updateData.cover_image = updates.coverImage
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.tags !== undefined) updateData.tags = updates.tags
  if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured

  // 如果发布状态从未发布变为已发布，设置发布时间
  if (updates.isPublished && !updateData.published_at) {
    const currentPost = await getPostById(postId)
    if (!currentPost.is_published) {
      updateData.is_published = true
      updateData.published_at = new Date().toISOString()
    }
  } else if (updates.isPublished === false) {
    updateData.is_published = false
    updateData.published_at = null
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', postId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('更新文章失败:', error)
    throw error
  }

  return data
}

// ============================================
// 删除文章
// ============================================

/**
 * 删除文章
 * @param {string} postId - 文章 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<void>}
 */
export async function deletePost(postId, userId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)

  if (error) {
    console.error('删除文章失败:', error)
    throw error
  }
}

// ============================================
// 发布/取消发布文章
// ============================================

/**
 * 发布文章
 * @param {string} postId - 文章 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function publishPost(postId, userId) {
  return updatePost(postId, userId, { isPublished: true })
}

/**
 * 取消发布文章
 * @param {string} postId - 文章 ID
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function unpublishPost(postId, userId) {
  return updatePost(postId, userId, { isPublished: false })
}

// ============================================
// 获取文章分类
// ============================================

/**
 * 获取所有分类
 * @returns {Promise<Array>}
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('posts')
    .select('category')

  if (error) {
    console.error('获取分类失败:', error)
    throw error
  }

  // 提取唯一分类
  const categories = [...new Set(data.map(p => p.category).filter(Boolean))]
  return categories
}

// ============================================
// 获取所有标签
// ============================================

/**
 * 获取所有标签
 * @returns {Promise<Array>}
 */
export async function getTags() {
  const { data, error } = await supabase
    .from('posts')
    .select('tags')

  if (error) {
    console.error('获取标签失败:', error)
    throw error
  }

  // 提取唯一标签
  const tags = new Set()
  data.forEach(p => {
    if (p.tags) {
      p.tags.forEach(tag => tags.add(tag))
    }
  })

  return Array.from(tags)
}

// ============================================
// 搜索文章
// ============================================

/**
 * 搜索文章
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>}
 */
export async function searchPosts(query) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('搜索文章失败:', error)
    throw error
  }

  return data
}

// ============================================
// 获取用户的文章
// ============================================

/**
 * 获取指定用户的所有文章
 * @param {string} userId - 用户 ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Array>}
 */
export async function getUserPosts(userId, options = {}) {
  const { includeDrafts = false } = options

  let query = supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!includeDrafts) {
    query = query.eq('is_published', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('获取用户文章失败:', error)
    throw error
  }

  return data
}

// ============================================
// 生成 slug
// ============================================

/**
 * 根据标题生成 URL 友好的 slug
 * @param {string} title - 文章标题
 * @returns {string}
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================
// 检查 slug 是否存在
// ============================================

/**
 * 检查 slug 是否已被使用
 * @param {string} slug - 待检查的 slug
 * @param {string} excludeId - 排除的文章 ID
 * @returns {Promise<boolean>}
 */
export async function isSlugExists(slug, excludeId = null) {
  let query = supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('检查 slug 失败:', error)
    return false
  }

  return data && data.length > 0
}

// ============================================
// 点赞文章
// ============================================

/**
 * 点赞文章
 * @param {string} postId - 文章 ID
 * @returns {Promise<Object>}
 */
export async function likePost(postId) {
  const { data, error } = await supabase
    .from('posts')
    .update({ like_count: supabase.raw('like_count + 1') })
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    console.error('点赞失败:', error)
    throw error
  }

  return data
}

// ============================================
// 获取相关文章
// ============================================

/**
 * 获取相关文章（基于分类或标签）
 * @param {string} postId - 当前文章 ID
 * @param {string} category - 分类
 * @param {Array} tags - 标签数组
 * @param {number} limit - 返回数量
 * @returns {Promise<Array>}
 */
export async function getRelatedPosts(postId, category, tags = [], limit = 4) {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)

  // 优先找同分类的
  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('获取相关文章失败:', error)
    return []
  }

  // 如果同分类的不够，找有相同标签的
  if (data.length < limit && tags.length > 0) {
    const remaining = limit - data.length
    const existingIds = data.map(p => p.id)

    const { data: tagData } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .neq('id', postId)
      .contains('tags', tags[0]) // 使用第一个标签
      .not('id', 'in', `(${existingIds.join(',')})`)
      .limit(remaining)

    if (tagData) {
      return [...data, ...tagData]
    }
  }

  return data
}

// ============================================
// 获取统计信息
// ============================================

/**
 * 获取文章统计信息
 * @returns {Promise<Object>}
 */
export async function getPostsStats() {
  const { data, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })

  if (error) {
    console.error('获取统计失败:', error)
    return { total: 0, published: 0, drafts: 0 }
  }

  // 获取已发布数量
  const { count: publishedCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  return {
    total: data || 0,
    published: publishedCount || 0,
    drafts: (data || 0) - (publishedCount || 0)
  }
}
