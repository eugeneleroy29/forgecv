/**
 * Signup welcome email trigger
 * Call this after successful Supabase auth signup
 */
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email/templates'

export async function sendWelcomeEmail({ email, name }) {
  const { subject, html } = welcomeEmail({ name, email })
  return sendEmail({
    to: email,
    subject,
    html,
    idempotencyKey: `welcome-${email}`,
  })
}