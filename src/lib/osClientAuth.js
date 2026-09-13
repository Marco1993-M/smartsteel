"use client"

import { supabase } from "./supabase"

async function getOsSession(forceRefresh = false) {
  if (forceRefresh) {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) return null
    return data.session
  }

  const { data } = await supabase.auth.getSession()
  let session = data.session

  // Background tabs can pause Supabase's refresh timer. Refresh proactively
  // when the saved token is close to expiry instead of forcing a new login.
  if (session?.expires_at && session.expires_at * 1000 <= Date.now() + 60_000) {
    const refreshed = await supabase.auth.refreshSession()
    if (!refreshed.error) session = refreshed.data.session
  }

  return session
}

export async function getOsAuthHeaders(headers = {}, options = {}) {
  const session = await getOsSession(Boolean(options.forceRefresh))

  if (!session?.access_token) {
    throw new Error("Please sign in to continue.")
  }

  return {
    ...headers,
    Authorization: `Bearer ${session.access_token}`,
  }
}

export async function refreshOsAuthHeaders(headers = {}) {
  return getOsAuthHeaders(headers, { forceRefresh: true })
}
