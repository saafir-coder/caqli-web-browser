# Caqli AI

AI coding assistant built for Somali developers. Caqli now lives as one canonical repository that contains the web product at the root and the desktop product under `desktop/`.

Think Cursor, but free and runs entirely in the browser.

---

## What It Does

- **Free tier** — 100 AI messages/day via Open Router (Llama, Gemma, Nemotron, etc.)
- **Paid tier** — Claude Sonnet, GPT-4o, Gemini 2.0 Flash (credit-based, contact via Telegram)
- **VS Code integration** — Works as a backend for the [Continue](https://continue.dev) extension
- **Web editor** — Monaco editor (same as VS Code) with AI chat sidebar
- **Desktop app** — Electron workspace with local file access, model selection, and agent-driven edits

---

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** — Auth, PostgreSQL, Row-Level Security
- **Open Router** — Free model routing
- **Anthropic SDK** — Claude (paid tier)
- **Monaco Editor** — In-browser code editor
- **Tailwind CSS 4** — Dark theme UI

---

## Getting Started (Local)

### 1. Clone and install

```bash
git clone https://github.com/saafir-coder/caqli-ai.git
cd caqli-ai
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Set up Supabase

Run both SQL files in your Supabase SQL editor:

```
supabase/schema.sql
supabase/api-keys-schema.sql
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Repository Layout

`caqli-ai` is the canonical repository for the product.

- Root: Next.js web app, API, auth, billing, dashboard, browser editor
- `desktop/`: imported desktop monorepo containing Electron, local server, web shell, and shared contracts

## Project Structure

```
app/
  page.tsx              # Landing page
  login/                # Auth (sign up / log in)
  editor/               # Web code editor + AI chat
  dashboard/            # Setup wizard, API key, credit purchase
  admin/                # Admin panel (credit topup, user management)
  api/
    chat/               # Web editor chat (free & paid routing)
    credits/            # Credit balance
    keys/               # API key generation
    admin/              # Admin endpoints
    v1/
      chat/completions/ # OpenAI-compatible proxy (for Continue IDE)
      messages/         # Anthropic-format proxy

components/
  Editor.tsx            # Monaco editor wrapper
  ChatPanel.tsx         # AI chat sidebar
  CreditBadge.tsx       # Credit/usage display

lib/
  supabase.ts           # Browser Supabase client
  supabase-server.ts    # Server Supabase client
  openrouter.ts         # Open Router (free models)
  anthropic.ts          # Anthropic SDK (paid)
  pricing.ts            # Token to credit conversion

supabase/
  schema.sql            # Main DB schema (profiles, credits, messages, usage)
  api-keys-schema.sql   # API keys + usage log

desktop/
  apps/desktop/         # Electron desktop shell
  apps/web/             # Desktop web UI
  apps/server/          # Local backend/runtime
  packages/             # Shared contracts and runtime packages
```

---

## Credit System

- 1 credit = ~$0.01
- Free tier: 100 messages/day, resets at UTC midnight
- Paid credits: purchased via Telegram contact, added manually by admin
- Pricing defined in `lib/pricing.ts` (token rates with 2.5x markup)

---

## VS Code + Continue Setup

After signing up, go to the Dashboard and follow the 3-step setup:
1. Download VS Code
2. Install the Continue extension
3. Copy the setup command and paste it in the VS Code terminal

This auto-configures all 8 models using your `caqli_*` API key.

---

## Admin

Access `/admin` with the Supabase service role key to:
- View all users and usage stats
- Top up credits for any user
- Reset passwords

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `OPENROUTER_API_KEY` | Open Router API key (free models) |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude paid tier) |

---

## License

MIT
