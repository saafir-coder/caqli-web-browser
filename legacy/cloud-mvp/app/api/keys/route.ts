import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — return user's API key from auth metadata
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const apiKey = user.user_metadata?.api_key

  if (!apiKey) {
    // Generate one on first access
    const keyBytes = new Uint8Array(24)
    crypto.getRandomValues(keyBytes)
    const hex = Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('')
    const newKey = `caqli_${hex}`

    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, api_key: newKey }
    })

    return Response.json({ key: newKey })
  }

  return Response.json({ key: apiKey })
}
