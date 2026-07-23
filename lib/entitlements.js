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
export async function getUserEntitlements(userId, supabaseClient = null) {
  const client = supabaseClient || supabase;
  
  if (!userId) {
    return { plan: 'free', ...PLAN_LIMITS.free, lifetimeSlots: 0, totalPublishSlots: 0, isAdmin: false }
  }

  // 1. Check if user is admin
  const { data: profile } = await client
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (profile?.is_admin === true) {
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

  // 2. Look up subscription
  const { data: subscription } = await client
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  const plan = subscription?.plan || 'free'
  const baseLimits = PLAN_LIMITS[plan] || PLAN_LIMITS.free

  // 3. Get lifetime slots
  const { data: lifetimePayments } = await client
    .from('payments')
    .select('slots_purchased')
    .eq('user_id', userId)
    .eq('payment_type', 'lifetime_slot')
    .eq('status', 'paid')

  const lifetimeSlots = (lifetimePayments || []).reduce((sum, p) => sum + (p.slots_purchased || 0), 0)

  return {
    plan,
    ...baseLimits,
    lifetimeSlots,
    totalPublishSlots: baseLimits.portfolioPublishSlots + lifetimeSlots,
    isAdmin: false,
  }
}