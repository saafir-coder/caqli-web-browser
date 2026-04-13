import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { calculateCost, estimateMinCost } from '@/lib/pricing'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FREE_DAILY_LIMIT = 50

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer caqli_')) {
    return Response.json({ error: { message: 'Invalid API key. Get yours at caqli.ai', type: 'auth_error' } }, { status: 401 })
  }

  const apiKey = authHeader.replace('Bearer ', '')

  // Look up user
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = users?.find(u => u.user_metadata?.api_key === apiKey)

  if (!user) {
    return Response.json({ error: { message: 'Invalid API key.', type: 'auth_error' } }, { status: 401 })
  }

  const body = await req.json()
  const model = body.model || 'nvidia/nemotron-nano-9b-v2:free'
  const isFree = model.endsWith(':free')

  if (isFree) {
    // Check daily limit
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const count = usage?.message_count ?? 0
    if (count >= FREE_DAILY_LIMIT) {
      return Response.json({
        error: { message: `Free daily limit reached (${FREE_DAILY_LIMIT}/day). Top up credits at caqli.ai for paid models.`, type: 'rate_limit' }
      }, { status: 429 })
    }
  } else {
    // Check minimum credits before sending request
    const minCost = estimateMinCost(model)
    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!credits || credits.balance < minCost) {
      return Response.json({
        error: { message: `Not enough credits (have ${credits?.balance ?? 0}). Top up at caqli.ai`, type: 'insufficient_credits' }
      }, { status: 402 })
    }
  }

  // Forward to OpenRouter
  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://caqli.ai',
      'X-Title': 'Caqli AI',
    },
    body: JSON.stringify({ ...body, model, stream: body.stream ?? false }),
  })

  if (!openRouterRes.ok) {
    const errText = await openRouterRes.text()
    return Response.json({
      error: { message: 'AI model error. Try again or switch models.', type: 'upstream_error', detail: errText }
    }, { status: 502 })
  }

  // Streaming: pass through, charge estimate upfront (refine later)
  if (body.stream) {
    if (!openRouterRes.body) {
      return Response.json({ error: { message: 'No stream', type: 'upstream_error' } }, { status: 502 })
    }

    if (isFree) {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase.from('daily_usage').select('message_count').eq('user_id', user.id).eq('date', today).single()
      await supabase.from('daily_usage').upsert({
        user_id: user.id, date: today, message_count: (usage?.message_count ?? 0) + 1,
      }, { onConflict: 'user_id,date' })
    } else {
      // For streaming, charge estimate (avg ~2K tokens)
      const estCost = Math.max(1, estimateMinCost(model) * 3)
      const { data: credits } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
      await supabase.from('credits').update({
        balance: (credits?.balance ?? 0) - estCost, updated_at: new Date().toISOString()
      }).eq('user_id', user.id)
    }

    return new Response(openRouterRes.body, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }

  // Non-streaming: charge exact token count
  const data = await openRouterRes.json()
  const inputTokens = data.usage?.prompt_tokens ?? 0
  const outputTokens = data.usage?.completion_tokens ?? 0

  if (isFree) {
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase.from('daily_usage').select('message_count').eq('user_id', user.id).eq('date', today).single()
    await supabase.from('daily_usage').upsert({
      user_id: user.id, date: today, message_count: (usage?.message_count ?? 0) + 1,
    }, { onConflict: 'user_id,date' })
  } else {
    const cost = calculateCost(model, inputTokens, outputTokens)
    const { data: credits } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
    await supabase.from('credits').update({
      balance: (credits?.balance ?? 0) - cost, updated_at: new Date().toISOString()
    }).eq('user_id', user.id)
  }

  return Response.json(data)
}
