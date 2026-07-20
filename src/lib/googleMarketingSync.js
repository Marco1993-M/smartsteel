import { supabaseServer } from "./supabase-server"

const SYNC_DAYS = 90

function dateOnly(date) {
  return date.toISOString().slice(0, 10)
}

function getSyncRange(delayDays = 0) {
  const end = new Date()
  end.setUTCDate(end.getUTCDate() - delayDays)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - (SYNC_DAYS - 1))
  return { startDate: dateOnly(start), endDate: dateOnly(end) }
}

function requireEnvironment(names) {
  const missing = names.filter((name) => !String(process.env[name] || "").trim())
  if (missing.length) throw new Error(`Missing server configuration: ${missing.join(", ")}.`)
}

async function getGoogleAccessToken() {
  requireEnvironment(["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REFRESH_TOKEN"])
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })
  const payload = await response.json()
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || "Google authorisation could not be refreshed.")
  return payload.access_token
}

async function setConnection(source, patch) {
  const { error } = await supabaseServer
    .from("os_analytics_connections")
    .upsert({ source, ...patch }, { onConflict: "source" })
  if (error) throw error
}

async function upsertDailyMetrics(records) {
  if (!records.length) return
  const { error } = await supabaseServer
    .from("os_analytics_daily_metrics")
    .upsert(records, { onConflict: "source,metric_date,dimension_key" })
  if (error) throw error
}

async function runWithConnectionState(source, accountLabel, externalAccountId, sync) {
  await setConnection(source, {
    status: "syncing",
    account_label: accountLabel,
    external_account_id: externalAccountId,
    last_error: null,
  })
  try {
    const result = await sync()
    await setConnection(source, {
      status: "connected",
      account_label: accountLabel,
      external_account_id: externalAccountId,
      last_synced_at: new Date().toISOString(),
      last_error: null,
      metadata: result.metadata || {},
    })
    return result
  } catch (error) {
    await setConnection(source, {
      status: "error",
      account_label: accountLabel,
      external_account_id: externalAccountId,
      last_error: error.message || "Sync failed.",
    }).catch(() => {})
    throw error
  }
}

export async function syncSearchConsole() {
  requireEnvironment(["SEARCH_CONSOLE_SITE_URL"])
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL.trim()
  return runWithConnectionState("search_console", "Smart Steel Search Console", siteUrl, async () => {
    const accessToken = await getGoogleAccessToken()
    const { startDate, endDate } = getSyncRange(2)
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate, endDate, dimensions: ["date"], rowLimit: 25000, dataState: "final" }),
        cache: "no-store",
      }
    )
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error?.message || "Search Console data could not be loaded.")

    const rows = (payload.rows || []).map((row) => ({
      source: "search_console",
      metric_date: row.keys?.[0],
      dimension_key: "summary",
      dimensions: {},
      impressions: Math.round(Number(row.impressions || 0)),
      clicks: Math.round(Number(row.clicks || 0)),
      cost: 0,
      conversions: 0,
      conversion_value: 0,
      average_position: Number(row.position || 0),
    })).filter((row) => row.metric_date)

    await upsertDailyMetrics(rows)
    return { imported: rows.length, startDate, endDate, metadata: { siteUrl } }
  })
}

export async function syncGoogleAds() {
  requireEnvironment(["GOOGLE_ADS_CUSTOMER_ID", "GOOGLE_ADS_DEVELOPER_TOKEN"])
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, "").trim()
  const loginCustomerId = String(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "").replace(/-/g, "").trim()
  return runWithConnectionState("google_ads", "Smart Steel Google Ads", customerId, async () => {
    const accessToken = await getGoogleAccessToken()
    const { startDate, endDate } = getSyncRange(0)
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      "Content-Type": "application/json",
    }
    if (loginCustomerId) headers["login-customer-id"] = loginCustomerId

    const query = `
      SELECT
        segments.date,
        customer.currency_code,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM customer
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      ORDER BY segments.date
    `
    const response = await fetch(`https://googleads.googleapis.com/v24/customers/${customerId}/googleAds:searchStream`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
      cache: "no-store",
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error?.message || "Google Ads data could not be loaded.")

    const results = (Array.isArray(payload) ? payload : []).flatMap((batch) => batch.results || [])
    const rows = results.map((result) => ({
      source: "google_ads",
      metric_date: result.segments?.date,
      dimension_key: "summary",
      dimensions: { currency: result.customer?.currencyCode || "ZAR" },
      impressions: Number(result.metrics?.impressions || 0),
      clicks: Number(result.metrics?.clicks || 0),
      cost: Number(result.metrics?.costMicros || 0) / 1000000,
      conversions: Number(result.metrics?.conversions || 0),
      conversion_value: Number(result.metrics?.conversionsValue || 0),
      average_position: null,
    })).filter((row) => row.metric_date)

    await upsertDailyMetrics(rows)
    return {
      imported: rows.length,
      startDate,
      endDate,
      metadata: { customerId, loginCustomerId: loginCustomerId || null, currency: rows[0]?.dimensions?.currency || "ZAR" },
    }
  })
}
