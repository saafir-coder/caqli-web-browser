import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin-only: top up credits for a user
// Protected by service role key in request
export async function POST(req: NextRequest) {
  const { email, credits, admin_key } = await req.json()

  // Simple admin auth — must provide service role key
  if (admin_key !== process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!email || !credits || credits <= 0) {
    return Response.json({ error: 'Email and credits (positive number) required' }, { status: 400 })
  }

  // Find user
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = users?.find(u => u.email === email)

  if (!user) {
    return Response.json({ error: `User ${email} not found` }, { status: 404 })
  }

  // Get current balance
  const { data: current } = await supabase
    .from('credits')
    .select('balance, total_purchased')
    .eq('user_id', user.id)
    .single()

  const currentBalance = current?.balance ?? 0
  const totalPurchased = current?.total_purchased ?? 0

  // Update credits
  await supabase.from('credits').upsert({
    user_id: user.id,
    balance: currentBalance + credits,
    total_purchased: totalPurchased + credits,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return Response.json({
    email,
    previous_balance: currentBalance,
    added: credits,
    new_balance: currentBalance + credits,
    total_purchased: totalPurchased + credits,
  })
}
