import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { calculateCost, estimateMinCost } from '@/lib/pricing'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MODEL_MAP: Record<string, string> = {
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-4-6',
  'claude-opus-4-6': 'anthropic/claude-opus-4-6',
  'claude-haiku-4-5': 'anthropic/claude-haiku-4-5',
  'claude-3-5-sonnet-latest': 'anthropic/claude-sonnet-4-6',
  'claude-3-5-haiku-latest': 'anthropic/claude-haiku-4-5',
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')

  if (!apiKey?.startsWith('caqli_')) {
    return Response.json({
      type: 'error', error: { type: 'authentication_error', message: 'Invalid API key. Get yours at caqli.ai' }
    }, { status: 401 })
  }

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = users?.find(u => u.user_metadata?.api_key === apiKey)

  if (!user) {
    return Response.json({
      type: 'error', error: { type: 'authentication_error', message: 'Invalid API key.' }
    }, { status: 401 })
  }

  const body = await req.json()
  const requestedModel = body.model || 'claude-sonnet-4-6'
  const openRouterModel = MODEL_MAP[requestedModel] || `anthropic/${requestedModel}`

  // Pre-check credits
  const minCost = estimateMinCost(openRouterModel)
  const { data: credits } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()

  if (!credits || credits.balance < minCost) {
    return Response.json({
      type: 'error',
      error: { type: 'invalid_request_error', message: `Not enough credits (have ${credits?.balance ?? 0}). Top up at caqli.ai` }
    }, { status: 402 })
  }

  // Convert Anthropic → OpenAI format
  const openAiMessages = []
  if (body.system) {
    const systemText = typeof body.system === 'string' ? body.system : body.system.map((s: { text: string }) => s.text).join('\n')
    openAiMessages.push({ role: 'system', content: systemText })
  }
  for (const msg of body.messages || []) {
    if (typeof msg.content === 'string') {
      openAiMessages.push({ role: msg.role, content: msg.content })
    } else if (Array.isArray(msg.content)) {
      const text = msg.content.filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('\n')
      openAiMessages.push({ role: msg.role, content: text })
    }
  }

  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://caqli.ai',
      'X-Title': 'Caqli AI',
    },
    body: JSON.stringify({
      model: openRouterModel,
      messages: openAiMessages,
      max_tokens: body.max_tokens || 4096,
      stream: body.stream ?? false,
    }),
  })

  if (!openRouterRes.ok) {
    return Response.json({
      type: 'error', error: { type: 'api_error', message: 'AI model error. Try again.' }
    }, { status: 502 })
  }

  if (body.stream) {
    // Charge estimate for streaming
    const estCost = Math.max(1, estimateMinCost(openRouterModel) * 3)
    await supabase.from('credits').update({
      balance: (credits.balance) - estCost, updated_at: new Date().toISOString()
    }).eq('user_id', user.id)

    return new Response(openRouterRes.body, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }

  // Non-streaming: charge exact tokens
  const data = await openRouterRes.json()
  const inputTokens = data.usage?.prompt_tokens ?? 0
  const outputTokens = data.usage?.completion_tokens ?? 0
  const cost = calculateCost(openRouterModel, inputTokens, outputTokens)

  await supabase.from('credits').update({
    balance: credits.balance - cost, updated_at: new Date().toISOString()
  }).eq('user_id', user.id)

  // Return Anthropic format
  return Response.json({
    id: `msg_${crypto.randomUUID()}`,
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: data.choices?.[0]?.message?.content || '' }],
    model: requestedModel,
    stop_reason: data.choices?.[0]?.finish_reason === 'stop' ? 'end_turn' : data.choices?.[0]?.finish_reason,
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
  })
}
