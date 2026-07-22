import { NextResponse } from 'next/server'

export async function GET(request) {
  const cfCountry = request.headers.get('cf-ipcountry')
  const vercelCountry = request.headers.get('x-vercel-ip-country')
  const country = cfCountry || vercelCountry || null
  return NextResponse.json({ country })
}