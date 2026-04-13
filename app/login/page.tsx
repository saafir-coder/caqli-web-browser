'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); setLoading(false); return }

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(error.message); setLoading(false); return }
        window.location.href = '/dashboard'
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(error.message); setLoading(false); return }
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Caqli AI</h1>
          <p className="text-zinc-400">AI Coding Tool — Somali Developers</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <div className="flex gap-2 mb-6">
            {(['signup', 'login'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m === 'signup' ? 'Sign Up' : 'Log In'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              required
              minLength={6}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : mode === 'signup' ? 'Create Account — Free' : 'Log In'}
            </button>
          </form>

          <p className="text-zinc-500 text-xs text-center mt-4">
            {mode === 'signup' ? 'Free tier: 50 AI messages per day' : 'Welcome back'}
          </p>
        </div>
      </div>
    </div>
  )
}
