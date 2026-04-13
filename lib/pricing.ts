// Token pricing: credits per 1,000 tokens
// 1 credit ≈ $0.01
// $5 = 500 credits, $10 = 1000 credits
// Markup: ~2.5x over OpenRouter cost = ~60% profit margin

export const TOKEN_RATES: Record<string, { input: number; output: number }> = {
  // Per 1K tokens cost in credits (2.5x markup)
  'anthropic/claude-sonnet-4-6': { input: 0.75, output: 3.75 },
  'anthropic/claude-opus-4-6': { input: 3.75, output: 18.75 },
  'anthropic/claude-haiku-4-5': { input: 0.2, output: 1 },
  'openai/gpt-4o': { input: 0.625, output: 2.5 },
  'openai/gpt-4o-mini': { input: 0.04, output: 0.15 },
  'google/gemini-2.0-flash': { input: 0.025, output: 0.1 },
}

// Calculate credit cost from actual token usage
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Free models cost nothing
  if (model.endsWith(':free')) return 0

  const rate = TOKEN_RATES[model]
  if (!rate) {
    // Unknown model — charge a safe default (1 credit per 1K tokens)
    return Math.ceil((inputTokens + outputTokens) / 1000)
  }

  const inputCost = (inputTokens / 1000) * rate.input
  const outputCost = (outputTokens / 1000) * rate.output
  const total = inputCost + outputCost

  // Minimum 1 credit for paid models
  return Math.max(1, Math.ceil(total))
}

// Estimate cost before request (for pre-check)
export function estimateMinCost(model: string): number {
  if (model.endsWith(':free')) return 0
  const rate = TOKEN_RATES[model]
  if (!rate) return 1
  // Minimum cost = ~500 tokens input + 100 tokens output
  return Math.max(1, Math.ceil((500 / 1000) * rate.input + (100 / 1000) * rate.output))
}

// Pricing table for display
export const PRICING_TABLE = [
  { model: 'Free Models (Nemotron, Gemma, etc.)', inputPer1k: 'Free', outputPer1k: 'Free', tier: 'Free (50/day)' },
  { model: 'Claude Haiku', inputPer1k: '0.2', outputPer1k: '1', tier: 'Paid' },
  { model: 'Gemini 2.0 Flash', inputPer1k: '0.025', outputPer1k: '0.1', tier: 'Paid' },
  { model: 'GPT-4o Mini', inputPer1k: '0.04', outputPer1k: '0.15', tier: 'Paid' },
  { model: 'GPT-4o', inputPer1k: '0.625', outputPer1k: '2.5', tier: 'Paid' },
  { model: 'Claude Sonnet', inputPer1k: '0.75', outputPer1k: '3.75', tier: 'Paid' },
  { model: 'Claude Opus', inputPer1k: '3.75', outputPer1k: '18.75', tier: 'Paid' },
]
