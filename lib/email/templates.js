/**
 * Email templates for ForgeCV
 * All templates return { subject, html }
 * Uses inline styles for maximum email client compatibility
 */

function baseTemplate({ title, previewText, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .logo { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px; letter-spacing: -0.5px; }
    .logo-accent { color: #16a34a; }
    h1 { font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px 0; letter-spacing: -0.5px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 16px 0; }
    .highlight { background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #bbf7d0; }
    .highlight p { margin: 0; color: #166534; font-weight: 500; }
    .btn { display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; margin: 8px 0 24px 0; }
    .btn:hover { background: #15803d; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 13px; color: #94a3b8; margin: 4px 0; }
    .footer a { color: #16a34a; text-decoration: none; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 14px; color: #64748b; }
    .detail-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 16px 0; }
    .warning p { margin: 0; color: #92400e; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Forge<span class="logo-accent">CV</span></div>
      ${content}
      <div class="footer">
        <p>ForgeCV — Build your resume, portfolio, and cover letter with AI</p>
        <p><a href="https://forgecv-eight.vercel.app/">forgecv-eight.vercel.app</a></p>
        <p style="margin-top:12px;font-size:12px;color:#cbd5e1;">You received this email because you have an account on ForgeCV.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ── Welcome Email ───────────────────────────────────────────────
export function welcomeEmail({ name, email }) {
  const content = `
    <h1>Welcome to ForgeCV, ${name || 'there'}!</h1>
    <p>Your account is ready. Start building your professional presence with AI-powered tools.</p>
    <div class="highlight">
      <p>Free plan includes: 1 resume and 1 resume template. Upgrade to unlock portfolios, cover letters, and AI generations.</p>
    </div>
    <p>Upgrade anytime to unlock unlimited resumes, portfolios, templates, and more AI generations.</p>
    <a href="https://forgecv-eight.vercel.app/dashboard" class="btn">Go to Dashboard</a>
    <p style="font-size:13px;color:#94a3b8;">Need help? Visit our <a href="https://forgecv-eight.vercel.app/support">support page</a>.</p>
  `
  return {
    subject: 'Welcome to ForgeCV — Your account is ready',
    html: baseTemplate({ title: 'Welcome to ForgeCV', previewText: 'Your account is ready. Start building your professional presence.', content }),
  }
}

// ── Payment Success (Subscription) ──────────────────────────────
export function paymentSuccessEmail({ name, plan, billingCycle, amount, currency, paymentMethod, periodEnd }) {
  const cycleLabel = billingCycle === 'annual' ? 'year' : 'month'
  const symbol = currency?.toUpperCase() === 'USD' ? '$' : 'P'
  const formattedAmount = (amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })

  const content = `
    <h1>Payment Successful</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for subscribing to ForgeCV ${plan.charAt(0).toUpperCase() + plan.slice(1)}. Your payment has been received and your subscription is now active.</p>
    <div class="highlight">
      <div class="detail-row"><span class="detail-label">Plan</span><span class="detail-value">${plan.charAt(0).toUpperCase() + plan.slice(1)} (${billingCycle})</span></div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${symbol}${formattedAmount}</span></div>
      <div class="detail-row"><span class="detail-label">Payment Method</span><span class="detail-value">${paymentMethod?.toUpperCase() || 'QRPh'}</span></div>
      <div class="detail-row"><span class="detail-label">Next Renewal</span><span class="detail-value">${new Date(periodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
    </div>
    <a href="https://forgecv-eight.vercel.app/dashboard/billing" class="btn">View Billing</a>
    <p style="font-size:13px;color:#94a3b8;">Questions? Visit <a href="https://forgecv-eight.vercel.app/support">support</a> or reply to this email.</p>
  `
  return {
    subject: `ForgeCV ${plan.charAt(0).toUpperCase() + plan.slice(1)} — Payment Confirmed`,
    html: baseTemplate({ title: 'Payment Successful', previewText: `Your ${plan} subscription is now active.`, content }),
  }
}

// ── Payment Success (Lifetime Slot) ───────────────────────────
export function lifetimeSlotEmail({ name, slots, amount, currency }) {
  const symbol = currency?.toUpperCase() === 'USD' ? '$' : 'P'
  const formattedAmount = (amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })

  const content = `
    <h1>Lifetime Portfolio Slot Purchased</h1>
    <p>Hi ${name || 'there'},</p>
    <p>You have successfully purchased ${slots} lifetime portfolio slot${slots > 1 ? 's' : ''}. These slots never expire.</p>
    <div class="highlight">
      <div class="detail-row"><span class="detail-label">Slots</span><span class="detail-value">${slots}</span></div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${symbol}${formattedAmount}</span></div>
      <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">One-time purchase</span></div>
    </div>
    <a href="https://forgecv-eight.vercel.app/dashboard/portfolios" class="btn">Manage Portfolios</a>
  `
  return {
    subject: 'ForgeCV — Lifetime Portfolio Slot Confirmed',
    html: baseTemplate({ title: 'Lifetime Slot Purchased', previewText: `You purchased ${slots} lifetime portfolio slot${slots > 1 ? 's' : ''}.`, content }),
  }
}

// ── Renewal Reminder ──────────────────────────────────────────
export function renewalReminderEmail({ name, plan, daysLeft, periodEnd, amount, currency }) {
  const symbol = currency?.toUpperCase() === 'USD' ? '$' : 'P'
  const formattedAmount = amount ? (amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) : null
  const urgency = daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'soon' : 'upcoming'

  const content = `
    <h1>${daysLeft <= 1 ? 'Your subscription expires tomorrow' : `Your subscription expires in ${daysLeft} days`}</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Your ForgeCV ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan expires on <strong>${new Date(periodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
    ${formattedAmount ? `<p>To keep uninterrupted access, renew now for ${symbol}${formattedAmount}.</p>` : '<p>To keep uninterrupted access, renew now.</p>'}
    <div class="warning">
      <p>This is a manual renewal. Your subscription will not auto-renew. Renew before expiry to avoid losing Pro features.</p>
    </div>
    <a href="https://forgecv-eight.vercel.app/dashboard/billing" class="btn">Renew Now</a>
    <p style="font-size:13px;color:#94a3b8;">Need help? <a href="https://forgecv-eight.vercel.app/support">Contact support</a>.</p>
  `
  return {
    subject: daysLeft <= 1 ? 'URGENT: Your ForgeCV subscription expires tomorrow' : `Reminder: ForgeCV subscription expires in ${daysLeft} days`,
    html: baseTemplate({ title: 'Renewal Reminder', previewText: `Your ${plan} plan expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew to keep access.`, content }),
  }
}

// ── Subscription Expired ──────────────────────────────────────
export function subscriptionExpiredEmail({ name, plan }) {
  const content = `
    <h1>Your subscription has expired</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Your ForgeCV ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan has expired. You have been downgraded to the Free plan.</p>
    <div class="highlight">
      <p>Free plan: 1 resume and 1 resume template. Your existing work is safe.</p>
    </div>
    <p>Renew anytime to restore Pro features and unlimited access.</p>
    <a href="https://forgecv-eight.vercel.app/pricing" class="btn">View Plans & Renew</a>
  `
  return {
    subject: 'Your ForgeCV subscription has expired',
    html: baseTemplate({ title: 'Subscription Expired', previewText: 'Your Pro plan has expired. Renew to restore access.', content }),
  }
}

// ── AI Quota Reset ────────────────────────────────────────────
export function aiQuotaResetEmail({ name, plan, quota }) {
  const content = `
    <h1>Your AI generations have been refreshed</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Good news — your monthly AI generation quota has been reset. You now have <strong>${quota} new AI generations</strong> available.</p>
    <div class="highlight">
      <p>Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)} | Monthly quota: ${quota} generations</p>
    </div>
    <a href="https://forgecv-eight.vercel.app/dashboard" class="btn">Start Creating</a>
  `
  return {
    subject: 'ForgeCV — Your AI generations have been refreshed',
    html: baseTemplate({ title: 'AI Quota Reset', previewText: `Your ${quota} AI generations are ready for this month.`, content }),
  }
}

// ── Password Reset ────────────────────────────────────────────
export function passwordResetEmail({ name, resetUrl }) {
  const content = `
    <h1>Reset your password</h1>
    <p>Hi ${name || 'there'},</p>
    <p>We received a request to reset your ForgeCV password. Click the button below to set a new password.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="font-size:13px;color:#94a3b8;">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
  `
  return {
    subject: 'Reset your ForgeCV password',
    html: baseTemplate({ title: 'Password Reset', previewText: 'Click the link to reset your ForgeCV password.', content }),
  }
}