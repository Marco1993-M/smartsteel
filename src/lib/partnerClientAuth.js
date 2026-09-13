"use client"

import { partnerSupabase } from "./partnerSupabase"

export async function getPartnerAuthHeaders(headers = {}) {
  const { data } = await partnerSupabase.auth.getSession()
  let session = data.session

  if (session?.expires_at && session.expires_at * 1000 <= Date.now() + 60_000) {
    const refreshed = await partnerSupabase.auth.refreshSession()
    if (!refreshed.error) session = refreshed.data.session
  }

  if (!session?.access_token) throw new Error("Please sign in to continue.")

  return { ...headers, Authorization: `Bearer ${session.access_token}` }
}
