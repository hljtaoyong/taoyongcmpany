/**
 * [INPUT]: 依赖 @supabase/supabase-js 的 createClient, 依赖环境变量 VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY
 * [OUTPUT]: 导出 supabase 客户端实例
 * [POS]: lib 层数据库客户端,被所有需要 Supabase 的模块消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { createClient } from '@supabase/supabase-js'

// ============================================
// Supabase 客户端初始化
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file:\n' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// 数据库表类型定义 (TypeScript)
// ============================================

/**
 * 用户资料表结构 (如需创建)
 * CREATE TABLE profiles (
 *   id UUID REFERENCES auth.users PRIMARY KEY,
 *   email TEXT,
 *   full_name TEXT,
 *   avatar_url TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 */
