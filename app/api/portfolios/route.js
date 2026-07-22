import { createClient } from '@supabase/supabase-js'
import { getUserEntitlements } from '@/lib/entitlements'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // 1. Verify auth
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }

    // 2. Get request body
    const body = await request.json()
    const { templateId, templateName } = body

    if (!templateId) {
      return Response.json({ error: 'Template ID required' }, { status: 400 })
    }

    // 3. Check slot limits server-side
    const entitlements = await getUserEntitlements(user.id)

    const { count, error: countError } = await supabaseAdmin
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      return Response.json({ error: 'Failed to check portfolio limit' }, { status: 500 })
    }

    if (count >= entitlements.totalPublishSlots) {
      return Response.json(
        { error: 'Portfolio limit reached', limit: entitlements.totalPublishSlots },
        { status: 403 }
      )
    }

    // 4. Create portfolio
    const { data, error: insertError } = await supabaseAdmin
      .from('portfolios')
      .insert({
        user_id: user.id,
        title: templateName ? `My ${templateName} Portfolio` : 'My Portfolio',
        content: {},
        template: templateId,
      })
      .select()
      .single()

    if (insertError) {
      return Response.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    return Response.json({ portfolio: data }, { status: 201 })
  } catch (err) {
    console.error('Portfolio creation API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}