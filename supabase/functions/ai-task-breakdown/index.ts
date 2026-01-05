// ============================================
// AI Task Breakdown Edge Function
// AI 自动拆解任务并推送小程序
// ============================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// 任务拆解 Prompt 模板
// ============================================

const BREAKDOWN_PROMPT = `你是一个智能任务助手。请将用户的自然语言需求拆解为具体的任务列表。

**输出格式要求：**
请严格按照以下 JSON 格式输出，不要包含其他文字：

\`\`\`json
{
  "tasks": [
    {
      "title": "任务标题（简短明确）",
      "description": "详细描述",
      "due_date": "2024-01-15",
      "priority": "high|medium|low",
      "category": "分类名称"
    }
  ],
  "summary": "总结这段需求的核心内容"
}
\`\`\`

**示例：**
输入: "下周二要去上海出差，帮我安排一下"

输出:
\`\`\`json
{
  "tasks": [
    {
      "title": "预订上海往返交通",
      "description": "查看并预订机票或高铁票",
      "due_date": "下周日",
      "priority": "high",
      "category": "出差"
    },
    {
      "title": "预订上海酒店",
      "description": "根据出差地点预订合适的酒店",
      "due_date": "下周日",
      "priority": "high",
      "category": "出差"
    },
    {
      "title": "准备出差材料",
      "description": "整理会议资料、名片等必需品",
      "due_date": "下周一",
      "priority": "medium",
      "category": "出差"
    }
  ],
  "summary": "已为你的上海出差安排了3项任务，包括交通、住宿和材料准备"
}
\`\`\`

现在请处理以下用户需求：`

// ============================================
// 解析 AI 响应
// ============================================

interface BreakdownResponse {
  tasks: Array<{
    title: string
    description: string
    due_date: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
  summary: string
}

function parseAIResponse(response: string): BreakdownResponse | null {
  try {
    // 提取 JSON 部分
    const jsonMatch = response.match(/```json\\s*([\\s\\S]*?)\\s*```/) ||
                     response.match(/\\{[\\s\\S]*\\}/)

    if (!jsonMatch) return null

    const jsonStr = jsonMatch[1] || jsonMatch[0]
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

// ============================================
// 计算日期
// ============================================

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null

  const now = new Date()
  const relativePatterns: Record<string, number> = {
    '明天': 1,
    '后天': 2,
    '下周': 7,
    '下周日': 7,
    '下周一': 7,
    '下周二': 8,
    '下周三': 9,
    '下周四': 10,
    '下周五': 11,
    '下周六': 12,
    '下周日': 13,
  }

  for (const [pattern, days] of Object.entries(relativePatterns)) {
    if (dateStr.includes(pattern)) {
      const result = new Date(now)
      result.setDate(result.getDate() + days)
      return result.toISOString().split('T')[0]
    }
  }

  // 尝试解析为标准日期格式
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return null
}

// ============================================
// 创建任务
// ============================================

async function createTasks(
  supabase: any,
  userId: string,
  tasks: BreakdownResponse['tasks']
): Promise<{ created: number; failed: number }> {
  let created = 0
  let failed = 0

  for (const task of tasks) {
    try {
      const dueDate = parseDate(task.due_date)

      const { error } = await supabase.from('todos').insert({
        user_id: userId,
        title: task.title,
        description: task.description,
        due_date: dueDate,
        priority: task.priority,
        category: task.category,
        status: 'pending',
      })

      if (error) {
        console.error('Failed to create task:', error)
        failed++
      } else {
        created++
      }
    } catch (e) {
      console.error('Task creation error:', e)
      failed++
    }
  }

  return { created, failed }
}

// ============================================
// 调用 AI Bridge
// ============================================

async function callAIBridge(userInput: string): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')!

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
          content: BREAKDOWN_PROMPT,
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}

// ============================================
// 设置闹钟提醒（调用 mp-sync）
// ============================================

async function scheduleMPReminder(supabase: any, userId: string, task: any) {
  try {
    // 这里会在任务到期前1小时触发
    // 实际实现需要结合 cron job 或延迟队列
    console.log(`Scheduled reminder for task: ${task.title}`)
  } catch (e) {
    console.error('Failed to schedule reminder:', e)
  }
}

// ============================================
// Main Handler
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input } = await req.json()

    if (!input) {
      throw new Error('Input is required')
    }

    // 获取用户信息
    const authHeader = req.headers.get('authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // 调用 AI 拆解
    const aiResponse = await callAIBridge(input)
    const breakdown = parseAIResponse(aiResponse)

    if (!breakdown) {
      throw new Error('Failed to parse AI response')
    }

    // 创建任务
    const result = await createTasks(supabase, user.id, breakdown.tasks)

    // 调度小程序提醒（为每个任务）
    for (const task of breakdown.tasks) {
      await scheduleMPReminder(supabase, user.id, task)
    }

    return new Response(JSON.stringify({
      success: true,
      summary: breakdown.summary,
      tasksCreated: result.created,
      tasksFailed: result.failed,
      tasks: breakdown.tasks,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
