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
export async function createPaymongoCheckoutSession({
  userId,
  paymentType,
  planKey,
  successUrl,
  cancelUrl,
}) {
  const amount = getPaymongoAmount(planKey)
  if (!amount) {
    throw new Error(`Unknown PayMongo plan key: ${planKey}`)
  }

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