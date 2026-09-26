import assert from 'node:assert/strict'
import { buildAnalyticsInsights } from '../src/lib/analyticsInsights.mjs'
const lead = (id, overrides = {}) => ({ id, name: `Client ${id}`, created_at: '2026-09-02T08:00:00Z', status: 'quoted', quote_value: 10000, next_action: 'Call client', lead_source: 'Organic', product_type: 'Warehouse', ...overrides })
const leads = [lead('old', { created_at: '2025-01-01', follow_up_at: '2026-09-10', quote_value: 50000 }), lead('won', { status: 'won' }), lead('open'), lead('waiting', { status: 'new', next_action: '', quote_value: 0 }), lead('lost', { status: 'lost' })]
const estimates = [
  { id: 'old-quote', lead_id: 'old', status: 'sent', sent_at: '2026-06-01' },
  { id: 'won-1', lead_id: 'won', status: 'superseded', sent_at: '2026-09-04T08:00:00Z' },
  { id: 'won-2', lead_id: 'won', status: 'accepted', sent_at: '2026-09-06T08:00:00Z' },
  { id: 'open-1', lead_id: 'open', status: 'sent', sent_at: '2026-09-06T08:00:00Z' },
]
const input = { leads, estimates, start: '2026-09-01T00:00:00Z', end: '2026-09-18T12:00:00Z', responses: [
  { sequence_id: 's1', estimate_id: 'won-2', created_at: '2026-09-12', response_key: 'not_proceeding' },
  { sequence_id: 's1', estimate_id: 'won-2', created_at: '2026-09-13', response_key: 'call_me' },
  { sequence_id: 's2', estimate_id: 'old-quote', created_at: '2026-09-14', response_key: 'considering' },
], emails: [{ estimate_id: 'won-2', sent_at: '2026-09-10' }, { estimate_id: 'won-2', sent_at: '2026-09-11' }, { estimate_id: 'open-1', sent_at: '2026-09-12' }] }
const result = buildAnalyticsInsights(input)
assert.equal(result.pipeline.count, 3, 'Older open leads remain in pipeline')
assert.equal(result.pipeline.value, 60000)
assert.equal(result.pipeline.quotedCount, 2)
assert.equal(result.pipeline.ageBuckets.find((bucket) => bucket.label === '61+ days').count, 1)
assert.equal(result.quotes.quotedCount, 2, 'Revisions do not multiply quoted opportunities')
assert.equal(result.quotes.winRate, 50)
assert.equal(result.quotes.medianDays, 3, 'First send, not revision, determines turnaround')
assert.equal(result.quotes.timingSample, 2)
assert.equal(result.attention.overdue, 1)
assert.equal(result.attention.noNextAction, 1)
assert.equal(result.sources[0].leads, 4, 'Old pipeline lead excluded from acquisition cohort')
assert.equal(result.feedback.sentCount, 2)
assert.equal(result.feedback.respondedCount, 1)
assert.equal(result.feedback.responseRate, 50)
assert.equal(result.feedback.total, 2)
assert.equal(result.feedback.choices.find((choice) => choice.key === 'not_proceeding').count, 0)
const unavailable = buildAnalyticsInsights({ ...input, estimates: [], estimatesAvailable: false, responsesAvailable: false, emailsAvailable: false })
assert.equal(unavailable.pipeline.count, 3)
assert.equal(unavailable.sources[0].quoted, null)
assert.equal(unavailable.feedback.responseRate, null)
const empty = buildAnalyticsInsights({ ...input, leads: [], estimates: [], responses: [], emails: [] })
assert.equal(empty.quotes.winRate, null)
assert.equal(empty.quotes.medianDays, null)
assert.equal(empty.feedback.responseRate, null)
const missing = buildAnalyticsInsights({ ...input, leads: [lead('legacy')], estimates: [{ lead_id: 'legacy', status: 'sent', sent_at: null }] })
assert.equal(missing.pipeline.ageBuckets.find((bucket) => bucket.label === 'Date missing').count, 1)
assert.equal(missing.quotes.timingSample, 0)
console.log('Analytics: historical pipeline, revision deduplication, timing, response rates, missing data and empty states passed.')
