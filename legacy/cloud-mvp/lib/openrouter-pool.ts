// OpenRouter key pool — rotate across multiple accounts to spread rate limits.
// Add keys as OPENROUTER_API_KEY_1, OPENROUTER_API_KEY_2, ... in Vercel env vars.
// Falls back to OPENROUTER_API_KEY if no numbered keys are set.

const OPENROUTER_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
  process.env.OPENROUTER_API_KEY_4,
  process.env.OPENROUTER_API_KEY_5,
].filter((k): k is string => Boolean(k))

// Fall back to single key if no pool configured
if (OPENROUTER_KEYS.length === 0 && process.env.OPENROUTER_API_KEY) {
  OPENROUTER_KEYS.push(process.env.OPENROUTER_API_KEY)
}

function pickKey(): string {
  if (OPENROUTER_KEYS.length === 0) throw new Error('No OpenRouter API key configured')
  return OPENROUTER_KEYS[Math.floor(Math.random() * OPENROUTER_KEYS.length)]
}

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const HEADERS = {
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://caqli.ai',
  'X-Title': 'Caqli AI',
}

// Used by the v1 proxy (Continue IDE) — returns a raw Response
export async function openRouterFetch(body: Record<string, unknown>): Promise<Response> {
  const key = pickKey()
  return fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: { ...HEADERS, Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  })
}

// Used by the web editor (streaming via OpenAI SDK)
import OpenAI from 'openai'

export function openRouterClient(): OpenAI {
  return new OpenAI({
    baseURL: OPENROUTER_BASE,
    apiKey: pickKey(),
    defaultHeaders: {
      'HTTP-Referer': 'https://caqli.ai',
      'X-Title': 'Caqli AI',
    },
  })
}
