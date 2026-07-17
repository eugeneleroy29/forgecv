import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Reverse-maps a Stripe Price ID back to a plan/cycle or lifetime slot count.
function getPlanInfoFromPriceId(priceId) {
  const map = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY]: { type: 'subscription', plan: 'starter', cycle: 'monthly' },
    [process.env.STRIPE_PRICE_STARTER_ANNUAL]: { type: 'subscription', plan: 'starter', cycle: 'annual' },
    [process.env.STRIPE_PRICE_PRO_MONTHLY]: { type: 'subscription', plan: 'pro', cycle: 'monthly' },
    [process.env.STRIPE_PRICE_PRO_ANNUAL]: { type: 'subscription', plan: 'pro', cycle: 'annual' },
    [process.env.STRIPE_PRICE_LIFETIME_1_SLOT]: { type: 'lifetime_slot', slots: 1 },
    [process.env.STRIPE_PRICE_LIFETIME_3_SLOTS]: { type: 'lifetime_slot', slots: 3 },
  }
  return map[priceId] || null
}

// Helper: update subscription in DB
async function syncSubscription(subscription) {
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('provider_subscription_id', subscription.id)
    .maybeSingle()

  const planInfo = getPlanInfoFromPriceId(subscription.items.data[0]?.price?.id)
  const periodEnd = new Date(subscription.items.data[0].current_period_end * 1000).toISOString()

  const payload = {
    status: subscription.status, // active, canceled, past_due, unpaid, etc.
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }

  if (planInfo?.plan) {
    payload.plan = planInfo.plan
  }

  if (existing) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update(payload)
      .eq('provider_subscription_id', subscription.id)
    if (error) console.error('Failed to update subscription:', error)
  } else {
    // Fallback: insert if missing (shouldn't happen, but safe)
    const { error } = await supabaseAdmin.from('subscriptions').insert({
      user_id: subscription.metadata?.userId || subscription.customer,
      provider: 'stripe',
      provider_subscription_id: subscription.id,
      plan: planInfo?.plan || 'starter',
      billing_cycle: planInfo?.cycle || 'monthly',
      renewal_type: 'auto',
      ...payload,
    })
    if (error) console.error('Failed to insert subscription:', error)
  }
}

// Helper: reset AI generation counter for a user
async function resetAiGenerations(userId) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      ai_generations_used: 0,
      ai_generations_reset_date: new Date().toISOString(),
    })
    .eq('id', userId)
  if (error) console.error('Failed to reset AI generations:', error)
}

// Helper: downgrade user to free
async function downgradeToFree(userId) {
  // Update subscription status to canceled
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('provider', 'stripe')
  if (subError) console.error('Failed to cancel subscription:', subError)

  // Reset profiles subscription tier
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
    })
    .eq('id', userId)
}

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Stripe webhook received:', event.type)

  try {
    // ── CHECKOUT COMPLETED ──
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { userId, paymentType } = session.metadata

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const priceId = lineItems.data[0]?.price?.id
      const planInfo = getPlanInfoFromPriceId(priceId)

      if (!planInfo) {
        console.error('Stripe webhook: unrecognized price ID', priceId)
        return Response.json({ error: 'Unrecognized price' }, { status: 400 })
      }

      if (planInfo.type === 'subscription') {
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription)

        const { error } = await supabaseAdmin.from('subscriptions').insert({
          user_id: userId,
          provider: 'stripe',
          provider_subscription_id: stripeSubscription.id,
          plan: planInfo.plan,
          billing_cycle: planInfo.cycle,
          renewal_type: 'auto',
          status: 'active',
          current_period_end: new Date(stripeSubscription.items.data[0].current_period_end * 1000).toISOString(),
        })

        if (error) {
          console.error('Failed to insert subscription:', error)
          return Response.json({ error: 'Database error' }, { status: 500 })
        }

        // Sync subscription tier to profiles table
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: planInfo.plan,
            subscription_status: 'active',
            subscription_end_date: new Date(stripeSubscription.items.data[0].current_period_end * 1000).toISOString(),
          })
          .eq('id', userId)

        // Reset AI counter on new subscription
        await resetAiGenerations(userId)
      } else if (planInfo.type === 'lifetime_slot') {
        const { error } = await supabaseAdmin.from('payments').insert({
          user_id: userId,
          amount: session.amount_total,
          currency: session.currency,
          payment_method: 'card',
          status: 'paid',
          provider: 'stripe',
          payment_type: 'lifetime_slot',
          slots_purchased: planInfo.slots,
        })

        if (error) {
          console.error('Failed to insert payment:', error)
          return Response.json({ error: 'Database error' }, { status: 500 })
        }
      }
    }

    // ── SUBSCRIPTION RENEWED ──
    else if (event.type === 'invoice.paid') {
      const invoice = event.data.object
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        await syncSubscription(subscription)

        // Reset AI generations on successful renewal (new billing period)
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('provider_subscription_id', subscription.id)
          .single()

        if (sub?.user_id) {
          await resetAiGenerations(sub.user_id)
        }
      }
    }

    // ── PAYMENT FAILED ──
    else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        await syncSubscription(subscription)

        // TODO: Send email notification to user about failed payment
        console.log('Payment failed for subscription:', subscription.id)
      }
    }

    // ── SUBSCRIPTION UPDATED ──
    // Covers: plan changes, cancel_at_period_end toggled, status changes
    else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object
      await syncSubscription(subscription)
    }

    // ── SUBSCRIPTION CANCELED (end of period reached) ──
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object

      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('provider_subscription_id', subscription.id)
        .single()

      if (sub?.user_id) {
        await downgradeToFree(sub.user_id)
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook processing error:', error)
    return Response.json({ error: 'Processing failed' }, { status: 500 })
  }
}