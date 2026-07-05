import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Maps a friendly plan key to its Stripe Price ID (stored in env vars).
const STRIPE_PRICE_MAP = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  starter_annual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  lifetime_1_slot: process.env.STRIPE_PRICE_LIFETIME_1_SLOT,
  lifetime_3_slots: process.env.STRIPE_PRICE_LIFETIME_3_SLOTS,
}

/**
 * Looks up the Stripe Price ID for a given plan key.
 * Throws if the plan key is invalid or the env var is missing —
 * fails loudly rather than silently sending `undefined` to Stripe.
 */
export function getStripePriceId(planKey) {
  const priceId = STRIPE_PRICE_MAP[planKey]
  if (!priceId) {
    throw new Error(`Unknown or unconfigured Stripe plan key: "${planKey}"`)
  }
  return priceId
}

/**
 * Creates a Stripe Checkout Session and returns the URL to redirect the user to.
 *
 * @param {Object} params
 * @param {string} params.userId - Supabase user ID, stored in metadata for the webhook to use later
 * @param {'subscription'|'lifetime_slot'} params.paymentType
 * @param {string} params.priceId - Stripe Price ID (created in Stripe Dashboard, not here)
 * @param {string} params.successUrl - where to redirect after successful payment
 * @param {string} params.cancelUrl - where to redirect if user cancels
 */
export async function createStripeCheckoutSession({
  userId,
  paymentType,
  priceId,
  successUrl,
  cancelUrl,
}) {
  const session = await stripe.checkout.sessions.create({
    mode: paymentType === 'subscription' ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      paymentType,
    },
  })

  return session.url
}