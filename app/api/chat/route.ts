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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, code, tier } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    code: string
    tier: 'free' | 'paid'
  }

  // Inject code context into last user message if code exists
  const messagesWithCode = code
    ? messages.map((m, i) =>
        i === messages.length - 1 && m.role === 'user'
          ? { ...m, content: `Here is my current code:\n\`\`\`\n${code}\n\`\`\`\n\n${m.content}` }
          : m
      )
    : messages

  if (tier === 'free') {
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
      return new Response(
        JSON.stringify({ error: 'daily_limit_reached', limit: FREE_DAILY_LIMIT }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Increment usage
    await supabase.from('daily_usage').upsert({
      user_id: user.id,
      date: today,
      message_count: count + 1,
    }, { onConflict: 'user_id,date' })

    // Save message to DB
    const lastMessage = messages[messages.length - 1]
    await supabase.from('messages').insert({
      user_id: user.id,
      role: lastMessage.role,
      content: lastMessage.content,
      model_used: 'llama-3.1-8b-instruct',
      tier: 'free',
    })

    // Stream response
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

          // Save assistant response
          await supabase.from('messages').insert({
            user_id: user.id,
            role: 'assistant',
            content: fullResponse,
            model_used: 'llama-3.1-8b-instruct',
            tier: 'free',
          })

          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  if (tier === 'paid') {
    // Check credits
    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!credits || credits.balance <= 0) {
      return new Response(
        JSON.stringify({ error: 'no_credits' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Deduct 1 credit
    await supabase
      .from('credits')
      .update({ balance: credits.balance - 1, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await streamPaidCompletion(messagesWithCode, SYSTEM_PROMPT)
          let fullResponse = ''

          for await (const text of completion.textStream) {
            if (text) {
              fullResponse += text
              controller.enqueue(encoder.encode(text))
            }
          }

          await supabase.from('messages').insert({
            user_id: user.id,
            role: 'assistant',
            content: fullResponse,
            model_used: 'claude-sonnet-4-6',
            tier: 'paid',
          })

          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response('Invalid tier', { status: 400 })
}
