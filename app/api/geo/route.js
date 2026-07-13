import { NextResponse } from 'next/server'

// Vercel automatically populates x-vercel-ip-country on every request once
// deployed, based on the visitor's real IP address - no guessing needed.
// This header is NOT present on localhost/local dev, so callers should
// treat a null country as "unknown, fall back to another method."
export async function GET(request) {
  const country = request.headers.get('x-vercel-ip-country') || null
  return NextResponse.json({ country })
}
