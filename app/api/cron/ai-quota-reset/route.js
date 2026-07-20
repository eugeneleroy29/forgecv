import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/lib/email'
import { aiQuotaResetEmail } from '@/lib/email/templates'

/**
 * Cron job: Reset AI generation quotas monthly
 * Runs on the 1st of every month at 00:00 UTC
 */

const PLAN_QUOTAS = {
  free: 5,
  starter: 50,
  pro: 200,
}

function logCron(level, message, data = {}) {
  const timestamp = new Date().toISOString()
  console.log(JSON.stringify({ timestamp, level, source: 'cron-ai-quota-reset', message, ...data }))
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logCron('error', 'Unauthorized cron request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { reset: 0, emailsSent: 0, errors: 0, details: [] }

  try {
    // Get all non-free users (free users also get reset but no email)
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, subscription_tier, subscription_status')
      .neq('subscription_tier', 'free')
      .neq('subscription_status', 'expired')

    if (error) {
      logCron('error', 'Failed to query profiles', { error: error.message })
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!profiles || profiles.length === 0) {
      logCron('info', 'No paid users to reset')
      return Response.json({ success: true, ...results })
    }

    const now = new Date().toISOString()

    for (const profile of profiles) {
      try {
        const quota = PLAN_QUOTAS[profile.subscription_tier] || PLAN_QUOTAS.free

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            ai_generations_used: 0,
            ai_generations_reset_date: now,
          })
          .eq('id', profile.id)

        if (updateError) {
          logCron('error', 'Failed to reset quota', { userId: profile.id, error: updateError.message })
          results.errors++
          continue
        }

        results.reset++
        logCron('info', 'AI quota reset', { userId: profile.id, tier: profile.subscription_tier, quota })

        // Send notification email
        if (profile.email) {
          const { subject, html } = aiQuotaResetEmail({
            name: profile.full_name,
            plan: profile.subscription_tier,
            quota,
          })
          const emailResult = await sendEmail({
            to: profile.email,
            subject,
            html,
            idempotencyKey: `quota-reset-${profile.id}-${now.slice(0, 7)}`,
          })

          if (emailResult.success) {
            results.emailsSent++
          }
        }

        results.details.push({
          userId: profile.id,
          tier: profile.subscription_tier,
          quota,
          status: 'reset',
        })
      } catch (err) {
        logCron('error', 'Error resetting quota', { userId: profile.id, error: err.message })
        results.errors++
      }
    }

    logCron('info', 'AI quota reset completed', results)
    return Response.json({ success: true, ...results })
  } catch (error) {
    logCron('error', 'Cron fatal error', { error: error.message })
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}