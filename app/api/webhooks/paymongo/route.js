import Paymongo from 'paymongo-node'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const paymongo = Paymongo(process.env.PAYMONGO_SECRET_KEY)

function logWebhook(level, message, data = {}) {
  const timestamp = new Date().toISOString()
  const logEntry = { timestamp, level, source: 'paymongo-webhook', message, ...data }
  console.log(JSON.stringify(logEntry))
}

function getPlanInfoFromKey(planKey) {
  const map = {
    starter_monthly: { plan: 'starter', cycle: 'monthly', periodDays: 30 },
    starter_annual: { plan: 'starter', cycle: 'annual', periodDays: 365 },
    pro_monthly: { plan: 'pro', cycle: 'monthly', periodDays: 30 },
    pro_annual: { plan: 'pro', cycle: 'annual', periodDays: 365 },
    lifetime_1_slot: { type: 'lifetime_slot', slots: 1 },
    lifetime_3_slots: { type: 'lifetime_slot', slots: 3 },
  }
  return map[planKey] || null
}

async function resetAiGenerations(userId) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      ai_generations_used: 0,
      ai_generations_reset_date: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    logWebhook('error', 'Failed to reset AI generations', { userId, error: error.message })
  } else {
    logWebhook('info', 'AI generations reset', { userId })
  }
}

// ── IDEMPOTENCY: Check if payment already exists ──
async function paymentExists(providerPaymentId) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('id')
    .eq('provider_payment_id', providerPaymentId)
    .maybeSingle()

  if (error) {
    logWebhook('error', 'paymentExists query failed', { providerPaymentId, error: error.message })
    return false
  }
  return !!data
}

// ── IDEMPOTENCY: Check if subscription already exists for this checkout session ──
async function subscriptionExists(providerSubscriptionId) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('provider_subscription_id', providerSubscriptionId)
    .maybeSingle()

  if (error) {
    logWebhook('error', 'subscriptionExists query failed', { providerSubscriptionId, error: error.message })
    return false
  }
  return !!data
}

// ── UPDATE existing subscription (for renewals) instead of inserting duplicate ──
async function upsertSubscription({ userId, plan, cycle, providerSubscriptionId, periodEnd, renewalType = 'manual' }) {
  const exists = await subscriptionExists(providerSubscriptionId)

  if (exists) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        plan,
        billing_cycle: cycle,
        status: 'active',
        current_period_end: periodEnd,
        renewal_type: renewalType,
        updated_at: new Date().toISOString(),
      })
      .eq('provider_subscription_id', providerSubscriptionId)

    if (error) {
      logWebhook('error', 'Failed to update subscription', { userId, providerSubscriptionId, error: error.message })
      throw error
    }
    logWebhook('info', 'Subscription updated (renewal)', { userId, plan, cycle, providerSubscriptionId })
  } else {
    const { error } = await supabaseAdmin.from('subscriptions').insert({
      user_id: userId,
      provider: 'paymongo',
      provider_subscription_id: providerSubscriptionId,
      plan,
      billing_cycle: cycle,
      renewal_type: renewalType,
      status: 'active',
      current_period_end: periodEnd,
    })

    if (error) {
      logWebhook('error', 'Failed to insert subscription', { userId, error: error.message, plan, cycle })
      throw error
    }
    logWebhook('info', 'Subscription inserted', { userId, plan, cycle, providerSubscriptionId })
  }
}

async function syncProfileSubscription({ userId, plan, status, endDate }) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: plan,
      subscription_status: status,
      subscription_end_date: endDate,
    })
    .eq('id', userId)

  if (error) {
    logWebhook('error', 'Failed to sync profile subscription', { userId, error: error.message })
  } else {
    logWebhook('info', 'Profile subscription synced', { userId, plan, status, endDate })
  }
}

async function insertPayment({ userId, amount, currency, paymentMethod, status, provider, providerPaymentId, paymentType }) {
  const { error } = await supabaseAdmin.from('payments').insert({
    user_id: userId,
    amount,
    currency,
    payment_method: paymentMethod,
    status,
    provider,
    provider_payment_id: providerPaymentId,
    payment_type: paymentType,
  })

  if (error) {
    logWebhook('error', 'Failed to insert payment', { userId, error: error.message })
    throw error
  }
  logWebhook('info', 'Payment inserted', { userId, amount, currency, paymentType })
}

export async function POST(request) {
  const rawBody = await request.text()
  const signatureHeader = request.headers.get('paymongo-signature') || ''

  logWebhook('info', 'Webhook received', {
    signaturePresent: !!signatureHeader,
    bodyLength: rawBody.length,
  })

  let event
  try {
    event = paymongo.webhooks.constructEvent({
      payload: rawBody,
      signatureHeader,
      webhookSecretKey: process.env.PAYMONGO_WEBHOOK_SECRET,
    })
  } catch (err) {
    logWebhook('error', 'Webhook signature verification failed', {
      error: err.message,
      signatureHeader: signatureHeader?.slice(0, 20) + '...',
    })
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  logWebhook('info', 'Webhook verified', { eventType: event.type, eventId: event.id })

  try {
    if (event.type === 'checkout_session.payment.paid') {
      const checkoutSession = event.data?.attributes || event.resource?.attributes

      if (!checkoutSession) {
        logWebhook('error', 'No checkout session data in payload', { event })
        return Response.json({ error: 'Invalid payload' }, { status: 400 })
      }

      const metadata = checkoutSession.metadata || {}
      const { userId, paymentType, planKey } = metadata
      const payment = checkoutSession.payments?.[0]

      logWebhook('info', 'Processing checkout_session.payment.paid', {
        userId,
        paymentType,
        planKey,
        hasPayment: !!payment,
        checkoutSessionId: checkoutSession.id,
      })

      if (!payment) {
        logWebhook('error', 'No payment found on checkout session', {
          checkoutSessionId: checkoutSession.id,
        })
        return Response.json({ error: 'No payment data' }, { status: 400 })
      }

      const paymentAttrs = payment.attributes || {}
      const providerPaymentId = payment.id

      // ── IDEMPOTENCY: Skip if payment already processed ──
      const alreadyPaid = await paymentExists(providerPaymentId)
      if (alreadyPaid) {
        logWebhook('info', 'Payment already processed — skipping', { providerPaymentId, checkoutSessionId: checkoutSession.id })
        return Response.json({ received: true, idempotent: true })
      }

      if (paymentType === 'subscription') {
        const planInfo = getPlanInfoFromKey(planKey)
        if (!planInfo) {
          logWebhook('error', 'Unknown plan key', { planKey })
          return Response.json({ error: 'Unknown plan key' }, { status: 400 })
        }

        const periodEnd = new Date(Date.now() + planInfo.periodDays * 24 * 60 * 60 * 1000)

        // ── Upsert subscription (insert new OR update existing) ──
        await upsertSubscription({
          userId,
          plan: planInfo.plan,
          cycle: planInfo.cycle,
          providerSubscriptionId: checkoutSession.id,
          periodEnd: periodEnd.toISOString(),
          renewalType: 'manual',
        })

        await syncProfileSubscription({
          userId,
          plan: planInfo.plan,
          status: 'active',
          endDate: periodEnd.toISOString(),
        })

        await resetAiGenerations(userId)

        await insertPayment({
          userId,
          amount: paymentAttrs.amount,
          currency: paymentAttrs.currency,
          paymentMethod: paymentAttrs.source?.type || 'qrph',
          status: 'succeeded',
          provider: 'paymongo',
          providerPaymentId,
          paymentType: 'subscription',
        })

        logWebhook('info', 'Subscription processed successfully', { userId, plan: planInfo.plan })
      } else if (paymentType === 'lifetime_slot') {
        const slotsPurchased = planKey === 'lifetime_1_slot' ? 1 : planKey === 'lifetime_3_slots' ? 3 : null

        if (!slotsPurchased) {
          logWebhook('error', 'Unknown lifetime plan key', { planKey })
          return Response.json({ error: 'Unknown lifetime plan key' }, { status: 400 })
        }

        await insertPayment({
          userId,
          amount: paymentAttrs.amount,
          currency: paymentAttrs.currency,
          paymentMethod: paymentAttrs.source?.type || 'qrph',
          status: 'succeeded',
          provider: 'paymongo',
          providerPaymentId,
          paymentType: 'lifetime_slot',
        })

        logWebhook('info', 'Lifetime slot processed successfully', { userId, slotsPurchased })
      }
    } else if (event.type === 'payment.failed') {
      const payment = event.data?.attributes || event.resource?.attributes
      logWebhook('info', 'Payment failed event received', {
        paymentId: payment?.id,
        amount: payment?.amount,
        currency: payment?.currency,
      })
    } else if (event.type === 'payment.expired') {
      const payment = event.data?.attributes || event.resource?.attributes
      logWebhook('info', 'Payment expired event received', {
        paymentId: payment?.id,
        amount: payment?.amount,
        currency: payment?.currency,
      })
    } else {
      logWebhook('warn', 'Unhandled webhook event type', { eventType: event.type, eventId: event.id })
    }

    return Response.json({ received: true })
  } catch (error) {
    logWebhook('error', 'Webhook processing error', {
      error: error.message,
      stack: error.stack,
      eventType: event.type,
    })
    return Response.json({ error: 'Processing failed' }, { status: 500 })
  }
}