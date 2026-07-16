import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    // 1. Verify auth
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify token is valid (we still need to know WHO is making the request)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }


    // 2. Get user's Stripe subscription using supabaseAdmin (bypasses RLS)
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('provider_subscription_id, provider')
      .eq('user_id', user.id)
      .eq('provider', 'stripe')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()


    if (subError || !subscription?.provider_subscription_id) {
      return Response.json({ error: 'No active Stripe subscription found' }, { status: 404 })
    }

    // 3. Cancel at period end in Stripe
    const stripeSub = await stripe.subscriptions.update(
      subscription.provider_subscription_id,
      { cancel_at_period_end: true }
    )

    // 4. Sync to DB immediately
    await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('provider_subscription_id', stripeSub.id)

    return Response.json({
      success: true,
      cancel_at_period_end: stripeSub.cancel_at_period_end,
      current_period_end: stripeSub.current_period_end,
    })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}