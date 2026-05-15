import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function streamPaidCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
) {
  return client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  })
}
