import { analyticsAxisMaximum } from "./analyticsActivity.mjs"
import { analyticsDateKey, buildAnalyticsPeriod, currentAnalyticsMonth, monthStart, shiftMonth } from "./analyticsPeriods.mjs"

const sum = (values) => values.reduce((total, value) => total + value, 0)
const ratio = (a, b) => b > 0 ? a / b : null
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length ? (sorted[middle] + sorted.at(-middle - 1)) / 2 : null
}

function supplyValue(snapshot) {
  const lines = snapshot?.line_items
  if (!Array.isArray(lines) || !lines.length || snapshot.total == null || !Number.isFinite(Number(snapshot.total))) return null
  const amounts = lines.map((item) => item?.total == null ? NaN : Number(item.total))
  if (!amounts.every(Number.isFinite) || sum(amounts) <= 0) return null
  const service = /\b(?:install(?:ation|ing)?|erection|deliver(?:y|ies)|transport(?:ation)?|freight|civil works?)\b/i
  const foundations = /\b(?:footings?|foundations?)\b/i
  const hardware = /\b(?:anchors?|bolts?|brackets?|fixings?)\b/i
  const supply = sum(lines.map((line, index) => {
    const description = `${String(line.code || "").replaceAll("_", "-")} ${line.label || line.description || ""}`
    const excluded = service.test(description) || foundations.test(description) && !hardware.test(description)
    return excluded ? 0 : amounts[index]
  }))
  return supply >= 0 && supply <= sum(amounts) ? Number(snapshot.total) * supply / sum(amounts) : null
}

export function summarizeOutlookActivity({ year, leads, estimates, orders, wonLeads, now = new Date() }) {
  const current = currentAnalyticsMonth(now)
  const reportYear = Math.min(year - 1, Number(current.slice(0, 4)))
  const start = monthStart(`${reportYear}-01`).toISOString()
  const end = monthStart(`${reportYear + 1}-01`).toISOString()
  const asOf = now.toISOString()
  const firstQuotes = new Map()
  for (const estimate of estimates || []) {
    const sent = new Date(estimate.sent_at).toISOString()
    if (sent < (firstQuotes.get(estimate.lead_id) || asOf)) firstQuotes.set(estimate.lead_id, sent)
  }
  const leadEvents = (leads || []).map((lead) => ({ ...lead, created: new Date(lead.created_at).toISOString() }))
  const firstLeadMonth = leadEvents.filter((lead) => lead.created >= start && lead.created < end)
    .reduce((earliest, lead) => earliest == null || lead.created < earliest.created ? lead : earliest, null)
  const coverageStart = firstLeadMonth ? currentAnalyticsMonth(new Date(firstLeadMonth.created)) : null
  const accepted = (orders || []).filter((order) => order.status !== "cancelled" && order.accepted_at)
    .map((order) => ({ ...order, accepted: new Date(order.accepted_at).toISOString(), value: supplyValue(order.quote_snapshot) }))
    .filter((order) => order.accepted < asOf)
  const historicalOrders = accepted.filter((order) => order.accepted >= start && order.accepted < end)
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = shiftMonth(`${reportYear}-01`, index)
    if (month > current) return { month }
    const period = buildAnalyticsPeriod(month, now)
    const within = (date) => date >= period.start && date < period.end
    const monthOrders = historicalOrders.filter((order) => within(order.accepted))
    const leadCount = leads != null && coverageStart && month >= coverageStart ? leadEvents.filter((lead) => within(lead.created)).length : null
    return {
      month, partial: period.isCurrent, leads: leadCount,
      quotes: estimates != null && coverageStart && month >= coverageStart ? [...firstQuotes.values()].filter(within).length : null,
      wins: orders != null ? monthOrders.length : null,
      supply: orders != null && monthOrders.every((order) => order.value != null) ? sum(monthOrders.map((order) => order.value)) : null,
      comparisonLeads: period.isCurrent && leadCount != null && shiftMonth(month, -1) >= coverageStart
        ? leadEvents.filter((lead) => lead.created >= period.previousStart && lead.created < period.previousEnd).length : null,
    }
  })
  // Use fully observed 90-day cohorts and order-linked wins, with one conversion per lead.
  const maturity = 90 * 86400000
  const cutoff = new Date(Math.min(+now, +monthStart(`${year}-01`)))
  const winsByLead = new Map()
  for (const order of accepted) {
    const dates = winsByLead.get(order.lead_id) || []
    dates.push(order.accepted)
    winsByLead.set(order.lead_id, dates)
  }
  const cohort = leadEvents.filter((lead) => lead.created >= start && lead.created < end && Date.parse(lead.created) + maturity <= +cutoff)
  let quoted = 0
  const winHorizons = [30, 60, 90]
  const winCounts = [0, 0, 0]
  for (const lead of cohort) {
    const quote = firstQuotes.get(lead.id)
    const deadline = new Date(Date.parse(lead.created) + maturity).toISOString()
    if (!quote || quote < lead.created || quote > deadline) continue
    quoted++
    const firstWin = winsByLead.get(lead.id)?.filter((win) => win >= quote && win <= deadline).sort()[0]
    if (firstWin) {
      const days = (Date.parse(firstWin) - Date.parse(lead.created)) / 86400000
      winHorizons.forEach((horizon, index) => { if (days <= horizon) winCounts[index]++ })
    }
  }
  const quoteHours = leadEvents.filter((lead) => lead.created >= start && lead.created < end)
    .map((lead) => firstQuotes.has(lead.id) ? (Date.parse(firstQuotes.get(lead.id)) - Date.parse(lead.created)) / 3600000 : null)
    .filter((hours) => hours != null && hours >= 0)
  const pricedOrders = historicalOrders.map((order) => order.value).filter((value) => value > 0)
  return {
    year: reportYear, asOf, months, cohort: cohort.length, quoted, wonAfterQuote: winCounts[2],
    winTiming: winHorizons.map((days, index) => ({ days, rate: orders != null && estimates != null ? ratio(winCounts[index], cohort.length) : null })),
    medianQuoteHours: median(quoteHours),
    leadToQuote: estimates != null ? ratio(quoted, cohort.length) : null,
    quoteToWin: orders != null && estimates != null ? ratio(winCounts[2], quoted) : null,
    medianSupply: median(pricedOrders),
    meanSupply: ratio(sum(pricedOrders), pricedOrders.length),
    meanSupplyWithoutLargest: pricedOrders.length > 1 ? (sum(pricedOrders) - Math.max(...pricedOrders)) / (pricedOrders.length - 1) : null,
    unclassifiedOrders: historicalOrders.filter((order) => order.value == null).length,
    supplyOrders: pricedOrders.length,
    ordersAvailable: orders != null,
    wonColumnTotal: wonLeads == null ? null : sum(wonLeads.map((lead) => {
      const value = Number(String(lead.quote_value ?? "").replace(/[^0-9.-]/g, ""))
      return Number.isFinite(value) ? value : 0
    })),
  }
}

const quarterlyLeadGrowth = 0.05
const conversionLift = 0.05
const orderValueLift = 0.10

function projectSalesDrivers(completed, monthlyLeads, activity, ticket) {
  const recentSix = completed.slice(-6)
  const priorQuarter = recentSix.length === 6 && recentSix.every((month) => month.leads != null)
    ? sum(recentSix.slice(0, 3).map((month) => month.leads)) : null
  const observedGrowth = priorQuarter > 0 && monthlyLeads != null ? monthlyLeads * 3 / priorQuarter - 1 : null
  const quarters = Array.from({ length: 4 }, (_, index) => monthlyLeads == null ? null : monthlyLeads * (1 + quarterlyLeadGrowth) ** index)
  const annualLeads = monthlyLeads == null ? null : monthlyLeads * 12
  const leadToQuote = activity?.leadToQuote
  const quoteToWin = activity?.quoteToWin
  const increasedRate = (rate) => rate == null ? null : Math.min(1, rate + conversionLift)

  function project(id, leads, quoteRate, winRate, orderValue) {
    const quotes = leads != null && quoteRate != null ? leads * quoteRate : null
    const wins = quotes != null && winRate != null ? quotes * winRate : null
    return { id, leads, quotes, wins, supply: wins != null && orderValue > 0 ? wins * orderValue : null }
  }

  const cases = [
    project("steady", annualLeads, leadToQuote, quoteToWin, ticket),
    project("leadGrowth", annualLeads == null ? null : 3 * sum(quarters), leadToQuote, quoteToWin, ticket),
    project("quoteCoverage", annualLeads, increasedRate(leadToQuote), quoteToWin, ticket),
    project("winRate", annualLeads, leadToQuote, increasedRate(quoteToWin), ticket),
    project("orderValue", annualLeads, leadToQuote, quoteToWin, ticket > 0 ? ticket * (1 + orderValueLift) : null),
  ]
  return { cases, quarters, observedGrowth, quarterlyLeadGrowth, conversionLift, orderValueLift }
}

function funnelTargets(value, ticket, activity) {
  const wins = value === 0 ? 0 : ticket > 0 && value != null ? Math.ceil(value / ticket) : null
  const quotes = wins === 0 ? 0 : wins != null && activity?.quoteToWin > 0 ? Math.ceil(wins / activity.quoteToWin) : null
  const leads = quotes === 0 ? 0 : quotes != null && activity?.leadToQuote > 0 ? Math.ceil(quotes / activity.leadToQuote) : null
  return { wins, quotes, leads }
}

function reverseSalesTarget({ activity, commercial, drivers, ticket, target }) {
  const pipeline = sum(commercial.pipeline.map((row) => row.weightedValue))
  const balance = target == null ? null : Math.max(0, target - pipeline)
  const steady = drivers.cases[0]
  const funnel = funnelTargets(target, ticket, activity)
  const averageQuoteRate = activity?.leadToQuote
  const winRate = activity?.quoteToWin
  return {
    funnel,
    pipeline,
    balance,
    afterPipeline: funnelTargets(balance, ticket, activity),
    steady,
    requiredLeadToWin: funnel.wins == null ? null : ratio(funnel.wins, steady.leads),
    requiredQuoteToWin: funnel.wins == null ? null : ratio(funnel.wins, steady.quotes),
    requiredTicket: target == null ? null : ratio(target, steady.wins),
    observedLeadToWin: averageQuoteRate != null && winRate != null ? averageQuoteRate * winRate : null,
  }
}

export function buildOutlook({ activity, plan, history, commercial }) {
  const completed = (activity?.months || []).filter((month) => month.month < currentAnalyticsMonth(new Date(activity.asOf)))
  const recent = completed.filter((month) => month.leads != null).slice(-3)
  const pace = (key) => recent.length === 3 && recent.every((month) => month[key] != null) ? sum(recent.map((month) => month[key])) / 3 : null
  const growth = completed.map((month, index) => {
    const prior = completed[index - 1]?.leads
    return { ...month, change: prior > 0 && month.leads != null ? month.leads / prior - 1 : null,
      average: index >= 2 && completed.slice(index - 2, index + 1).every((item) => item.leads != null)
        ? sum(completed.slice(index - 2, index + 1).map((item) => item.leads)) / 3 : null }
  })
  const hasHistory = history != null && history.year === activity?.year
  const matchedMonths = hasHistory ? history.months.filter((month) => month.isActualMonth && month.actualRevenue != null && month.actualGrossProfit != null) : []
  const accountingMargin = ratio(sum(matchedMonths.map((month) => month.actualGrossProfit)), sum(matchedMonths.map((month) => month.actualRevenue)))
  const scenario = commercial.scenarios.management
  const ticket = scenario.averageOrderValue > 0 ? scenario.averageOrderValue : activity?.meanSupply
  const target = plan.turnoverGoal ?? (plan.year === 2027 ? 15000000 : null)
  const margin = plan.commercialModel?.grossMarginTarget ?? 0.4
  const targets = [
    { label: "Base", value: plan.year === 2027 ? 10000000 : commercial.scenarios.base.modelled ? commercial.scenarios.base.revenue : null },
    { label: "Management", value: target },
    { label: "Stretch", value: plan.year === 2027 ? 20000000 : commercial.scenarios.stretch.modelled ? commercial.scenarios.stretch.revenue : null },
  ].map((entry) => ({ ...entry, gp: entry.value == null ? null : entry.value * margin, ...funnelTargets(entry.value, ticket, activity) }))
  const drivers = projectSalesDrivers(completed, pace("leads"), activity, ticket)
  const chartStart = growth.find((row) => row.leads != null)?.month || `${activity?.year ?? plan.year - 1}-01`
  const chartYear = Math.min(plan.year, (activity?.year ?? plan.year - 1) + 1)
  const historyByMonth = new Map(growth.map((row) => [row.month, row]))
  const chart = []
  for (let month = chartStart; month <= `${chartYear}-12`; month = shiftMonth(month, 1)) {
    const forecast = month >= `${chartYear}-01`
    const previousDecember = month === `${chartYear - 1}-12`
    const quarter = Math.floor((Number(month.slice(-2)) - 1) / 3)
    const planned = forecast ? drivers.quarters[quarter] : null
    chart.push({ month, ...historyByMonth.get(month), projected: previousDecember ? drivers.quarters[0] : planned })
  }
  return {
    committedBacklog: sum(commercial.backlog.map((row) => row.remaining)),
    salesTarget: reverseSalesTarget({ activity, commercial, drivers, ticket, target }),
    drivers, chart, chartYear, wonColumnTotal: activity?.wonColumnTotal,
    growth, accountingMargin, recentMonths: recent.map((month) => month.month), partial: activity?.months.find((month) => month.partial), targets, target, ticket, margin,
    ticketBasis: scenario.averageOrderValue > 0 ? "planned average supply order" : "historical average supply order",
    trendRevenue: pace("supply") == null ? null : pace("supply") * 12,
    monthly: { leads: pace("leads"), quotes: pace("quotes"), wins: pace("wins") },
    chartMax: analyticsAxisMaximum(chart.flatMap((month) => [month.leads, month.quotes, month.projected])),
    revenue: hasHistory && history.actualRevenueMonths ? history.actualRevenue : null,
    gp: hasHistory && history.actualGrossProfitMonths ? history.actualGrossProfit : null,
    revenueMonths: hasHistory ? history.actualRevenueMonths : 0,
    gpMonths: hasHistory ? history.actualGrossProfitMonths : 0,
    accepted: activity?.ordersAvailable ? sum(activity.months.map((month) => month.wins ?? 0)) : null,
    ebitda: target != null && scenario.operatingExpenses != null ? target * margin - scenario.operatingExpenses : null,
    bridge: commercial.funding,
    workingCapital: scenario.workingCapitalRequirement,
  }
}
