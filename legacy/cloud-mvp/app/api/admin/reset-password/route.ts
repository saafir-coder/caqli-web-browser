import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email, new_password, admin_key } = await req.json()

  if (admin_key !== process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!email || !new_password || new_password.length < 6) {
    return Response.json({ error: 'Email and new password (min 6 chars) required' }, { status: 400 })
  }

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = users?.find(u => u.email === email)

  if (!user) {
    return Response.json({ error: `User ${email} not found` }, { status: 404 })
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, { password: new_password })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ email, message: 'Password reset successfully' })
}
