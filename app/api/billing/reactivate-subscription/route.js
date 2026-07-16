import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }

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

    const stripeSub = await stripe.subscriptions.update(
      subscription.provider_subscription_id,
      { cancel_at_period_end: false }
    )

    await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('provider_subscription_id', stripeSub.id)

    return Response.json({
      success: true,
      cancel_at_period_end: stripeSub.cancel_at_period_end,
      current_period_end: stripeSub.current_period_end,
    })
  } catch (err) {
    console.error('Reactivate subscription error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}