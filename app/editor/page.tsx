'use client'
import { useState } from 'react'
import { Editor, LanguageSelector } from '@/components/Editor'
import { ChatPanel } from '@/components/ChatPanel'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STARTER_CODE = `// Welcome to Caqli AI
// Write your code here — the AI can see it and help you

function greet(name) {
  return \`Hello, \${name}! From Caqli AI.\`
}

console.log(greet("Somali Developer"))
`

export default function EditorPage() {
  const [code, setCode] = useState(STARTER_CODE)
  const [language, setLanguage] = useState('javascript')
  const [tier, setTier] = useState<'free' | 'paid'>('free')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-violet-400 font-bold text-sm">Caqli AI</span>
          <LanguageSelector language={language} onChange={setLanguage} />
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor — 60% */}
        <div className="flex-1 overflow-hidden">
          <Editor value={code} onChange={setCode} language={language} />
        </div>

        {/* Chat panel — 40% */}
        <div className="w-[400px] flex-shrink-0">
          <ChatPanel code={code} tier={tier} onTierChange={setTier} />
        </div>
      </div>
    </div>
  )
}
