import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-violet-400 font-bold text-lg">Caqli AI</span>
        <Link
          href="/login"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Log in
        </Link>
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
