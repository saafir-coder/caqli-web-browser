import { createClient as createAdminClient } from '@supabase/supabase-js'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  let email: string, password: string
  try {
    const body = await req.json()
    email = body.email?.trim()
    password = body.password
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 })
  }

  // Sign in with Supabase using email + password
  const { data, error } = await adminSupabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return Response.json(
      { error: 'Invalid email or password. Register at caqli.ai first.' },
      { status: 401 }
    )
  }

  // Get the caqli_* API key from user metadata
  const apiKey = data.user.user_metadata?.api_key as string | undefined

  if (!apiKey) {
    // Fallback: look up in api_keys table
    const { data: keyRow } = await adminSupabase
      .from('api_keys')
      .select('key')
      .eq('user_id', data.user.id)
      .single()

    if (!keyRow?.key) {
      return Response.json({ error: 'No API key found. Contact support.' }, { status: 404 })
    }

    return Response.json({ apiKey: keyRow.key })
  }

  return Response.json({ apiKey })
}
