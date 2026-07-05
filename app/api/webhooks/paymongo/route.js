import Paymongo from 'paymongo-node'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const paymongo = Paymongo(process.env.PAYMONGO_SECRET_KEY)

export async function POST(request) {
  const rawBody = await request.text()
  const signatureHeader = request.headers.get('paymongo-signature') || ''

  let event
  try {
    event = paymongo.webhooks.constructEvent({
      payload: rawBody,
      signatureHeader,
      webhookSecretKey: process.env.PAYMONGO_WEBHOOK_SECRET,
    })
  } catch (err) {
    console.error('PayMongo webhook signature verification failed:', err.message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('PayMongo webhook received:', event.type)

  if (event.type === 'checkout_session.payment.paid') {
    const checkoutSession = event.resource
    const { userId, paymentType, planKey } = checkoutSession.attributes.metadata
    const payment = checkoutSession.attributes.payments?.[0]

    if (!payment) {
      console.error('PayMongo webhook: no payment found on checkout session yet, payload:', JSON.stringify(checkoutSession.attributes.payments))
      return Response.json({ error: 'No payment data' }, { status: 400 })
    }

    if (paymentType === 'subscription') {
      const [plan, cycle] = planKey.split('_') // e.g. "starter_monthly" -> ["starter", "monthly"]
      const periodDays = cycle === 'annual' ? 365 : 30
      const periodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000)

      const { error } = await supabaseAdmin.from('subscriptions').insert({
        user_id: userId,
        provider: 'paymongo',
        provider_subscription_id: checkoutSession.id,
        plan,
        billing_cycle: cycle,
        renewal_type: 'manual', // ALL PayMongo renewals are manual, per our earlier decision
        status: 'active',
        current_period_end: periodEnd.toISOString(),
      })

      if (error) {
        console.error('Failed to insert subscription:', error)
        return Response.json({ error: 'Database error' }, { status: 500 })
      }
    } else if (paymentType === 'lifetime_slot') {
      const slotsPurchased = planKey === 'lifetime_1_slot' ? 1 : planKey === 'lifetime_3_slots' ? 3 : null

      const { error } = await supabaseAdmin.from('payments').insert({
        user_id: userId,
        amount: payment.attributes.amount,
        currency: payment.attributes.currency,
        payment_method: payment.attributes.source?.type || 'unknown',
        status: 'paid',
        provider: 'paymongo',
        payment_type: 'lifetime_slot',
        slots_purchased: slotsPurchased,
      })

      if (error) {
        console.error('Failed to insert payment:', error)
        return Response.json({ error: 'Database error' }, { status: 500 })
      }
    }
  }

  return Response.json({ received: true })
}