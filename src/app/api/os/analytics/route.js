import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

const ALLOWED_PERIODS = new Set([30, 90, 365])
const ACTIVE_ESTIMATE_STATUSES = new Set(["sent", "accepted", "declined", "superseded"])

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
  if (previous === 0) return current > 0 ? 100 : 0
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

function buildTrend(leads, estimates, start, end, days) {
  const bucketDays = days <= 30 ? 7 : days <= 90 ? 14 : 30
  const buckets = []

  for (let cursor = new Date(start); cursor < end; cursor.setDate(cursor.getDate() + bucketDays)) {
    const bucketStart = new Date(cursor)
    const bucketEnd = new Date(Math.min(end.getTime(), new Date(cursor).setDate(cursor.getDate() + bucketDays)))
    const cohort = leads.filter((lead) => within(lead.created_at, bucketStart, bucketEnd))
    buckets.push({
      key: bucketStart.toISOString(),
      label: bucketStart.toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
      leads: cohort.length,
      won: cohort.filter((lead) => String(lead.status || "").toLowerCase() === "won").length,
      estimatesSent: estimates.filter((estimate) => within(estimate.sent_at, bucketStart, bucketEnd)).length,
    })
  }

  return buckets
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

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const requestedDays = Number(new URL(request.url).searchParams.get("days"))
  const days = ALLOWED_PERIODS.has(requestedDays) ? requestedDays : 30
  const end = new Date()
  const start = atStartOfDay(new Date(end.getTime() - days * 24 * 60 * 60 * 1000))
  const previousStart = atStartOfDay(new Date(start.getTime() - days * 24 * 60 * 60 * 1000))

  const [leadsResult, estimatesResult] = await Promise.all([
    fetchAll(() =>
      supabaseServer
        .from("leads")
        .select("id, created_at, updated_at, status, lead_source, product_type, quote_value, follow_up_at")
        .gte("created_at", previousStart.toISOString())
        .order("created_at", { ascending: true })
    ),
    fetchAll(() =>
      supabaseServer
        .from("estimates")
        .select("id, lead_id, created_at, prepared_at, sent_at, status, total")
        .order("created_at", { ascending: true })
    ),
  ])

  if (leadsResult.error) {
    return NextResponse.json({ error: "CRM analytics could not be loaded right now." }, { status: 500 })
  }

  const warnings = []
  if (estimatesResult.error) warnings.push("Estimate activity is temporarily unavailable; lead metrics remain live.")

  const leads = leadsResult.data || []
  const estimates = estimatesResult.error ? [] : estimatesResult.data || []
  const current = buildPeriodSummary(leads, estimates, start, end)
  const previous = buildPeriodSummary(leads, estimates, previousStart, start)
  const currentLeads = leads.filter((lead) => within(lead.created_at, start, end))
  const today = atStartOfDay(new Date())
  const activeLeads = leads.filter((lead) => !["won", "lost"].includes(String(lead.status || "").toLowerCase()))

  return NextResponse.json({
    period: {
      days,
      start: start.toISOString(),
      end: end.toISOString(),
      label: days === 365 ? "Last 12 months" : `Last ${days} days`,
    },
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
    trend: buildTrend(leads, estimates, start, end, days),
    sources: groupBy(currentLeads, (lead) => normalize(lead.lead_source)).slice(0, 6),
    products: groupBy(currentLeads, (lead) => normalize(lead.product_type)).slice(0, 6),
    attention: {
      overdueFollowUps: activeLeads.filter((lead) => lead.follow_up_at && new Date(lead.follow_up_at) < today).length,
      missingSource: currentLeads.filter((lead) => !normalize(lead.lead_source, "")).length,
      missingProduct: currentLeads.filter((lead) => !normalize(lead.product_type, "")).length,
    },
    warnings,
  })
}
