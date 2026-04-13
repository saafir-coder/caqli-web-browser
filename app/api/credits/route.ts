import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const [{ data: credits }, { data: usage }] = await Promise.all([
    supabase.from('credits').select('balance').eq('user_id', user.id).single(),
    supabase.from('daily_usage').select('message_count').eq('user_id', user.id).eq('date', today).single(),
  ])

  return Response.json({
    paidCredits: credits?.balance ?? 0,
    freeUsedToday: usage?.message_count ?? 0,
    freeDailyLimit: 50,
  })
}
