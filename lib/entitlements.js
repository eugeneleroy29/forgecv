import { supabase } from '@/lib/supabase'

// Plan limits — single source of truth for what each tier unlocks.
// Update here only; every gate in the app reads from getUserEntitlements().
const PLAN_LIMITS = {
  free: {
    resumeLimit: 1,
    coverLetterLimit: 0,
    resumeTemplateLimit: 1,
    portfolioPublishSlots: 0,
    aiGenerationsPerMonth: 0,
    hasAnalytics: false,
    hasPrioritySupport: false,
  },
  starter: {
    resumeLimit: 3,
    coverLetterLimit: 3,
    resumeTemplateLimit: 3,
    portfolioPublishSlots: 1,
    aiGenerationsPerMonth: 30,
    hasAnalytics: false,
    hasPrioritySupport: false,
  },
  pro: {
    resumeLimit: Infinity,
    coverLetterLimit: Infinity,
    resumeTemplateLimit: Infinity,
    portfolioPublishSlots: 3,
    aiGenerationsPerMonth: 60,
    hasAnalytics: true,
    hasPrioritySupport: true,
  },
}

/**
 * Returns the full entitlement picture for a user: their plan, limits,
 * and total available portfolio publish slots (subscription + lifetime).
 *
 * This is a CLIENT-SIDE helper for UI display/gating decisions (showing
 * limits, disabling buttons, paywall modals). It relies on the browser's
 * Supabase session + RLS, same pattern as the rest of the app.
 *
 * IMPORTANT: This must NOT be trusted as the final authority for the
 * actual publish/write action. A server-side re-check is still required
 * at the moment of publishing, since this runs in the browser.
 */
export async function getUserEntitlements(userId) {
  if (!userId) {
    return { plan: 'free', ...PLAN_LIMITS.free, lifetimeSlots: 0, totalPublishSlots: 0, isAdmin: false }
  }

  // 1. Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('getUserEntitlements: failed to fetch profile', profileError)
  }

  const isAdmin = profile?.is_admin === true

  // Admins get unlimited everything
  if (isAdmin) {
    return {
      plan: 'admin',
      resumeLimit: Infinity,
    coverLetterLimit: Infinity,
      resumeTemplateLimit: Infinity,
      portfolioPublishSlots: Infinity,
      aiGenerationsPerMonth: Infinity,
      hasAnalytics: true,
      hasPrioritySupport: true,
      lifetimeSlots: 0,
      totalPublishSlots: Infinity,
      isAdmin: true,
    }
  }

  // 2. Look up an active subscription, if any.
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subError) {
    console.error('getUserEntitlements: failed to fetch subscription', subError)
  }

  const plan = subscription?.plan || 'free'
  const baseLimits = PLAN_LIMITS[plan] || PLAN_LIMITS.free

  // 3. Sum up lifetime portfolio slots from paid one-time purchases.
  const { data: lifetimePayments, error: paymentsError } = await supabase
    .from('payments')
    .select('slots_purchased')
    .eq('user_id', userId)
    .eq('payment_type', 'lifetime_slot')
    .eq('status', 'paid')

  if (paymentsError) {
    console.error('getUserEntitlements: failed to fetch lifetime payments', paymentsError)
  }

  const lifetimeSlots = (lifetimePayments || []).reduce(
    (sum, p) => sum + (p.slots_purchased || 0),
    0
  )

  return {
    plan,
    ...baseLimits,
    lifetimeSlots,
    totalPublishSlots: baseLimits.portfolioPublishSlots + lifetimeSlots,
    isAdmin: false,
  }
}