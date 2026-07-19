import Paymongo from 'paymongo-node'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const paymongo = Paymongo(process.env.PAYMONGO_SECRET_KEY)

// ─── Logging helper ──────────────────────────────────────────────────────────
// In production, replace console.log with a proper logging service (e.g. Logtail, Datadog)
function logWebhook(level, message, data = {}) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    source: 'paymongo-webhook',
    message,
    ...data,
  }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(logEntry))
}

// Reverse-maps a PayMongo plan key back to plan/cycle info.
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

// Helper: reset AI generation counter for a user
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

// Helper: insert subscription record
async function insertSubscription({ userId, plan, cycle, providerSubscriptionId, periodEnd, renewalType = 'manual' }) {
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

// Helper: update profiles table
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

// Helper: insert lifetime slot payment
async function insertLifetimePayment({ userId, amount, currency, paymentMethod, slotsPurchased, providerPaymentId }) {
  const { error } = await supabaseAdmin.from('payments').insert({
    user_id: userId,
    amount,
    currency,
    payment_method: paymentMethod,
    status: 'paid',
    provider: 'paymongo',
    provider_payment_id: providerPaymentId,
    payment_type: 'lifetime_slot',
    slots_purchased: slotsPurchased,
  })

  if (error) {
    logWebhook('error', 'Failed to insert lifetime payment', { userId, error: error.message })
    throw error
  }

  logWebhook('info', 'Lifetime payment inserted', { userId, amount, currency, slotsPurchased })
}

// ─── Main Handler ────────────────────────────────────────────────────────────

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

  logWebhook('info', 'Webhook verified', {
    eventType: event.type,
    eventId: event.id,
  })

  try {
    // ── CHECKOUT SESSION PAYMENT PAID ──
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
          payments: checkoutSession.payments,
        })
        return Response.json({ error: 'No payment data' }, { status: 400 })
      }

      const paymentAttrs = payment.attributes || {}

      if (paymentType === 'subscription') {
        const planInfo = getPlanInfoFromKey(planKey)
        if (!planInfo) {
          logWebhook('error', 'Unknown plan key', { planKey })
          return Response.json({ error: 'Unknown plan key' }, { status: 400 })
        }

        const periodEnd = new Date(Date.now() + planInfo.periodDays * 24 * 60 * 60 * 1000)

        await insertSubscription({
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

        logWebhook('info', 'Subscription processed successfully', { userId, plan: planInfo.plan })
      } else if (paymentType === 'lifetime_slot') {
        const slotsPurchased = planKey === 'lifetime_1_slot' ? 1 : planKey === 'lifetime_3_slots' ? 3 : null

        if (!slotsPurchased) {
          logWebhook('error', 'Unknown lifetime plan key', { planKey })
          return Response.json({ error: 'Unknown lifetime plan key' }, { status: 400 })
        }

        await insertLifetimePayment({
          userId,
          amount: paymentAttrs.amount,
          currency: paymentAttrs.currency,
          paymentMethod: paymentAttrs.source?.type || 'unknown',
          slotsPurchased,
          providerPaymentId: payment.id,
        })

        logWebhook('info', 'Lifetime slot processed successfully', { userId, slotsPurchased })
      }
    }

    // ── PAYMENT FAILED ──
    else if (event.type === 'payment.failed') {
      const payment = event.data?.attributes || event.resource?.attributes
      logWebhook('info', 'Payment failed event received', {
        paymentId: payment?.id,
        amount: payment?.amount,
        currency: payment?.currency,
        status: payment?.status,
      })
      // TODO: Send email notification when email service is ready
    }

    // ── PAYMENT EXPIRED (QRPh timeout) ──
    else if (event.type === 'payment.expired') {
      const payment = event.data?.attributes || event.resource?.attributes
      logWebhook('info', 'Payment expired event received', {
        paymentId: payment?.id,
        amount: payment?.amount,
        currency: payment?.currency,
      })
      // TODO: Clean up pending checkout session, notify user
    }

    // ── UNKNOWN EVENT ──
    else {
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