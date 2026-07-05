import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Reverse-maps a Stripe Price ID back to a plan/cycle or lifetime slot count.
// Single source of truth for both subscription and lifetime_slot handling below.
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, paymentType } = session.metadata

    // Fetch the actual line items to get the real Price ID —
    // never inferred from amount, since prices can change over time.
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

  return Response.json({ received: true })
}