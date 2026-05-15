import { openRouterClient } from './openrouter-pool'

export async function streamFreeCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
) {
  return openRouterClient().chat.completions.create({
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    max_tokens: 2048,
  })
}
