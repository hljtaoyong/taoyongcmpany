/**
 * [INPUT]: 依赖环境变量 VITE_AI_API_KEY, 依赖外部 AI 服务 API
 * [OUTPUT]: 导出 AI 调用函数 - chatAI/summarizeText/translateText
 * [POS]: lib 层 AI 集成模块,提供通用 AI 能力
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================
// 配置
// ============================================

const AI_CONFIG = {
  // 默认使用 OpenAI 兼容接口
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  baseURL: import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
  // 备用：使用国内 AI 服务（如智谱 AI、百川等）
  fallbackURL: import.meta.env.VITE_AI_FALLBACK_URL || '',
  fallbackModel: import.meta.env.VITE_AI_FALLBACK_MODEL || ''
}

// ============================================
// 通用 AI 聊天接口
// ============================================

/**
 * 调用 AI 进行对话
 * @param {string} message - 用户消息
 * @param {Object} options - 可选配置
 * @returns {Promise<string>} AI 回复
 */
export async function chatAI(message, options = {}) {
  const {
    systemPrompt = '你是一个有帮助的 AI 助手。',
    temperature = 0.7,
    maxTokens = 1000
  } = options

  if (!AI_CONFIG.apiKey) {
    throw new Error('AI API Key 未配置，请设置 VITE_AI_API_KEY 环境变量')
  }

  try {
    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'AI 调用失败')
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('AI 调用失败:', error)

    // 尝试使用备用 API
    if (AI_CONFIG.fallbackURL) {
      return chatAIFallback(message, options)
    }

    throw error
  }
}

// ============================================
// 备用 AI 接口（国内服务）
// ============================================

async function chatAIFallback(message, options = {}) {
  const {
    systemPrompt = '你是一个有帮助的 AI 助手。',
    temperature = 0.7,
    maxTokens = 1000
  } = options

  const response = await fetch(`${AI_CONFIG.fallbackURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.fallbackModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature,
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    throw new Error('AI 服务暂时不可用')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// ============================================
// 文本摘要
// ============================================

/**
 * 生成文本摘要
 * @param {string} text - 待摘要文本
 * @param {number} maxLength - 摘要最大长度
 * @returns {Promise<string>} 摘要结果
 */
export async function summarizeText(text, maxLength = 200) {
  const prompt = `请将以下内容摘要为 ${maxLength} 字以内的简洁版本：\n\n${text}`

  return chatAI(prompt, {
    systemPrompt: '你是一个专业的文本摘要助手，擅长提取关键信息。',
    temperature: 0.5,
    maxTokens: 500
  })
}

// ============================================
// 文本翻译
// ============================================

/**
 * 翻译文本
 * @param {string} text - 待翻译文本
 * @param {string} targetLanguage - 目标语言（如：English, 日本語）
 * @returns {Promise<string>} 翻译结果
 */
export async function translateText(text, targetLanguage = 'English') {
  const prompt = `请将以下内容翻译为${targetLanguage}：\n\n${text}`

  return chatAI(prompt, {
    systemPrompt: '你是一个专业的翻译助手。',
    temperature: 0.3,
    maxTokens: 1000
  })
}

// ============================================
// 智能建议
// ============================================

/**
 * 获取任务优先级建议
 * @param {Array} tasks - 任务列表
 * @returns {Promise<string>} 建议内容
 */
export async function getTaskPrioritySuggestions(tasks) {
  const tasksDesc = tasks.map(t => `- ${t.title} (当前优先级: ${t.priority})`).join('\n')

  const prompt = `基于以下任务列表，请提供优先级调整建议：\n\n${tasksDesc}\n\n请考虑任务的重要性、紧急程度等因素，给出建议。`

  return chatAI(prompt, {
    systemPrompt: '你是一个专业的任务管理顾问，擅长时间管理和优先级排序。',
    temperature: 0.6,
    maxTokens: 800
  })
}

// ============================================
// 流式响应（用于实时显示）
// ============================================

/**
 * 流式 AI 聊天
 * @param {string} message - 用户消息
 * @param {Function} onChunk - 接收每个数据块的回调
 * @param {Object} options - 可选配置
 * @returns {Promise<void>}
 */
export async function chatAIStream(message, onChunk, options = {}) {
  const {
    systemPrompt = '你是一个有帮助的 AI 助手。',
    temperature = 0.7
  } = options

  if (!AI_CONFIG.apiKey) {
    throw new Error('AI API Key 未配置')
  }

  const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature,
      stream: true
    })
  })

  if (!response.ok) {
    throw new Error('AI 调用失败')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              onChunk(content)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
