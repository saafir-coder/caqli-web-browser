'use client'
import { useState, useEffect } from 'react'
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
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const dismissed = localStorage.getItem('caqli_beta_banner_dismissed')
    if (dismissed) setBannerDismissed(true)
  }, [])

  function dismissBanner() {
    localStorage.setItem('caqli_beta_banner_dismissed', '1')
    setBannerDismissed(true)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Beta banner */}
      {!bannerDismissed && (
        <div className="flex items-center justify-between px-4 py-2 bg-amber-900/40 border-b border-amber-700/50 flex-shrink-0">
          <p className="text-amber-300 text-xs">
            <span className="font-semibold">Beta —</span> Caqli AI waa demo. Waxaa jiri kara khaladaad. Mahadsanid inaad ku diiwaangelantay — waxaad naga caawineysaa si aan ugu hagaajino.
            {' '}<span className="text-amber-400/70">(This is a demo — bugs may occur. Thank you for being an early user.)</span>
          </p>
          <button onClick={dismissBanner} className="text-amber-400 hover:text-amber-200 text-xs ml-4 flex-shrink-0">
            Dismiss
          </button>
        </div>
      )}
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
