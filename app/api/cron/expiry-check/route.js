import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/lib/email'
import { subscriptionExpiredEmail } from '@/lib/email/templates'

/**
 * Cron job: Check for expired subscriptions and downgrade users
 * Runs daily at 10:00 AM UTC (1 hour after renewal reminders)
 */

function logCron(level, message, data = {}) {
  const timestamp = new Date().toISOString()
  console.log(JSON.stringify({ timestamp, level, source: 'cron-expiry-check', message, ...data }))
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logCron('error', 'Unauthorized cron request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { downgraded: 0, emailsSent: 0, errors: 0, details: [] }
  const now = new Date().toISOString()

  try {
    // Find active subscriptions that have expired
    const { data: expiredSubs, error } = await supabaseAdmin
      .from('subscriptions')
      .select('id, user_id, plan, current_period_end')
      .eq('status', 'active')
      .lt('current_period_end', now)

    if (error) {
      logCron('error', 'Failed to query expired subscriptions', { error: error.message })
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!expiredSubs || expiredSubs.length === 0) {
      logCron('info', 'No expired subscriptions found')
      return Response.json({ success: true, ...results })
    }

    for (const sub of expiredSubs) {
      try {
        // Downgrade subscription status
        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'expired', updated_at: now })
          .eq('id', sub.id)

        if (subError) {
          logCron('error', 'Failed to update subscription', { subId: sub.id, error: subError.message })
          results.errors++
          continue
        }

        // Downgrade profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'expired',
            subscription_end_date: null,
          })
          .eq('id', sub.user_id)

        if (profileError) {
          logCron('error', 'Failed to downgrade profile', { userId: sub.user_id, error: profileError.message })
          results.errors++
          continue
        }

        results.downgraded++
        logCron('info', 'User downgraded to free', { userId: sub.user_id, plan: sub.plan })

        // Send expiry email
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('id', sub.user_id)
          .single()

        if (profile?.email) {
          const { subject, html } = subscriptionExpiredEmail({
            name: profile.full_name,
            plan: sub.plan,
          })
          const emailResult = await sendEmail({
            to: profile.email,
            subject,
            html,
            idempotencyKey: `expired-${sub.id}-${now.slice(0, 10)}`,
          })

          if (emailResult.success) {
            results.emailsSent++
            logCron('info', 'Expiry email sent', { userId: sub.user_id })
          }
        }

        results.details.push({ userId: sub.user_id, plan: sub.plan, status: 'downgraded' })
      } catch (err) {
        logCron('error', 'Error processing expired sub', { subId: sub.id, error: err.message })
        results.errors++
      }
    }

    logCron('info', 'Expiry check completed', results)
    return Response.json({ success: true, ...results })
  } catch (error) {
    logCron('error', 'Cron fatal error', { error: error.message })
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}