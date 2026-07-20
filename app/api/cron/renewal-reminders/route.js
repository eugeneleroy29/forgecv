import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/lib/email'
import { renewalReminderEmail } from '@/lib/email/templates'

/**
 * Cron job: Send renewal reminders for PayMongo manual subscriptions
 * Runs daily at 9:00 AM UTC
 * Sends reminders at 7 days, 3 days, 1 day before expiry
 */

const REMINDER_DAYS = [7, 3, 1]

function logCron(level, message, data = {}) {
  const timestamp = new Date().toISOString()
  console.log(JSON.stringify({ timestamp, level, source: 'cron-renewal-reminders', message, ...data }))
}

export async function GET(request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logCron('error', 'Unauthorized cron request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { sent: 0, skipped: 0, errors: 0, details: [] }

  try {
    for (const daysLeft of REMINDER_DAYS) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + daysLeft)
      targetDate.setHours(0, 0, 0, 0)

      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      // Find active PayMongo subscriptions expiring on target date
      const { data: subscriptions, error } = await supabaseAdmin
        .from('subscriptions')
        .select('id, user_id, plan, billing_cycle, current_period_end, provider')
        .eq('provider', 'paymongo')
        .eq('status', 'active')
        .eq('renewal_type', 'manual')
        .gte('current_period_end', targetDate.toISOString())
        .lt('current_period_end', nextDay.toISOString())

      if (error) {
        logCron('error', 'Failed to query subscriptions', { daysLeft, error: error.message })
        results.errors++
        continue
      }

      if (!subscriptions || subscriptions.length === 0) {
        logCron('info', 'No subscriptions expiring', { daysLeft })
        continue
      }

      for (const sub of subscriptions) {
        // Get user email
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('id', sub.user_id)
          .single()

        if (!profile?.email) {
          logCron('warn', 'No email for user', { userId: sub.user_id })
          results.skipped++
          continue
        }

        // Check if reminder already sent (idempotency via email log or dedup)
        // For now, we use idempotency key on the send itself
        const planKey = `${sub.plan}_${sub.billing_cycle}`
        const amount = getPlanAmount(planKey)

        const { subject, html } = renewalReminderEmail({
          name: profile.full_name,
          plan: sub.plan,
          daysLeft,
          periodEnd: sub.current_period_end,
          amount,
          currency: 'PHP',
        })

        const idempotencyKey = `renewal-reminder-${sub.id}-${daysLeft}-${new Date().toISOString().slice(0, 10)}`

        const emailResult = await sendEmail({
          to: profile.email,
          subject,
          html,
          idempotencyKey,
        })

        if (emailResult.success) {
          logCron('info', 'Reminder sent', { userId: sub.user_id, daysLeft, email: profile.email })
          results.sent++
        } else if (emailResult.skipped) {
          logCron('warn', 'Reminder skipped', { userId: sub.user_id, daysLeft, reason: emailResult.reason })
          results.skipped++
        } else {
          logCron('error', 'Reminder failed', { userId: sub.user_id, daysLeft, error: emailResult.error })
          results.errors++
        }

        results.details.push({
          userId: sub.user_id,
          daysLeft,
          email: profile.email,
          status: emailResult.success ? 'sent' : emailResult.skipped ? 'skipped' : 'error',
        })
      }
    }

    logCron('info', 'Cron completed', results)
    return Response.json({ success: true, ...results })
  } catch (error) {
    logCron('error', 'Cron fatal error', { error: error.message })
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

function getPlanAmount(planKey) {
  const map = {
    starter_monthly: 14900,
    starter_annual: 149000,
    pro_monthly: 29900,
    pro_annual: 299000,
  }
  return map[planKey] || null
}