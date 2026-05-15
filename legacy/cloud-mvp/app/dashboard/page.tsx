'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Credits {
  paidCredits: number
  freeUsedToday: number
  freeDailyLimit: number
}

function generateConfig(apiKey: string, apiBase: string) {
  return `name: Caqli AI
version: 1.0.0
schema: v1
allowAnonymousTelemetry: false
tools:
  - name: read_url
    requireConfirmation: false
  - name: fetch
    requireConfirmation: false
  - name: search_web
    requireConfirmation: false
models:
  - name: Llama 3.3 70B (Free)
    provider: openai
    model: meta-llama/llama-3.3-70b-instruct:free
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: GLM-4.5 Air — Agent (Free)
    provider: openai
    model: z-ai/glm-4.5-air:free
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: NVIDIA Nemotron 120B — Plan (Free)
    provider: openai
    model: nvidia/nemotron-3-super-120b-a12b:free
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: Google Gemma 4 31B (Free)
    provider: openai
    model: google/gemma-4-31b-it:free
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: NVIDIA Nemotron 9B (Free)
    provider: openai
    model: nvidia/nemotron-nano-9b-v2:free
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: MiniMax M2.5 (Free)
    provider: openai
    model: minimax/minimax-m2.5:free
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: OpenAI GPT-OSS 120B (Free)
    provider: openai
    model: openai/gpt-oss-120b:free
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: GLM-5 — Best Coding (Paid)
    provider: openai
    model: z-ai/glm-5
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: Claude Sonnet (Paid)
    provider: openai
    model: anthropic/claude-sonnet-4-6
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: GPT-4o (Paid)
    provider: openai
    model: openai/gpt-4o
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}

  - name: Gemini 2.0 Flash (Paid)
    provider: openai
    model: google/gemini-2.0-flash
    apiBase: ${apiBase}/api/v1
    apiKey: ${apiKey}
`
}

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [credits, setCredits] = useState<Credits | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedConfig, setCopiedConfig] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [keysRes, creditsRes] = await Promise.all([
        fetch('/api/keys'),
        fetch('/api/credits'),
      ])

      if (keysRes.ok) {
        const data = await keysRes.json()
        setApiKey(data.key)
      }
      if (creditsRes.ok) {
        setCredits(await creditsRes.json())
      }
      setLoading(false)
    }
    load()
  }, [router, supabase])

  function getInstallCommand() {
    if (!apiKey) return ''
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://caqli.ai'
    return `cat > ~/.continue/config.yaml << 'CAQLI_EOF'\n${generateConfig(apiKey, base)}CAQLI_EOF`
  }

  function copyInstallCommand() {
    navigator.clipboard.writeText(getInstallCommand())
    setCopiedConfig(true)
    setTimeout(() => setCopiedConfig(false), 2000)
  }

  function copyKey() {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-violet-400 font-bold text-lg">Caqli AI</span>
        <div className="flex items-center gap-4">
          <a href="/editor" className="text-sm text-zinc-400 hover:text-white transition-colors">Web Editor</a>
          <button onClick={handleSignOut} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400 text-sm mb-8">Your AI coding assistant with multiple models</p>

        {/* Credits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Free Models (daily)</p>
            <p className="text-2xl font-bold text-white">
              {credits ? `${credits.freeDailyLimit - credits.freeUsedToday}` : '--'}
              <span className="text-zinc-500 text-sm font-normal"> / {credits?.freeDailyLimit ?? 50}</span>
            </p>
            <p className="text-zinc-600 text-xs mt-1">Nemotron, Gemma, etc. Resets daily.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Paid Credits</p>
            <p className="text-2xl font-bold text-violet-400">{credits?.paidCredits ?? 0}</p>
            <p className="text-zinc-600 text-xs mt-1">For Claude, GPT-4o. Charged by tokens used.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Status</p>
            <p className="text-2xl font-bold text-green-400">Active</p>
            <p className="text-zinc-600 text-xs mt-1">All systems operational</p>
          </div>
        </div>

        {/* Upgrade toggle */}
        <div className="mb-10">
          <button
            onClick={() => setShowUpgrade(!showUpgrade)}
            className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl px-6 py-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-violet-400 text-lg">✦</span>
              <div className="text-left">
                <p className="text-white font-semibold">Upgrade — Buy Credits</p>
                <p className="text-zinc-500 text-xs">Access Claude, GPT-4o, Gemini 2.0 and more</p>
              </div>
            </div>
            <span className="text-zinc-400 text-sm">{showUpgrade ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showUpgrade && (
            <div className="mt-4 space-y-4">
              {/* Packages */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-zinc-400 text-sm mb-5">
                  Contact me on Telegram, tell me your email, and I&apos;ll add credits to your account.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: '$5', credits: '500 credits', note: '~200 messages', highlight: false },
                    { label: '$10', credits: '1,000 credits', note: 'Most popular', highlight: true },
                    { label: '$15', credits: '1,500 credits', note: 'Best value', highlight: false },
                  ].map((pkg) => (
                    <a
                      key={pkg.label}
                      href={`https://t.me/abdillahiAI?text=Hi%2C%20I%20want%20to%20buy%20${encodeURIComponent(pkg.label)}%20credits%20for%20Caqli%20AI`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center p-5 rounded-xl border transition-colors ${
                        pkg.highlight
                          ? 'bg-violet-900/30 border-violet-600 hover:bg-violet-900/50'
                          : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                      }`}
                    >
                      <span className={`text-3xl font-bold mb-1 ${pkg.highlight ? 'text-violet-300' : 'text-white'}`}>{pkg.label}</span>
                      <span className="text-white text-sm font-medium">{pkg.credits}</span>
                      <span className="text-zinc-500 text-xs mt-1">{pkg.note}</span>
                      <span className={`mt-4 text-xs px-3 py-1.5 rounded-lg font-medium ${
                        pkg.highlight ? 'bg-violet-600 text-white' : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        Contact on Telegram →
                      </span>
                    </a>
                  ))}
                </div>
                <p className="text-zinc-600 text-xs mt-4 text-center">
                  Share your registered email after paying — credits added within a few hours.
                </p>
              </div>

              {/* Models */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Paid Models</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-zinc-400 text-left border-b border-zinc-800">
                        <th className="pb-2">Model</th>
                        <th className="pb-2">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-300">
                      {[
                        { name: 'Claude Sonnet', desc: 'Best for coding' },
                        { name: 'GPT-4o', desc: 'Best from OpenAI' },
                        { name: 'Gemini 2.0 Flash', desc: 'Fast + smart' },
                      ].map((m) => (
                        <tr key={m.name} className="border-b border-zinc-800/50 last:border-0">
                          <td className="py-2.5 text-violet-300">{m.name}</td>
                          <td className="py-2.5 text-zinc-500">{m.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ONE-CLICK SETUP */}
        <div className="bg-gradient-to-br from-violet-900/30 to-zinc-900 border border-violet-800/50 rounded-xl p-6 mb-10">
          <h2 className="text-lg font-semibold text-white mb-2">Setup in 3 Steps</h2>
          <p className="text-zinc-400 text-sm mb-6">Get AI coding in VS Code with all models — takes 2 minutes</p>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <span className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <p className="text-white font-medium">Download VS Code</p>
                <p className="text-zinc-400 text-sm mt-1">If you already have it, skip this step</p>
                <a
                  href="https://code.visualstudio.com/download"
                  target="_blank"
                  rel="noopener"
                  className="inline-block mt-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Download VS Code
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <span className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <div>
                <p className="text-white font-medium">Install Continue Extension</p>
                <p className="text-zinc-400 text-sm mt-1">Click the link below — it opens VS Code and installs automatically</p>
                <a
                  href="vscode:extension/Continue.continue"
                  className="inline-block mt-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Install Continue in VS Code
                </a>
              </div>
            </div>

            {/* Step 3 — THE KEY STEP */}
            <div className="flex gap-4">
              <span className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <div className="flex-1">
                <p className="text-white font-medium">Connect Caqli AI</p>

                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-500 text-sm mt-0.5">a.</span>
                    <p className="text-zinc-300 text-sm">In VS Code, click <span className="text-white font-medium">Terminal</span> at the top menu, then click <span className="text-white font-medium">New Terminal</span></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-500 text-sm mt-0.5">b.</span>
                    <p className="text-zinc-300 text-sm">Click the button below to copy the setup command, then paste it in the terminal and press Enter</p>
                  </div>
                </div>

                <button
                  onClick={copyInstallCommand}
                  className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white text-sm px-6 py-3.5 rounded-lg transition-colors font-medium"
                >
                  {copiedConfig ? 'Copied! Now paste in VS Code terminal (Cmd+V → Enter)' : 'Copy Setup Command'}
                </button>

                <p className="text-zinc-500 text-xs mt-2">This sets up all {`10`} models + your API key in one go.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-zinc-900/80 rounded-lg border border-zinc-800">
            <p className="text-white text-sm font-medium mb-1">After setup:</p>
            <p className="text-zinc-400 text-sm">
              Press <kbd className="bg-zinc-700 px-1.5 py-0.5 rounded text-xs text-white">Cmd+L</kbd> (Mac) or <kbd className="bg-zinc-700 px-1.5 py-0.5 rounded text-xs text-white">Ctrl+L</kbd> (Windows) to open AI chat. Pick any model from the dropdown and start coding.
            </p>
          </div>
        </div>

        {/* API Key (for advanced users) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Caqli Desktop App</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Run the desktop preview locally to work on your real local files without VS Code.
              </p>
            </div>
            <a
              href="/desktop"
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Open Desktop Setup
            </a>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your API Key</h2>
            <span className="text-xs text-zinc-500">For advanced users</span>
          </div>

          {apiKey ? (
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-violet-300 font-mono overflow-x-auto">
                {apiKey}
              </code>
              <button
                onClick={copyKey}
                className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                {copiedKey ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Generating your API key...</p>
          )}
        </div>

      </div>
    </div>
  )
}
