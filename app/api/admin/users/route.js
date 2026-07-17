import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Allowed fields that admins can override
const ALLOWED_FIELDS = [
  'subscription_tier',
  'subscription_status',
  'ai_generations_used',
  'ai_generations_reset_date',
  'portfolio_slots',
  'is_admin',
  'is_banned',
]

export async function PATCH(request) {
  try {
    // 1. Verify auth
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Verify the requester is an admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!requesterProfile?.is_admin) {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 3. Parse request body
    const { userId, updates } = await request.json()

    if (!userId || !updates || typeof updates !== 'object') {
      return Response.json({ error: 'Missing userId or updates' }, { status: 400 })
    }

    // 4. Filter to only allowed fields
    const filteredUpdates = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in updates) {
        filteredUpdates[key] = updates[key]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // 5. Prevent self-demotion from admin
    if (userId === user.id && updates.is_admin === false) {
      return Response.json({ error: 'Cannot remove your own admin access' }, { status: 400 })
    }

    // 6. Apply updates to profiles using supabaseAdmin (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Admin update error:', error)
      return Response.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // 7. SYNC to subscriptions table if subscription_tier changed
    if ('subscription_tier' in filteredUpdates) {
      const newTier = filteredUpdates.subscription_tier

      if (newTier === 'free') {
        // Downgrade: cancel any active subscriptions
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'active')
      } else {
        // Upgrade or change tier: upsert subscription row
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        if (existingSub) {
          // Update existing active subscription
          await supabaseAdmin
            .from('subscriptions')
            .update({
              plan: newTier,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id)
        } else {
          // Insert new subscription (admin override — no payment)
          const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
            user_id: userId,
            provider: 'stripe',
            provider_subscription_id: `admin_${userId}_${Date.now()}`,
            plan: newTier,
            billing_cycle: 'monthly',
            renewal_type: 'manual',
            status: 'active',
            current_period_end: periodEnd.toISOString(),
          })

          if (insertError) {
            console.error('Failed to insert admin override subscription:', insertError)
            return Response.json({ error: 'Failed to create subscription record' }, { status: 500 })
          }
        }
      }
    }

    return Response.json({ success: true, user: data?.[0] })
  } catch (err) {
    console.error('Admin users API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}