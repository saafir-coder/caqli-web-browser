import Link from 'next/link'

const DESKTOP_DIR = '/Users/abdillahi/dev/Caqli Ai/caqli-ai/desktop'

export default function DesktopPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <Link href="/" className="text-lg font-bold text-violet-400">
          Caqli AI
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-zinc-400 transition-colors hover:text-white">
            Dashboard
          </Link>
          <Link href="/login" className="text-zinc-400 transition-colors hover:text-white">
            Log in
          </Link>
        </div>
      </nav>

      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
        <section className="rounded-2xl border border-violet-800/40 bg-violet-900/10 p-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
            Desktop Preview
          </p>
          <h1 className="mb-3 text-3xl font-bold text-white">Caqli Desktop is currently local-only.</h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-300">
            Packaged downloads are not published yet, so this page shows the real local setup instead of
            sending you to an empty GitHub releases page.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Run It Locally</h2>
          <div className="space-y-5 text-sm text-zinc-300">
            <div>
              <p className="mb-2 text-white">If you are already inside the main repo:</p>
              <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-200">
{`cd desktop
bun install
bun run dev:desktop`}
              </pre>
            </div>

            <div>
              <p className="mb-2 text-white">If you want the full absolute path:</p>
              <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-200">
{`cd "${DESKTOP_DIR}"
bun install
bun run dev:desktop`}
              </pre>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="font-medium text-white">Important terminal rule</p>
              <p className="mt-2 leading-6 text-zinc-400">
                The folder name contains a space in <code>Caqli Ai</code>. If you use the full path, keep the
                quotes. If you are already in <code>caqli-ai</code>, use <code>cd desktop</code> and avoid the
                space problem completely.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
              <p className="font-medium text-emerald-200">Desktop bootstrap is now automatic</p>
              <p className="mt-2 leading-6 text-zinc-300">
                If the Electron runtime is missing, <code>bun run dev:desktop</code> will download it and
                continue instead of crashing with the old package error.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">What Should Open</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>Web app: <code>http://localhost:3000</code> when you run <code>npm run dev</code> in the root repo.</li>
            <li>Desktop web shell: <code>http://127.0.0.1:5733</code> in desktop dev mode.</li>
            <li>Desktop local backend: <code>http://127.0.0.1:13773</code> in desktop dev mode.</li>
            <li>Electron should open automatically after <code>bun run dev:desktop</code>.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Quick Test Flow</h2>
          <ol className="space-y-2 text-sm text-zinc-300">
            <li>Start the web app with <code>npm run dev</code> in the repo root and log in.</li>
            <li>Open the dashboard and copy your <code>caqli_*</code> API key.</li>
            <li>Start the desktop preview with <code>bun run dev:desktop</code>.</li>
            <li>Paste the API key, choose a local folder, open a file, and send a prompt.</li>
            <li>Test one free model first, then test Claude credit gating separately.</li>
          </ol>
        </section>
      </main>
    </div>
  )
}
