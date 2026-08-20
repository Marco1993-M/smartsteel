"use client"

import { partnerSupabase } from "./partnerSupabase"

export async function getPartnerAuthHeaders(headers = {}) {
  const {
    data: { session },
  } = await partnerSupabase.auth.getSession()

  if (!session?.access_token) throw new Error("Please sign in to continue.")

  return { ...headers, Authorization: `Bearer ${session.access_token}` }
}
