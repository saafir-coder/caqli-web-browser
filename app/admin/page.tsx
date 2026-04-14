'use client'
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  created_at: string
  api_key: string
  credits_balance: number
  total_purchased: number
  free_used_today: number
  last_active: string | null
  total_messages: number
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [topupEmail, setTopupEmail] = useState('')
  const [topupAmount, setTopupAmount] = useState('')
  const [topupResult, setTopupResult] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetResult, setResetResult] = useState('')

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users', {
      headers: { 'x-admin-key': adminKey },
    })
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setAuthenticated(true)
    } else {
      alert('Invalid admin key')
    }
    setLoading(false)
  }

  async function handleTopup() {
    if (!topupEmail || !topupAmount) return
    setTopupResult('')

    const res = await fetch('/api/admin/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: topupEmail,
        credits: parseInt(topupAmount),
        admin_key: adminKey,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setTopupResult(`Added ${data.added} credits to ${data.email}. New balance: ${data.new_balance}`)
      setTopupEmail('')
      setTopupAmount('')
      loadUsers() // Refresh
    } else {
      setTopupResult(`Error: ${data.error}`)
    }
  }

  async function handleResetPassword() {
    if (!resetEmail || !resetPassword) return
    setResetResult('')

    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, new_password: resetPassword, admin_key: adminKey }),
    })
    const data = await res.json()
    if (res.ok) {
      setResetResult(`Password reset for ${resetEmail}`)
      setResetEmail('')
      setResetPassword('')
    } else {
      setResetResult(`Error: ${data.error}`)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Panel</h1>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <input
              type="password"
              placeholder="Admin key (Supabase service role key)"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 mb-4"
            />
            <button
              onClick={loadUsers}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? 'Loading...' : 'Enter'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalCreditsOut = users.reduce((sum, u) => sum + u.total_purchased, 0)
  const totalFreeToday = users.reduce((sum, u) => sum + u.free_used_today, 0)
  const activeUsers = users.filter(u => u.total_messages > 0).length

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-violet-400 font-bold text-lg">Caqli AI — Admin</span>
        <span className="text-zinc-400 text-sm">{users.length} users</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Credits Sold</p>
            <p className="text-2xl font-bold text-violet-400">{totalCreditsOut}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Free Msgs Today</p>
            <p className="text-2xl font-bold text-green-400">{totalFreeToday}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-blue-400">{activeUsers}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Revenue Est.</p>
            <p className="text-2xl font-bold text-white">${(totalCreditsOut * 0.01).toFixed(2)}</p>
          </div>
        </div>

        {/* Top Up */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Top Up User Credits</h2>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="User email"
              value={topupEmail}
              onChange={e => setTopupEmail(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <input
              type="number"
              placeholder="Credits"
              value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleTopup}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-medium"
            >
              Add Credits
            </button>
          </div>
          {topupResult && (
            <p className={`mt-3 text-sm ${topupResult.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {topupResult}
            </p>
          )}
          <p className="text-zinc-500 text-xs mt-2">
            Pricing: 1 credit = $0.01. So $5 = 500 credits, $10 = 1000 credits.
          </p>
        </div>

        {/* Reset Password */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Reset User Password</h2>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="User email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <input
              type="text"
              placeholder="New password"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
              className="w-48 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleResetPassword}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium"
            >
              Reset
            </button>
          </div>
          {resetResult && (
            <p className={`mt-3 text-sm ${resetResult.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {resetResult}
            </p>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">All Users</h2>
            <button onClick={loadUsers} className="text-sm text-violet-400 hover:text-violet-300">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 text-left border-b border-zinc-800">
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Credits</th>
                  <th className="pb-2">Purchased</th>
                  <th className="pb-2">Free Today</th>
                  <th className="pb-2">Joined</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                {users.map(u => (
                  <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-2.5">
                      <button
                        onClick={() => setTopupEmail(u.email)}
                        className="text-violet-400 hover:text-violet-300"
                      >
                        {u.email}
                      </button>
                    </td>
                    <td className="py-2.5 font-medium">{u.credits_balance}</td>
                    <td className="py-2.5">{u.total_purchased}</td>
                    <td className="py-2.5">{u.free_used_today}</td>
                    <td className="py-2.5 text-zinc-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
