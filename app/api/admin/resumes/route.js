import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request) {
  try {
    // Verify admin via Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin flag
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch resumes with user info using service role (bypasses RLS)
    const { data: resumes, error: resumesError } = await supabaseAdmin
      .from('resumes')
      .select('id, title, template, is_active, created_at, updated_at, user_id')
      .order('created_at', { ascending: false })

    if (resumesError) throw resumesError

    // Fetch profiles for mapping
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name')

    if (profilesError) throw profilesError

    const profileMap = {}
    profiles?.forEach(p => {
      profileMap[p.id] = p
    })

    const merged = (resumes || []).map(r => ({
      ...r,
      profiles: profileMap[r.user_id] || null
    }))

    return NextResponse.json({ resumes: merged })
  } catch (e) {
    console.error('Admin resumes API error:', e)
    console.error('Error details:', e.message, e.stack)
    return NextResponse.json({ error: 'Internal server error', details: e.message }, { status: 500 })
  }
}