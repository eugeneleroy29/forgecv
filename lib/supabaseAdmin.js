import { createClient } from '@supabase/supabase-js'

// SERVER-ONLY. Uses the service_role key which bypasses RLS entirely.
// Never import this file into any 'use client' component — it must only
// ever be used inside API routes / webhook handlers.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)