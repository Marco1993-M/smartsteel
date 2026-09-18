const DAY = 86400000
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0
const status = (lead) => String(lead.status || '').toLowerCase()
const date = (value) => value ? Date.parse(value) : NaN
const rate = (part, total) => total ? Math.round(part / total * 1000) / 10 : null
const median = (values) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return Math.round((sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2) * 10) / 10
}
const inPeriod = (value, start, end) => date(value) >= date(start) && date(value) < date(end)
const sent = (estimate) => Boolean(estimate.sent_at) || ['sent', 'accepted', 'declined', 'superseded'].includes(estimate.status)

export function buildAnalyticsInsights({ leads, estimates = [], responses = [], emails = [], start, end, estimatesAvailable = true, responsesAvailable = true, emailsAvailable = true }) {
  const now = date(end)
  const byLead = new Map()
  for (const estimate of estimates) {
    const id = String(estimate.lead_id)
    if (!byLead.has(id)) byLead.set(id, [])
    byLead.get(id).push(estimate)
  }
  const quoted = (lead) => (byLead.get(String(lead.id)) || []).some(sent)
  const firstSent = (lead) => Math.min(...(byLead.get(String(lead.id)) || []).map((item) => date(item.sent_at)).filter((value) => Number.isFinite(value) && value <= now))
  const active = leads.filter((lead) => !['won', 'lost', 'archived'].includes(status(lead)))
  const cohort = leads.filter((lead) => inPeriod(lead.created_at, start, end))
  const quotedCohort = cohort.filter(quoted)
  const turnaround = quotedCohort.map((lead) => (firstSent(lead) - date(lead.created_at)) / DAY).filter((value) => Number.isFinite(value) && value >= 0)
  const awaiting = estimatesAvailable ? active.filter((lead) => !quoted(lead)) : []
  const openQuoted = estimatesAvailable ? active.filter(quoted) : []
  const ageBuckets = [
    { label: '0–7 days', min: 0, max: 8 }, { label: '8–14 days', min: 8, max: 15 },
    { label: '15–30 days', min: 15, max: 31 }, { label: '31–60 days', min: 31, max: 61 },
    { label: '61+ days', min: 61, max: Infinity }, { label: 'Date missing', min: null, max: null },
  ].map((bucket) => {
    const matching = openQuoted.filter((lead) => {
      const age = Math.floor((now - firstSent(lead)) / DAY)
      return bucket.min === null ? !Number.isFinite(age) : Number.isFinite(age) && age >= bucket.min && age < bucket.max
    })
    return { label: bucket.label, count: matching.length, value: matching.reduce((sum, lead) => sum + number(lead.quote_value), 0) }
  })
  const attention = active.map((lead) => {
    const reasons = []
    if (date(lead.follow_up_at) < now) reasons.push('Follow-up overdue')
    if (!String(lead.next_action || '').trim()) reasons.push('No next action')
    if (estimatesAvailable && quoted(lead) && now - firstSent(lead) >= 31 * DAY) reasons.push('Quote open 31+ days')
    return { id: lead.id, name: [lead.name, lead.last_name].filter(Boolean).join(' ') || 'Unnamed lead', product: lead.product_type || 'Not captured', value: number(lead.quote_value), reasons, nextAction: lead.next_action || '', age: Number.isFinite(date(lead.created_at)) ? Math.max(0, Math.floor((now - date(lead.created_at)) / DAY)) : null }
  }).filter((lead) => lead.reasons.length).sort((a, b) => Number(b.reasons.includes('Follow-up overdue')) - Number(a.reasons.includes('Follow-up overdue')) || b.value - a.value)
  function performance(field) {
    const groups = new Map()
    for (const lead of cohort) {
      const label = String(lead[field] || '').trim() || 'Not captured'
      const key = label.toLowerCase()
      if (!groups.has(key)) groups.set(key, { label, leads: 0, quoted: 0, won: 0, lost: 0, wonValue: 0 })
      const row = groups.get(key)
      row.leads++
      if (quoted(lead)) row.quoted++
      if (status(lead) === 'won') { row.won++; row.wonValue += number(lead.quote_value) }
      if (status(lead) === 'lost') row.lost++
    }
    return [...groups.values()].map((row) => ({ ...row, quoted: estimatesAvailable ? row.quoted : null, winRate: rate(row.won, row.leads) })).sort((a, b) => b.wonValue - a.wonValue || b.leads - a.leads)
  }
  const latest = new Map()
  for (const response of responses) {
    const previous = latest.get(response.sequence_id)
    if (!previous || date(response.created_at) >= date(previous.created_at)) latest.set(response.sequence_id, response)
  }
  const sentEstimates = new Map()
  for (const email of emails) {
    if (!inPeriod(email.sent_at, start, end)) continue
    const key = String(email.estimate_id)
    sentEstimates.set(key, Math.min(sentEstimates.get(key) ?? Infinity, date(email.sent_at)))
  }
  const responded = new Set(responses.filter((response) => sentEstimates.has(String(response.estimate_id)) && date(response.created_at) >= sentEstimates.get(String(response.estimate_id))).map((response) => String(response.estimate_id)))
  return {
    estimatesAvailable,
    pipeline: { count: active.length, value: active.reduce((sum, lead) => sum + number(lead.quote_value), 0), quotedCount: openQuoted.length, quotedValue: openQuoted.reduce((sum, lead) => sum + number(lead.quote_value), 0), awaitingQuote: awaiting.length, oldestAwaitingDays: awaiting.length ? Math.max(0, ...awaiting.map((lead) => (now - date(lead.created_at)) / DAY).filter(Number.isFinite).map(Math.floor)) : null, ageBuckets },
    quotes: { quotedCount: quotedCohort.length, wonCount: quotedCohort.filter((lead) => status(lead) === 'won').length, winRate: rate(quotedCohort.filter((lead) => status(lead) === 'won').length, quotedCohort.length), medianDays: median(turnaround), timingSample: turnaround.length },
    attention: { total: attention.length, overdue: active.filter((lead) => date(lead.follow_up_at) < now).length, noNextAction: active.filter((lead) => !String(lead.next_action || '').trim()).length, leads: attention },
    products: performance('product_type'), sources: performance('lead_source'),
    feedback: { available: responsesAvailable, rateAvailable: responsesAvailable && emailsAvailable, sentCount: sentEstimates.size, respondedCount: responded.size, responseRate: responsesAvailable && emailsAvailable ? rate(responded.size, sentEstimates.size) : null, total: latest.size, choices: [
      ['call_me', 'Ready to proceed'], ['request_changes', 'Needs changes'], ['considering', 'Planning for later'], ['not_proceeding', 'No longer needed'],
    ].map(([key, label]) => ({ key, label, count: [...latest.values()].filter((response) => response.response_key === key).length })) },
  }
}
