import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing environment variables for Supabase")
}

// Keep partner authentication separate from the internal Smart Steel OS session.
export const partnerSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "smartsteel-partner-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
