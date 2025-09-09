// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Server-only environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
}

// Export Supabase client for API routes / server components
export const supabase = createClient(supabaseUrl, supabaseKey)
