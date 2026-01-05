// ============================================
// Miniprogram Sync Edge Function
// 小程序跨端集成网关 - 身份桥接 + 订阅消息
// ============================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// 微信 API 签名生成
// ============================================

function generateSignature(params: Record<string, string>, sessionKey: string): string {
  const sortedParams = Object.keys(params).sort()
  const stringA = sortedParams.map(key => `${key}=${params[key]}`).join('&')
  const stringSignTemp = `${stringA}&key=${sessionKey}`

  // 使用 HMAC-SHA256（这里简化，实际需要 crypto 库）
  return stringSignTemp
}

// ============================================
// code2session - 微信登录
// ============================================

interface WxLoginRequest {
  code: string
}

interface WxLoginResponse {
  openid: string
  session_key: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

async function wxLogin(code: string): Promise<WxLoginResponse> {
  const appId = Deno.env.get('WECHAT_APPID')!
  const appSecret = Deno.env.get('WECHAT_APPSECRET')!

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`

  const response = await fetch(url)
  return await response.json()
}

// ============================================
// 发送订阅消息
// ============================================

interface SubscribeMessage {
  touser: string
  template_id: string
  page?: string
  data: Record<string, { value: string }>
}

async function sendSubscribeMessage(accessToken: string, message: SubscribeMessage): Promise<boolean> {
  const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  })

  const result = await response.json()
  return result.errcode === 0
}

// ============================================
// 获取 access_token
// ============================================

async function getAccessToken(): Promise<string> {
  const appId = Deno.env.get('WECHAT_APPID')!
  const appSecret = Deno.env.get('WECHAT_APPSECRET')!

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`

  const response = await fetch(url)
  const result = await response.json()

  if (result.errcode) {
    throw new Error(`Failed to get access_token: ${result.errmsg}`)
  }

  return result.access_token
}

// ============================================
// JWT 验证
// ============================================

async function verifyUser(authorization: string, supabase: any): Promise<string | null> {
  try {
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return user.id
  } catch {
    return null
  }
}

// ============================================
// Main Handler
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )

  const url = new URL(req.url)
  const action = url.pathname.split('/').pop()

  try {
    // 验证用户身份
    const authHeader = req.headers.get('authorization')!
    const userId = await verifyUser(authHeader, supabase)

    if (!userId && action !== 'login') {
      throw new Error('Unauthorized')
    }

    // ============================================
    // Action: login - 小程序登录
    // ============================================
    if (action === 'login' && req.method === 'POST') {
      const { code }: WxLoginRequest = await req.json()

      const wxResult = await wxLogin(code)

      if (wxResult.errcode) {
        throw new Error(`WeChat login failed: ${wxResult.errmsg}`)
      }

      // 查找或创建用户
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('wechat_openid', wxResult.openid)
        .single()

      if (!profile) {
        // 创建新用户
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            wechat_openid: wxResult.openid,
            wechat_unionid: wxResult.unionid,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        return new Response(JSON.stringify({ profile: newProfile }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ profile }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ============================================
    // Action: send-message - 发送订阅消息
    // ============================================
    if (action === 'send-message' && req.method === 'POST') {
      const { template_id, page, data } = await req.json()

      // 获取用户的 openid
      const { data: profile } = await supabase
        .from('profiles')
        .select('wechat_openid')
        .eq('id', userId)
        .single()

      if (!profile?.wechat_openid) {
        throw new Error('User not linked to WeChat')
      }

      const accessToken = await getAccessToken()

      const success = await sendSubscribeMessage(accessToken, {
        touser: profile.wechat_openid,
        template_id,
        page,
        data,
      })

      return new Response(JSON.stringify({ success }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ============================================
    // Action: get-qrcode - 生成小程序码
    // ============================================
    if (action === 'get-qrcode' && req.method === 'GET') {
      const accessToken = await getAccessToken()
      const scene = url.searchParams.get('scene') || userId
      const page = url.searchParams.get('page') || 'pages/index'

      const qrcodeUrl = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`

      const response = await fetch(qrcodeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          page,
          width: 430,
          auto_color: false,
        }),
      })

      const buffer = await response.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

      return new Response(JSON.stringify({ qrcode: `data:image/png;base64,${base64}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
