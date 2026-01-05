// ============================================
// AI Bridge Edge Function
// 多模型 AI 调度中心 + Stream 响应
// ============================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// AI 模型接口
// ============================================

interface AIRequest {
  model: 'gpt-4o' | 'claude-3.5-sonnet' | 'gemini-1.5-pro'
  prompt: string
  stream?: boolean
  context?: {
    userId?: string
    includeNotes?: boolean
    includeTodos?: boolean
    limit?: number
  }
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ============================================
// 上下文检索
// ============================================

async function retrieveContext(
  supabase: any,
  userId: string,
  options: { includeNotes?: boolean; includeTodos?: boolean; limit?: number } = {}
): Promise<string> {
  const { includeNotes = true, includeTodos = true, limit = 5 } = options
  const contextParts: string[] = []

  // 检索最近的便签
  if (includeNotes) {
    const { data: notes } = await supabase
      .from('notes')
      .select('content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (notes && notes.length > 0) {
      contextParts.push('## 最近的便签:\n' + notes.map((n: any, i: number) =>
        `${i + 1}. ${n.content} (${new Date(n.created_at).toLocaleDateString('zh-CN')})`
      ).join('\n'))
    }
  }

  // 检索最近的任务
  if (includeTodos) {
    const { data: todos } = await supabase
      .from('todos')
      .select('title, description, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (todos && todos.length > 0) {
      contextParts.push('## 最近的任务:\n' + todos.map((t: any, i: number) =>
        `${i + 1}. ${t.title} - ${t.status} (${new Date(t.created_at).toLocaleDateString('zh-CN')})`
      ).join('\n'))
    }
  }

  return contextParts.join('\n\n')
}

// ============================================
// OpenAI GPT-4o
// ============================================

async function streamGPT4(messages: AIMessage[], apiKey: string): Promise<ReadableStream> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      stream: true,
      temperature: 0.7,
    }),
  })

  return response.body!
}

// ============================================
// Anthropic Claude 3.5 Sonnet
// ============================================

async function streamClaude(messages: AIMessage[], apiKey: string): Promise<ReadableStream> {
  // 转换消息格式为 Claude 格式
  const claudeMessages = messages.map(m => ({
    role: m.role === 'system' ? 'user' : m.role,
    content: m.content,
  }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      messages: claudeMessages,
      max_tokens: 4096,
      stream: true,
    }),
  })

  return response.body!
}

// ============================================
// Google Gemini 1.5 Pro
// ============================================

async function streamGemini(messages: AIMessage[], apiKey: string): Promise<ReadableStream> {
  const lastMessage = messages[messages.length - 1].content

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:streamGenerateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: lastMessage }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  })

  return response.body!
}

// ============================================
// Stream 转换器
// ============================================

async function* streamTransformer(
  stream: ReadableStream<Uint8Array>,
  model: string
): AsyncGenerator<string, void, unknown> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter((line: string) => line.trim() !== '')

      for (const line of lines) {
        try {
          if (model.startsWith('gpt')) {
            // OpenAI format: data: {"choices": [...]}
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              const content = data.choices?.[0]?.delta?.content
              if (content) yield content
            }
          } else if (model.startsWith('claude')) {
            // Claude format: data: {"delta": {"text": "..."}}
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              const content = data.delta?.text
              if (content) yield content
            }
          } else if (model.startsWith('gemini')) {
            // Gemini format
            const data = JSON.parse(line)
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (content) yield content
          }
        } catch (e) {
          // Skip invalid JSON
          continue
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// ============================================
// Main Handler
// ============================================

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { model, prompt, stream = true, context }: AIRequest = await req.json()

    // 验证请求
    if (!prompt) {
      throw new Error('Prompt is required')
    }

    // 获取 API Key（从环境变量）
    let apiKey: string
    if (model.startsWith('gpt')) {
      apiKey = Deno.env.get('OPENAI_API_KEY')!
    } else if (model.startsWith('claude')) {
      apiKey = Deno.env.get('ANTHROPIC_API_KEY')!
    } else if (model.startsWith('gemini')) {
      apiKey = Deno.env.get('GEMINI_API_KEY')!
    } else {
      throw new Error('Unsupported model')
    }

    if (!apiKey) {
      throw new Error(`API key not found for model: ${model}`)
    }

    // 构建消息
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: '你是 Tao 的智能助手，帮助管理任务、便签和日程。请用简洁、专业的中文回答。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]

    // 注入上下文
    if (context?.userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!
      )

      const contextText = await retrieveContext(supabase, context.userId, context)
      if (contextText) {
        messages[1].content = `${contextText}\n\n## 用户问题:\n${prompt}`
      }
    }

    // 获取 Stream
    let stream: ReadableStream<Uint8Array>
    if (model.startsWith('gpt')) {
      stream = await streamGPT4(messages, apiKey)
    } else if (model.startsWith('claude')) {
      stream = await streamClaude(messages, apiKey)
    } else {
      stream = await streamGemini(messages, apiKey)
    }

    // 创建转换后的 Stream
    const transformedStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamTransformer(stream, model)) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(transformedStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
