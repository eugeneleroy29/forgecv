import { createClient } from '@supabase/supabase-js'
import { createStripeCheckoutSession, getStripePriceId } from '@/lib/payments/stripe'

// Server-side Supabase client, used only to verify who's making the request.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    // 1. Extract and verify the user's access token.
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }

    // 2. Read what plan/provider the client wants to purchase.
    const body = await request.json()
    const { provider, planKey } = body

    if (provider !== 'stripe') {
      return Response.json({ error: 'Only stripe is supported right now' }, { status: 400 })
    }

    // 3. Build success/cancel URLs dynamically from the incoming request.
    const origin = request.headers.get('origin')
    const successUrl = `${origin}/dashboard/billing/success`
    const cancelUrl = `${origin}/dashboard/billing/canceled`

    // 4. Create the Stripe checkout session.
    const priceId = getStripePriceId(planKey)
    const checkoutUrl = await createStripeCheckoutSession({
      userId: user.id,
      paymentType: 'subscription',
      priceId,
      successUrl,
      cancelUrl,
    })

    return Response.json({ url: checkoutUrl })
  } catch (err) {
    console.error('Checkout API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}