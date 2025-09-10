import { createClient } from '@supabase/supabase-js'

// Use NEXT_PUBLIC_ vars for client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing environment variables for Supabase")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
