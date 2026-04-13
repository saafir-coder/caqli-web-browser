import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin-only: list all users with their credits and usage
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  // Get all credits
  const { data: allCredits } = await supabase.from('credits').select('*')
  const creditsMap = new Map((allCredits ?? []).map(c => [c.user_id, c]))

  // Get today's usage
  const today = new Date().toISOString().split('T')[0]
  const { data: allUsage } = await supabase.from('daily_usage').select('*').eq('date', today)
  const usageMap = new Map((allUsage ?? []).map(u => [u.user_id, u]))

  const result = (users ?? []).map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    api_key: u.user_metadata?.api_key || 'none',
    credits_balance: creditsMap.get(u.id)?.balance ?? 0,
    total_purchased: creditsMap.get(u.id)?.total_purchased ?? 0,
    free_used_today: usageMap.get(u.id)?.message_count ?? 0,
  }))

  return Response.json({
    total_users: result.length,
    users: result,
  })
}
