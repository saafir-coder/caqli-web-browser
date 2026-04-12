'use client'
import { useState, useRef, useEffect } from 'react'
import { CreditBadge } from './CreditBadge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  code: string
  tier: 'free' | 'paid'
  onTierChange: (t: 'free' | 'paid') => void
}

export function ChatPanel({ code, tier, onTierChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, code, tier }),
      })

      if (res.status === 429) {
        setLimitReached(true)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ You have reached your 20 free messages for today. Upgrade to paid for unlimited access.',
        }])
        setLoading(false)
        return
      }

      if (res.status === 402) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ No credits remaining. Contact us on WhatsApp to top up: your_whatsapp_number',
        }])
        setLoading(false)
        return
      }

      // Stream the response
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        assistantContent += chunk
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantContent },
        ])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Could not connect. Please try again.',
      }])
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
          <span className="text-sm font-medium text-zinc-200">Caqli AI</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditBadge tier={tier} />
          <button
            onClick={() => onTierChange(tier === 'free' ? 'paid' : 'free')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              tier === 'paid'
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {tier === 'paid' ? 'Claude (Paid)' : 'Free Model'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-zinc-500 text-sm text-center mt-8">
            <p className="mb-2">Caqli AI diyaar buu u yahay.</p>
            <p>Ask anything about your code.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-200'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask about your code... (Enter to send)"
            rows={2}
            disabled={limitReached}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || limitReached}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-4 rounded-lg transition-colors text-sm font-medium"
          >
            Send
          </button>
        </div>
        <p className="text-zinc-600 text-xs mt-2">
          Shift+Enter for new line • AI sees your code automatically
        </p>
      </div>
    </div>
  )
}
