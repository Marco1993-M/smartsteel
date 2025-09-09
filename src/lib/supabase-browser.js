import { createClient } from '@supabase/supabase-js'

// This one is for React components (runs in the browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
