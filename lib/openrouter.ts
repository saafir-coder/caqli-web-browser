import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': 'https://caqli.ai',
    'X-Title': 'Caqli AI',
  },
})

export async function streamFreeCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
) {
  return client.chat.completions.create({
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    max_tokens: 2048,
  })
}
