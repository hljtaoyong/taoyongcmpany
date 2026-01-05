/**
 * [INPUT]: 依赖 react 的 useState/useEffect/useRef, 依赖 @/lib/supabase 的 supabase.functions, 依赖 framer-motion 的 motion/AnimatePresence, 依赖 lucide-react 的 Sparkles/X/ChevronDown
 * [OUTPUT]: 导出 AIAssistant 悬浮助手组件,支持 Stream 响应/上下文注入/一键润色
 * [POS]: components 层 AI 助手,全局悬浮组件,被 NotesPage/TodosPage 引入
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ChevronDown, Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// ============================================
// AI 思考呼吸光效
// ============================================

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">AI 正在思考...</span>
    </div>
  )
}

// ============================================
// 主组件 - AIAssistant
// ============================================

export function AIAssistant({ contextType = 'notes' }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // ============================================
  // Stream 处理
  // ============================================

  const sendMessage = async () => {
    if (!input.trim() || !user) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)
    setStreamingMessage('')

    try {
      const { data: { stream }, error } = await supabase.functions.invoke('ai-bridge', {
        body: {
          model: selectedModel,
          prompt: input,
          stream: true,
          context: {
            userId: user.id,
            includeNotes: contextType === 'notes',
            includeTodos: contextType === 'todos',
            limit: 5,
          },
        },
      })

      if (error) throw error

      // 处理 Stream
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let accumulatedMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedMessage += chunk
        setStreamingMessage(accumulatedMessage)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulatedMessage }])
      setStreamingMessage('')
      setIsThinking(false)
    } catch (error) {
      console.error('AI Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
      }])
      setIsThinking(false)
    }
  }

  // ============================================
  // 快捷操作
  // ============================================

  const handlePolish = async (text) => {
    setInput(`请帮我润色以下文字，使其更简洁专业：\n\n${text}`)
    setIsOpen(true)
    setIsMinimized(false)
  }

  const handleGenerateReport = async () => {
    setInput(`请根据我最近的任务，帮我生成一份周报，包含：本周完成的工作、遇到的挑战、下周计划`)
    setIsOpen(true)
    setIsMinimized(false)
    sendMessage()
  }

  // ============================================
  // 渲染
  // ============================================

  return (
    <>
      {/* 悬浮按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-8 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        style={{
          boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.4)',
        }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* 对话窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-8 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">AI 助手</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 text-white transition-transform ${isMinimized ? '' : 'rotate-180'}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* 模型选择 */}
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4o">GPT-4o (OpenAI)</option>
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
              </select>
            </div>

            {/* 消息区域 */}
            {!isMinimized && (
              <>
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                      <p className="text-sm">有什么可以帮你的吗？</p>
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={handleGenerateReport}
                          className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                        >
                          生成周报
                        </button>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {streamingMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-gray-100 text-gray-900">
                        {streamingMessage}
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="inline-block ml-1"
                        >
                          ▊
                        </motion.span>
                      </div>
                    </motion.div>
                  )}

                  {isThinking && !streamingMessage && <ThinkingIndicator />}

                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="输入问题..."
                      disabled={isThinking}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isThinking || !input.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isThinking ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAssistant
