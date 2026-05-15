import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return Response.json({ error: 'user_id required' }, { status: 400 })
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, role, content, model_used, tier, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ messages: messages ?? [] })
}
