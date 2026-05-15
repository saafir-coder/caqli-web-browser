'use client'

interface ModelSelectorProps {
  tier: 'free' | 'paid'
  onChange: (tier: 'free' | 'paid') => void
}

export function ModelSelector({ tier, onChange }: ModelSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
      {(['free', 'paid'] as const).map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${
            tier === option
              ? 'bg-violet-600 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {option === 'free' ? 'Free Model' : 'Claude (Paid)'}
        </button>
      ))}
    </div>
  )
}
