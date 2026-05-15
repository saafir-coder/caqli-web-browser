import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password || password.length < 6) {
    return Response.json({ error: 'Email and password (min 6 chars) required' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      api_key: `caqli_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('')}`
    }
  })

  if (error) {
    if (error.message.includes('already') || error.message.includes('exists')) {
      return Response.json({ error: 'Email already registered. Try logging in.' }, { status: 409 })
    }
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ user: { id: data.user.id, email: data.user.email } })
}
