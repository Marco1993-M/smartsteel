import { createClient } from '@supabase/supabase-js'

// Use NEXT_PUBLIC_ vars for client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing environment variables for Supabase")
}

// The internal OS must never share browser auth state with a partner portal.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "smartsteel-os-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
