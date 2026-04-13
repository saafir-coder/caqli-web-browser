import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { pendingSignups } from '@/lib/pending-signups'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function setupUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const updates: Record<string, unknown> = {}

  // Generate API key if missing
  if (!user.user_metadata?.api_key) {
    const apiKey = `caqli_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('')}`
    updates.user_metadata = { ...user.user_metadata, api_key: apiKey }
  }

  // Set password if pending from signup
  if (user.email) {
    const pending = pendingSignups.get(user.email)
    if (pending && Date.now() < pending.expires) {
      updates.password = pending.password
      updates.email_confirm = true
      pendingSignups.delete(user.email)
    }
  }

  if (Object.keys(updates).length > 0) {
    await adminSupabase.auth.admin.updateUserById(user.id, updates)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Handle magic link (token_hash + type)
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'email' | 'signup' | 'magiclink',
    })

    if (!error && data.user) {
      await setupUser(data.user)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Handle OAuth / code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await setupUser(data.user)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
