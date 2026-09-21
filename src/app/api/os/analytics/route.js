import { buildAnalyticsPeriod, shiftMonth, monthLabel, monthStart } from "lib/analyticsPeriods.mjs"
import { buildAnalyticsInsights } from "lib/analyticsInsights.mjs"
import { buildDeclineSummary } from "lib/estimateDeclineReasons.mjs"
import { NextResponse } from "next/server"
import { buildCommercialEfficiency } from "lib/commercialEfficiency.mjs"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

const ACTIVE_ESTIMATE_STATUSES = new Set(["sent", "accepted", "declined", "superseded"])
const MARKETING_SOURCES = ["search_console", "google_ads"]

function parseNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function normalize(value, fallback = "Not captured") {
  return String(value || "").trim() || fallback
}

function percentage(part, total) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0
}

function change(current, previous) {
  if (previous === 0) return current > 0 ? null : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function atStartOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function within(value, start, end) {
  if (!value) return false
  const date = new Date(value)
  return Number.isFinite(date.getTime()) && date >= start && date < end
}

async function fetchAll(buildQuery) {
  const pageSize = 1000
  const records = []

  for (let from = 0; ; from += pageSize) {
    const result = await buildQuery().range(from, from + pageSize - 1)
    if (result.error) return result
    records.push(...(result.data || []))
    if ((result.data || []).length < pageSize) return { data: records, error: null }
  }
}

function getEstimateActivityDate(estimate, type) {
  if (type === "sent") return estimate.sent_at
  return estimate.prepared_at || estimate.created_at
}

function isSentEstimate(estimate) {
  return Boolean(estimate.sent_at) || ACTIVE_ESTIMATE_STATUSES.has(String(estimate.status || "").toLowerCase())
}

function buildPeriodSummary(leads, estimates, start, end) {
  const cohort = leads.filter((lead) => within(lead.created_at, start, end))
  const cohortIds = new Set(cohort.map((lead) => String(lead.id)))
  const cohortSentLeadIds = new Set(
    estimates
      .filter((estimate) => cohortIds.has(String(estimate.lead_id)) && isSentEstimate(estimate))
      .map((estimate) => String(estimate.lead_id))
  )
  const qualified = cohort.filter((lead) => !["", "new"].includes(String(lead.status || "").toLowerCase()))
  const won = cohort.filter((lead) => String(lead.status || "").toLowerCase() === "won")
  const preparedActivity = estimates.filter((estimate) => within(getEstimateActivityDate(estimate, "prepared"), start, end))
  const sentActivity = estimates.filter((estimate) => within(getEstimateActivityDate(estimate, "sent"), start, end))

  return {
    leadCount: cohort.length,
    qualifiedCount: qualified.length,
    quotedLeadCount: cohortSentLeadIds.size,
    wonCount: won.length,
    preparedCount: preparedActivity.length,
    sentCount: sentActivity.length,
    pipelineValue: cohort
      .filter((lead) => ["contacted", "quoted"].includes(String(lead.status || "").toLowerCase()))
      .reduce((sum, lead) => sum + parseNumber(lead.quote_value), 0),
    quotedValue: cohort
      .filter((lead) => cohortSentLeadIds.has(String(lead.id)))
      .reduce((sum, lead) => sum + parseNumber(lead.quote_value), 0),
    wonValue: won.reduce((sum, lead) => sum + parseNumber(lead.quote_value), 0),
    qualificationRate: percentage(qualified.length, cohort.length),
    quoteRate: percentage(cohortSentLeadIds.size, cohort.length),
    winRate: percentage(won.length, cohort.length),
  }
}

function buildTrend(leads, estimates, selectedMonth, now) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = shiftMonth(selectedMonth, index - 11)
    const start = monthStart(month)
    const end = new Date(Math.min(monthStart(shiftMonth(month, 1)).getTime(), now.getTime()))
    const cohort = leads.filter((lead) => within(lead.created_at, start, end))
    return {
      key: month,
      label: new Intl.DateTimeFormat("en-ZA", { month: "short", year: "2-digit", timeZone: "Africa/Johannesburg" }).format(start),
      fullLabel: monthLabel(month),
      partial: end < monthStart(shiftMonth(month, 1)),
      leads: cohort.length,
      won: cohort.filter((lead) => String(lead.status || "").toLowerCase() === "won").length,
      estimatesSent: estimates.filter((estimate) => within(estimate.sent_at, start, end)).length,
    }
  })
}

function groupBy(records, getKey, getValue = () => 1) {
  const grouped = new Map()
  records.forEach((record) => {
    const key = getKey(record)
    grouped.set(key, (grouped.get(key) || 0) + getValue(record))
  })
  return [...grouped.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

function analyticsSchemaMissing(error) {
  return error?.code === "42P01" || error?.code === "PGRST205"
}

function sumMetrics(records) {
  const totals = records.reduce((result, record) => ({
    impressions: result.impressions + parseNumber(record.impressions),
    clicks: result.clicks + parseNumber(record.clicks),
    cost: result.cost + parseNumber(record.cost),
    conversions: result.conversions + parseNumber(record.conversions),
    conversionValue: result.conversionValue + parseNumber(record.conversion_value),
    weightedPosition: result.weightedPosition + (parseNumber(record.average_position) * parseNumber(record.impressions)),
    positionWeight: result.positionWeight + (record.average_position === null ? 0 : parseNumber(record.impressions)),
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversionValue: 0, weightedPosition: 0, positionWeight: 0 })

  return {
    impressions: totals.impressions,
    clicks: totals.clicks,
    cost: Math.round(totals.cost * 100) / 100,
    conversions: Math.round(totals.conversions * 100) / 100,
    conversionValue: Math.round(totals.conversionValue * 100) / 100,
    ctr: percentage(totals.clicks, totals.impressions),
    averagePosition: totals.positionWeight > 0 ? Math.round((totals.weightedPosition / totals.positionWeight) * 10) / 10 : null,
    averageCpc: totals.clicks > 0 ? Math.round((totals.cost / totals.clicks) * 100) / 100 : 0,
    costPerConversion: totals.conversions > 0 ? Math.round((totals.cost / totals.conversions) * 100) / 100 : 0,
    roas: totals.cost > 0 ? Math.round((totals.conversionValue / totals.cost) * 100) / 100 : 0,
  }
}

function buildMarketingSummary(records, start, end, previousStart, previousEnd) {
  const bySource = Object.fromEntries(MARKETING_SOURCES.map((source) => {
    const sourceRecords = records.filter((record) => record.source === source)
    const current = sumMetrics(sourceRecords.filter((record) => within(`${record.metric_date}T00:00:00+02:00`, start, end)))
    const previous = sumMetrics(sourceRecords.filter((record) => within(`${record.metric_date}T00:00:00+02:00`, previousStart, previousEnd)))
    return [source, {
      ...current,
      changes: {
        impressions: change(current.impressions, previous.impressions),
        clicks: change(current.clicks, previous.clicks),
        cost: change(current.cost, previous.cost),
        conversions: change(current.conversions, previous.conversions),
      },
    }]
  }))

  return bySource
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const now = new Date()
  let period
  try { period = buildAnalyticsPeriod(new URL(request.url).searchParams.get("month"), now) }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) }
  const start = new Date(period.start)
  const end = new Date(period.end)
  const previousStart = new Date(period.previousStart)
  const previousEnd = new Date(period.previousEnd)

  const [leadsResult, estimatesResult, connectionsResult, marketingResult, responsesResult, emailsResult] = await Promise.all([
    fetchAll(() =>
      supabaseServer
        .from("leads")
        .select("id, name, last_name, next_action, created_at, updated_at, status, lead_source, product_type, quote_value, follow_up_at")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
    ),
    fetchAll(() =>
      supabaseServer
        .from("estimates")
        .select("id, lead_id, created_at, prepared_at, sent_at, status, total")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
    ),
    supabaseServer
      .from("os_analytics_connections")
      .select("source, status, account_label, external_account_id, last_synced_at, last_error"),
    fetchAll(() =>
      supabaseServer
        .from("os_analytics_daily_metrics")
        .select("metric_date, source, impressions, clicks, cost, conversions, conversion_value, average_position")
        .eq("dimension_key", "summary")
        .gte("metric_date", `${shiftMonth(period.month, -1)}-01`)
        .order("metric_date", { ascending: true })
    ),
    fetchAll(() =>
      supabaseServer
        .from("crm_estimate_follow_up_responses")
        .select("id, sequence_id, estimate_id, response_key, decline_reason, created_at")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
    ),
    fetchAll(() => supabaseServer.from("crm_email_events")
      .select("id, estimate_id, sent_at")
      .eq("email_type", "follow_up")
      .gte("sent_at", start.toISOString())
      .lt("sent_at", end.toISOString())
      .order("sent_at", { ascending: true }).order("id", { ascending: true })),
  ])

  if (leadsResult.error) {
    return NextResponse.json({ error: "CRM analytics could not be loaded right now." }, { status: 500 })
  }

  const warnings = []
  if (estimatesResult.error) warnings.push("Estimate activity is temporarily unavailable; lead metrics remain live.")
  const analyticsSchemaReady = !connectionsResult.error && !marketingResult.error
  if (connectionsResult.error && !analyticsSchemaMissing(connectionsResult.error)) warnings.push("Marketing connection status is temporarily unavailable.")
  if (marketingResult.error && !analyticsSchemaMissing(marketingResult.error)) warnings.push("Marketing performance is temporarily unavailable.")

  const leads = leadsResult.data || []
  const estimates = estimatesResult.error ? [] : estimatesResult.data || []
  const current = buildPeriodSummary(leads, estimates, start, end)
  const previous = buildPeriodSummary(leads, estimates, previousStart, previousEnd)
  const currentLeads = leads.filter((lead) => within(lead.created_at, start, end))
  const today = atStartOfDay(new Date())
  const activeLeads = leads.filter((lead) => !["won", "lost"].includes(String(lead.status || "").toLowerCase()))
  const connectionRows = connectionsResult.error ? [] : connectionsResult.data || []
  const connectionMap = Object.fromEntries(connectionRows.map((connection) => [connection.source, connection]))
  const marketing = buildMarketingSummary(marketingResult.error ? [] : marketingResult.data || [], start, end, previousStart, previousEnd)
  const commercialEfficiency = buildCommercialEfficiency(currentLeads, marketingResult.error ? null : marketing.google_ads.cost)

  return NextResponse.json({
    period,
    metrics: {
      ...current,
      changes: {
        leads: change(current.leadCount, previous.leadCount),
        sent: change(current.sentCount, previous.sentCount),
        won: change(current.wonCount, previous.wonCount),
        wonValue: change(current.wonValue, previous.wonValue),
      },
    },
    funnel: [
      { key: "leads", label: "New leads", value: current.leadCount, rate: 100 },
      { key: "qualified", label: "Qualified", value: current.qualifiedCount, rate: current.qualificationRate },
      { key: "quoted", label: "Estimate sent", value: current.quotedLeadCount, rate: current.quoteRate },
      { key: "won", label: "Won", value: current.wonCount, rate: current.winRate },
    ],
    trend: buildTrend(leads, estimates, period.month, now),
    sources: groupBy(currentLeads, (lead) => normalize(lead.lead_source)).slice(0, 6),
    products: groupBy(currentLeads, (lead) => normalize(lead.product_type)).slice(0, 6),
    attention: {
      overdueFollowUps: activeLeads.filter((lead) => lead.follow_up_at && new Date(lead.follow_up_at) < today).length,
      missingSource: currentLeads.filter((lead) => !normalize(lead.lead_source, "")).length,
      missingProduct: currentLeads.filter((lead) => !normalize(lead.product_type, "")).length,
    },
    marketing: {
      schemaReady: analyticsSchemaReady,
      connections: MARKETING_SOURCES.map((source) => ({
        source,
        status: connectionMap[source]?.status || "not_connected",
        accountLabel: connectionMap[source]?.account_label || null,
        externalAccountId: connectionMap[source]?.external_account_id || null,
        lastSyncedAt: connectionMap[source]?.last_synced_at || null,
        lastError: connectionMap[source]?.last_error || null,
      })),
      searchConsole: marketing.search_console,
      googleAds: marketing.google_ads,
    },
    declineFeedback: responsesResult.error
      ? { available: false, total: 0, withReason: 0, reasons: [] }
      : { available: true, ...buildDeclineSummary(responsesResult.data || []) },
    insights: buildAnalyticsInsights({
      leads, estimates, responses: responsesResult.data || [], emails: emailsResult.data || [],
      start: start.toISOString(), end: end.toISOString(), now: now.toISOString(),
      estimatesAvailable: !estimatesResult.error, responsesAvailable: !responsesResult.error, emailsAvailable: !emailsResult.error,
    }),
    commercialEfficiency,
    warnings,
  })
}
