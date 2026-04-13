import { createClient } from '@/lib/supabase-server'
import { streamFreeCompletion } from '@/lib/openrouter'
import { streamPaidCompletion } from '@/lib/anthropic'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `You are Caqli AI, an expert coding assistant built for Somali developers.
You help users write, debug, and understand code. Be concise, practical, and clear.
When you see code in the message, analyze it carefully before responding.
Always provide working code examples.`

const FREE_DAILY_LIMIT = 20

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const messages = body.messages as { role: 'user' | 'assistant'; content: string }[] | undefined
  const code = (body.code as string) ?? ''
  const tier = body.tier as 'free' | 'paid' | undefined

  if (!messages || messages.length === 0 || !tier || (tier !== 'free' && tier !== 'paid')) {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  const lastMessage = messages[messages.length - 1]

  // Inject code context into last user message if code exists
  const messagesWithCode = code
    ? messages.map((m, i) =>
        i === messages.length - 1 && m.role === 'user'
          ? { ...m, content: `Here is my current code:\n\`\`\`\n${code}\n\`\`\`\n\n${m.content}` }
          : m
      )
    : messages

  if (tier === 'free') {
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const count = usage?.message_count ?? 0
    if (count >= FREE_DAILY_LIMIT) {
      return Response.json({ error: 'daily_limit_reached', limit: FREE_DAILY_LIMIT }, { status: 429 })
    }

    // Save user message
    await supabase.from('messages').insert({
      user_id: user.id,
      role: lastMessage.role,
      content: lastMessage.content,
      model_used: 'llama-3.1-8b-instruct',
      tier: 'free',
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await streamFreeCompletion(messagesWithCode, SYSTEM_PROMPT)
          let fullResponse = ''

          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              fullResponse += text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Increment usage only after successful stream
          await supabase.from('daily_usage').upsert({
            user_id: user.id,
            date: today,
            message_count: count + 1,
          }, { onConflict: 'user_id,date' })

          await supabase.from('messages').insert({
            user_id: user.id,
            role: 'assistant',
            content: fullResponse,
            model_used: 'llama-3.1-8b-instruct',
            tier: 'free',
          })

          controller.close()
        } catch {
          controller.enqueue(encoder.encode('\n\n[Error: AI model failed to respond. Please try again.]'))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // paid tier
  const { data: credits } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  if (!credits || credits.balance <= 0) {
    return Response.json({ error: 'no_credits' }, { status: 402 })
  }

  // Save user message
  await supabase.from('messages').insert({
    user_id: user.id,
    role: lastMessage.role,
    content: lastMessage.content,
    model_used: 'claude-sonnet-4-6',
    tier: 'paid',
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await streamPaidCompletion(messagesWithCode, SYSTEM_PROMPT)
        let fullResponse = ''

        for await (const event of completion) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }
        }

        // Deduct credit only after successful stream
        await supabase
          .from('credits')
          .update({ balance: credits.balance - 1, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)

        await supabase.from('messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: fullResponse,
          model_used: 'claude-sonnet-4-6',
          tier: 'paid',
        })

        controller.close()
      } catch {
        controller.enqueue(encoder.encode('\n\n[Error: AI model failed to respond. Please try again.]'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
