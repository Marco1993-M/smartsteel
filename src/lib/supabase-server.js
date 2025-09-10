import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE env vars for server client")
}

// Export with the same name as client
export const supabase = createClient(supabaseUrl, supabaseServiceKey)
