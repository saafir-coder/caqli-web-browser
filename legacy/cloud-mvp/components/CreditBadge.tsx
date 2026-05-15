'use client'
import { useEffect, useState } from 'react'

interface Credits {
  paidCredits: number
  freeUsedToday: number
  freeDailyLimit: number
}

export function CreditBadge({ tier, refreshKey }: { tier: 'free' | 'paid'; refreshKey: number }) {
  const [credits, setCredits] = useState<Credits | null>(null)

  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCredits(data) })
      .catch(() => {})
  }, [refreshKey])

  if (!credits) return null

  if (tier === 'free') {
    const remaining = credits.freeDailyLimit - credits.freeUsedToday
    return (
      <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
        {remaining}/{credits.freeDailyLimit} free today
      </span>
    )
  }

  return (
    <span className="text-xs text-violet-300 bg-violet-900/30 px-2 py-1 rounded">
      {credits.paidCredits} credits
    </span>
  )
}
