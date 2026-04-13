import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-violet-400 font-bold text-lg">Caqli AI</span>
        <div className="flex items-center gap-4">
          <a
            href="https://t.me/abdillahiAI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Upgrade to Paid — Contact me
          </a>
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-800/50 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
          Somali Developers — Free Access
        </div>

        <h1 className="text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
          AI Coding Tool
          <br />
          <span className="text-violet-400">Built for Somalia</span>
        </h1>

        <p className="text-zinc-400 text-lg mb-4 max-w-xl">
          Caqli AI waa AI coding tool Somali developers u gaar ah.
          No Anthropic account needed. No VPN. Just sign up and build.
        </p>

        <p className="text-zinc-500 text-sm mb-10">
          Like Cursor — write code, ask AI, get answers. Free to start.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/login"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Start Free — 20 messages/day
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            {
              title: 'AI Code Editor',
              desc: 'Write code, AI sees it, answers your questions instantly',
            },
            {
              title: 'Free Models',
              desc: '20 messages/day free. No credit card. No Anthropic account.',
            },
            {
              title: 'Paid = Claude',
              desc: 'Upgrade to Claude for the most powerful AI coding help',
            },
          ].map((f) => (
            <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left">
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-zinc-600 text-sm py-6">
        Caqli AI — Made for Somali Developers
      </footer>
    </div>
  )
}
