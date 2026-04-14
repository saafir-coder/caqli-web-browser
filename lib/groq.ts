import OpenAI from 'openai'
import { openRouterFetch } from './openrouter-pool'

// ─── Groq fallback keys (add more at console.groq.com — free, no card) ───────
const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter((k): k is string => Boolean(k))

const GROQ_MODEL = 'llama-3.1-8b-instant'

// Shuffle array in-place (Fisher-Yates) — distributes Groq load randomly
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Cascade: Open Router pool first → Groq fallbacks ────────────────────────
//
// Flow:
//   1. Try Open Router (random key from pool)
//   2. If rate limited (429) → try Groq keys in random order
//   3. If all Groq keys rate limited → throw with friendly message
//
// ─────────────────────────────────────────────────────────────────────────────

import { openRouterClient as getOpenRouterClient } from './openrouter-pool'

export async function streamFreeCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
) {
  const fullMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages]

  // 1. Try Open Router first (random key from pool)
  try {
    return await getOpenRouterClient().chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: fullMessages,
      stream: true,
      max_tokens: 2048,
    })
  } catch (error: any) {
    if (error?.status !== 429) throw error
    // Rate limited — fall through to Groq
  }

  // 2. Try Groq keys in random order
  for (const key of shuffled(GROQ_KEYS)) {
    try {
      const client = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: key,
      })
      return await client.chat.completions.create({
        model: GROQ_MODEL,
        messages: fullMessages,
        stream: true,
        max_tokens: 2048,
      })
    } catch (error: any) {
      if (error?.status !== 429) throw error
      // This Groq key is rate limited — try next one
    }
  }

  // 3. All providers busy
  throw new Error('Free models are busy right now. Please try again in a moment.')
}

// ─── Same cascade for the v1 proxy endpoint (Continue IDE) ───────────────────

export async function fetchFreeCompletion(body: Record<string, unknown>): Promise<Response> {
  // Use the model from the request (Continue sends the user's chosen model).
  // Fall back to Llama if none provided.
  const model = (body.model as string) || 'meta-llama/llama-3.1-8b-instruct:free'

  // 1. Try Open Router first (random key from pool)
  const orRes = await openRouterFetch({ ...body, model })

  if (orRes.status !== 429) return orRes

  // 2. Try Groq keys in random order
  for (const key of shuffled(GROQ_KEYS)) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, model: GROQ_MODEL }),
    })

    if (res.status !== 429) return res
    // This Groq key is rate limited — try next one
  }

  // 3. All providers busy
  return new Response(JSON.stringify({
    error: {
      message: 'Free models are busy right now. Please try again in a moment.',
      type: 'rate_limit',
    },
  }), { status: 429, headers: { 'Content-Type': 'application/json' } })
}
