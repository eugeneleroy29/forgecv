/**
 * Best-effort detection of whether a visitor is likely in the Philippines,
 * to decide which payment provider to route them to automatically.
 * Not perfect (VPNs, browser locale overrides can fool it) — revisit if
 * mis-routing becomes a real support issue.
 */
export function detectPaymentProvider() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const locale = (navigator.language || '').toLowerCase()
    if (timeZone === 'Asia/Manila') return 'paymongo'
    if (locale.includes('ph') || locale.includes('fil') || locale.includes('tl')) return 'paymongo'
  } catch (err) {
    console.error('Provider detection failed, defaulting to stripe:', err)
  }
  return 'stripe'
}

/**
 * Preferred detection method: asks our own /api/geo route, which reads
 * Vercel's IP-based x-vercel-ip-country header (reliable, no timezone/locale
 * guessing). This header only exists once actually deployed on Vercel — on
 * localhost or any non-Vercel host it comes back null, in which case we
 * fall back to the older timezone/locale guess above so local dev still
 * behaves sensibly.
 */
export async function detectPaymentProviderAsync() {
  try {
    const res = await fetch('/api/geo')
    if (!res.ok) return detectPaymentProvider()
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return detectPaymentProvider()
    const { country } = await res.json()
    if (country) {
      return country === 'PH' ? 'paymongo' : 'stripe'
    }
  } catch (err) {
    console.error('Geo-based provider detection failed, falling back:', err)
  }
  return detectPaymentProvider()
}