import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: portfolios, error: portfoliosError } = await supabaseAdmin
      .from('portfolios')
      .select('id, slug, template, is_published, created_at, updated_at, user_id')
      .order('created_at', { ascending: false })

    if (portfoliosError) throw portfoliosError

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name')

    if (profilesError) throw profilesError

    const profileMap = {}
    profiles?.forEach(p => {
      profileMap[p.id] = p
    })

    const merged = (portfolios || []).map(p => ({
      ...p,
      profiles: profileMap[p.user_id] || null
    }))

    return NextResponse.json({ portfolios: merged })
  } catch (e) {
    console.error('Admin portfolios API error:', e)
    console.error('Error details:', e.message, e.stack)
    return NextResponse.json({ error: 'Internal server error', details: e.message }, { status: 500 })
  }
}