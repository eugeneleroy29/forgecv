import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email/templates'

/**
 * POST /api/email/welcome
 * Sends welcome email to a new user
 * Body: { email, name }
 */
export async function POST(request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const { subject, html } = welcomeEmail({ name, email })
    const result = await sendEmail({
      to: 'eugene.sunie@gmail.com',
      subject,
      html,
      idempotencyKey: `welcome-${email}`,
    })

    if (result.success) {
      return Response.json({ success: true, id: result.id })
    } else if (result.skipped) {
      return Response.json({ success: true, skipped: true, reason: result.reason })
    } else {
      return Response.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('[Welcome Email API] Error:', error.message)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}