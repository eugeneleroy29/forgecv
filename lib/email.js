/**
 * Email service using Resend API
 * Free tier: 100 emails/day
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'ForgeCV <onboarding@resend.dev>'

/**
 * Send an email via Resend
 * @param {Object} params
 * @param {string|string[]} params.to — Recipient email(s)
 * @param {string} params.subject — Email subject
 * @param {string} params.html — HTML body
 * @param {string} [params.text] — Plain text body (auto-generated from HTML if omitted)
 * @param {string} [params.idempotencyKey] — Prevents duplicate sends within 24h
 */
export async function sendEmail({ to, subject, html, text, idempotencyKey }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — email skipped:', subject)
    return { skipped: true, reason: 'RESEND_API_KEY not set' }
  }

  try {
    const payload = {
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text && { text }),
    }

    const options = idempotencyKey
      ? { headers: { 'Idempotency-Key': idempotencyKey } }
      : undefined

    const { data, error } = await resend.emails.send(payload, options)

    if (error) {
      console.error('[Email] Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Sent:', { id: data?.id, to, subject })
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[Email] Exception:', err.message)
    return { success: false, error: err.message }
  }
}