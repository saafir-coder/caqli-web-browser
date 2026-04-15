import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  let userId: string | null = null
  let dbClient: Awaited<ReturnType<typeof createClient>> | typeof adminSupabase

  if (authHeader?.startsWith('Bearer caqli_')) {
    const apiKey = authHeader.replace('Bearer ', '')
    const { data: { users } } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 })
    const user = users?.find(candidate => candidate.user_metadata?.api_key === apiKey)
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
    userId = user.id
    dbClient = adminSupabase
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })
    userId = user.id
    dbClient = supabase
  }

  const today = new Date().toISOString().split('T')[0]

  const [{ data: credits }, { data: usage }] = await Promise.all([
    dbClient.from('credits').select('balance').eq('user_id', userId).single(),
    dbClient.from('daily_usage').select('message_count').eq('user_id', userId).eq('date', today).single(),
  ])

  return Response.json({
    paidCredits: credits?.balance ?? 0,
    freeUsedToday: usage?.message_count ?? 0,
    freeDailyLimit: 100,
  })
}
