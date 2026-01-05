/**
 * [INPUT]: 依赖 Deno 的 serve API, 依赖 OpenAI REST API, 依赖 Supabase client
 * [OUTPUT]: 提供 OCR 识别服务 (GPT-4o Vision), 返回提取的文字与任务建议
 * [POS]: Edge Functions 层的 AI OCR 网关,被 OCRPanel 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// CORS 配置
// ============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

// ============================================
// 类型定义
// ============================================

interface OCRRequest {
  imageData: string // Base64 encoded image
  extractTasks?: boolean // 是否提取任务
}

interface TaskSuggestion {
  title: string
  description?: string
  due_date?: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

interface OCRResponse {
  text: string
  tasks?: TaskSuggestion[]
}

// ============================================
// OpenAI Vision API
// ============================================

async function performOCR(imageBase64: string): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  // 移除 Base64 前缀
  const base64Data = imageBase64.split(',')[1] || imageBase64

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请识别图片中的所有文字，包括中英文。直接输出识别的文字内容，不要添加任何解释或说明。保持原有的段落和换行格式。',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// ============================================
// AI 任务提取
// ============================================

async function extractTasksFromText(
  text: string
): Promise<TaskSuggestion[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `你是一个任务提取助手。请从提供的文本中识别潜在的待办任务，并按照以下 JSON 格式输出：

{
  "tasks": [
    {
      "title": "任务标题（简洁明确）",
      "description": "详细描述（可选）",
      "due_date": "YYYY-MM-DD 格式（如果文本中提到时间），否则 null",
      "priority": "high|medium|low（根据紧急程度判断）",
      "category": "工作|学习|生活|其他（根据内容分类）"
    }
  ]
}

如果文本中没有明显的任务信息，返回空数组。只返回 JSON，不要添加其他说明。`,
        },
        {
          role: 'user',
          content: `请从以下文本中提取待办任务：\n\n${text}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const parsed = JSON.parse(data.choices[0].message.content)
  return parsed.tasks || []
}

// ============================================
// 主处理函数
// ============================================

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData, extractTasks = true }: OCRRequest = await req.json()

    if (!imageData) {
      throw new Error('Missing required field: imageData')
    }

    // 执行 OCR
    console.log('Starting OCR...')
    const text = await performOCR(imageData)
    console.log('OCR completed, text length:', text.length)

    // 提取任务（如果需要）
    let tasks: TaskSuggestion[] | undefined
    if (extractTasks) {
      try {
        console.log('Extracting tasks...')
        tasks = await extractTasksFromText(text)
        console.log('Tasks extracted:', tasks.length)
      } catch (error) {
        console.error('Task extraction failed:', error)
        // 不影响主流程，任务提取失败不影响 OCR 结果
      }
    }

    const response: OCRResponse = {
      text,
      tasks,
    }

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('OCR processing failed:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'OCR processing failed',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
