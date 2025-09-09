// src/lib/supabase-browser.js
import { createClient } from '@supabase/supabase-js'

// Client-side environment variables (NEXT_PUBLIC_*)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
