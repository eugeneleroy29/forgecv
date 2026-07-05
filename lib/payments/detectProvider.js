/**
 * Best-effort detection of whether a visitor is likely in the Philippines,
 * to decide which payment provider to route them to automatically.
 * Not perfect (VPNs, browser locale overrides can fool it) — revisit if
 * mis-routing becomes a real support issue.
 */
export function detectPaymentProvider() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const locale = navigator.language || ''

    if (timeZone === 'Asia/Manila' || locale.toLowerCase().includes('ph')) {
      return 'paymongo'
    }
  } catch (err) {
    console.error('Provider detection failed, defaulting to stripe:', err)
  }

  return 'stripe'
}