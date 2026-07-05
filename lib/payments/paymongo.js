// PayMongo has no official Node SDK — calling their REST API directly.
const PAYMONGO_API_BASE = 'https://api.paymongo.com/v1'

// PayMongo auth uses HTTP Basic Auth: secret key as username, empty password.
function getAuthHeader() {
  const encoded = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64')
  return `Basic ${encoded}`
}

// Centralized peso pricing — PayMongo needs raw amounts (in centavos), not Price IDs.
// Mirrors the same plan keys used in stripe.js for consistency across providers.
const PAYMONGO_PRICE_MAP = {
  starter_monthly: { amount: 14900, name: 'ForgeCV Starter (Monthly)' },
  starter_annual: { amount: 149000, name: 'ForgeCV Starter (Annual)' },
  pro_monthly: { amount: 29900, name: 'ForgeCV Pro (Monthly)' },
  pro_annual: { amount: 299000, name: 'ForgeCV Pro (Annual)' },
  lifetime_1_slot: { amount: 49900, name: 'ForgeCV Lifetime — 1 Portfolio Slot' },
  lifetime_3_slots: { amount: 99900, name: 'ForgeCV Lifetime — 3 Portfolio Slots' },
}

export function getPaymongoPriceInfo(planKey) {
  const info = PAYMONGO_PRICE_MAP[planKey]
  if (!info) {
    throw new Error(`Unknown or unconfigured PayMongo plan key: "${planKey}"`)
  }
  return info
}

/**
 * Creates a PayMongo Checkout Session and returns the URL to redirect the user to.
 * Always one-time payment — PayMongo Checkout API has no native recurring mode.
 * Renewal for subscriptions is handled manually (reminder email + repeat checkout).
 */
export async function createPaymongoCheckoutSession({
  userId,
  paymentType,
  planKey,
  successUrl,
  cancelUrl,
}) {
  const { amount, name } = getPaymongoPriceInfo(planKey)

  const response = await fetch(`${PAYMONGO_API_BASE}/checkout_sessions`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              amount,
              currency: 'PHP',
              name,
              quantity: 1,
            },
          ],
          payment_method_types: ['card', 'gcash', 'paymaya'],
          success_url: successUrl,
          cancel_url: cancelUrl,
          description: name,
          send_email_receipt: true,
          show_line_items: true,
          metadata: {
            userId,
            paymentType,
            planKey,
          },
        },
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('PayMongo checkout session error:', data)
    throw new Error(data?.errors?.[0]?.detail || 'Failed to create PayMongo checkout session')
  }

  return data.data.attributes.checkout_url
}