import { supabaseAdmin } from '@/lib/supabaseAdmin'
/**
 * PayMongo v2 API client for QRPh checkout sessions.
 * The paymongo-node library (v10.17.0) only supports v1 API,
 * which does not include QRPh. We use direct fetch calls to v2 instead.
 */

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v2'

function getAuthHeader() {
  const encoded = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')
  return `Basic ${encoded}`
}

/**
 * Maps a ForgeCV plan key to the PayMongo amount in centavos.
 */
function getPaymongoAmount(planKey) {
  const map = {
    starter_monthly: 14900,
    starter_annual: 149000,
    pro_monthly: 29900,
    pro_annual: 299000,
    lifetime_1_slot: 49900,
    lifetime_3_slots: 99900,
  }
  return map[planKey]
}

/**
 * Creates a PayMongo v2 Checkout Session with QRPh support.
 */
/**
 * Calculates prorated upgrade amount for PayMongo.
 * If user has an active PayMongo subscription, charge only the difference
 * between new plan price and remaining value of old plan.
 */
async function getProratedAmount(userId, planKey, fullAmount) {
  // Only apply proration for subscription upgrades
  if (planKey.startsWith('lifetime_')) {
    return fullAmount
  }

  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, billing_cycle, current_period_end')
    .eq('user_id', userId)
    .eq('provider', 'paymongo')
    .eq('status', 'active')
    .maybeSingle()

  if (error || !subscription) {
    return fullAmount
  }

  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)

  // If subscription already expired, charge full amount
  if (periodEnd <= now) {
    return fullAmount
  }

  const planPrices = {
    starter_monthly: 14900,
    starter_annual: 149000,
    pro_monthly: 29900,
    pro_annual: 299000,
  }

  const oldPlanKey = `${subscription.plan}_${subscription.billing_cycle}`
  const oldPlanPrice = planPrices[oldPlanKey]
  const newPlanPrice = planPrices[planKey]

  // If we can't map prices, charge full amount
  if (!oldPlanPrice || !newPlanPrice) {
    return fullAmount
  }

  // If downgrading or same plan, charge full amount (no proration for downgrades)
  if (newPlanPrice <= oldPlanPrice) {
    return fullAmount
  }

  // Calculate days remaining in current period
  const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // Estimate total days in period (30 for monthly, 365 for annual)
  const totalDays = subscription.billing_cycle === 'annual' ? 365 : 30
  
  // Remaining value of old plan in centavos
  const remainingValue = Math.round((oldPlanPrice / totalDays) * daysRemaining)
  
  // Prorated amount = new plan price - remaining old value
  let proratedAmount = newPlanPrice - remainingValue
  
  // Minimum charge: 100 centavos (₱1.00)
  if (proratedAmount < 100) {
    proratedAmount = 100
  }

  return proratedAmount
}

export async function createPaymongoCheckoutSession({
  userId,
  paymentType,
  planKey,
  successUrl,
  cancelUrl,
}) {
  const fullAmount = getPaymongoAmount(planKey)
  if (!fullAmount) {
    throw new Error(`Unknown PayMongo plan key: ${planKey}`)
  }

  const amount = await getProratedAmount(userId, planKey, fullAmount)

  const description =
    paymentType === 'lifetime_slot'
      ? 'ForgeCV Lifetime Portfolio Slot'
      : `ForgeCV ${planKey.replace('_', ' ').toUpperCase()}`

  const response = await fetch(`${PAYMONGO_BASE_URL}/checkout_sessions`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: {
            name: 'ForgeCV Customer',
            email: 'customer@forgecv.com',
            phone: '09171234567',
          },
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          description,
          line_items: [
            {
              name: description,
              amount,
              currency: 'PHP',
              quantity: 1,
            },
          ],
          payment_method_types: ['qrph'],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            userId,
            paymentType,
            planKey,
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('PayMongo v2 checkout error:', errorData)
    throw new Error(
      errorData.errors?.[0]?.detail ||
      `PayMongo checkout failed: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  return data.data.attributes.checkout_url
}