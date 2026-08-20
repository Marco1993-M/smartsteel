"use client"

import { supabase } from "./supabase"

export async function getPartnerAuthHeaders(headers = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) throw new Error("Please sign in to continue.")

  return { ...headers, Authorization: `Bearer ${session.access_token}` }
}
