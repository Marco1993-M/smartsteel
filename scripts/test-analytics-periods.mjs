import assert from 'node:assert/strict'
import { buildAnalyticsPeriod, currentAnalyticsMonth, shiftMonth } from '../src/lib/analyticsPeriods.mjs'
import { buildAnalyticsInsights } from '../src/lib/analyticsInsights.mjs'
const now = new Date('2026-09-21T10:30:00Z')
const current = buildAnalyticsPeriod(null, now)
assert.equal(current.month, '2026-09')
assert.equal(current.start, '2026-08-31T22:00:00.000Z')
assert.equal(current.end, now.toISOString())
assert.equal(current.previousStart, '2026-07-31T22:00:00.000Z')
assert.equal(current.previousEnd, '2026-08-21T10:30:00.000Z')
assert.match(current.label, /month to date/)
const completed = buildAnalyticsPeriod('2026-08', now)
assert.equal(completed.start, '2026-07-31T22:00:00.000Z')
assert.equal(completed.end, '2026-08-31T22:00:00.000Z')
assert.equal(completed.previousEnd, completed.start)
assert.equal(completed.isCurrent, false)
assert.equal(shiftMonth('2026-01', -1), '2025-12')
assert.equal(currentAnalyticsMonth(new Date('2026-08-31T22:30:00Z')), '2026-09')
const shorter = buildAnalyticsPeriod(null, new Date('2026-03-31T12:00:00Z'))
assert.equal(shorter.previousEnd, '2026-02-28T22:00:00.000Z')
const leap = buildAnalyticsPeriod('2024-02', now)
assert.equal(leap.end, '2024-02-29T22:00:00.000Z')
for (const value of ['2026-13', '2026-1', '2027-01', '1999-12', 'invalid']) assert.throws(() => buildAnalyticsPeriod(value, now))
const insights = buildAnalyticsInsights({
  leads: [{ id:'old',created_at:'2025-01-01',status:'quoted',quote_value:1000,next_action:'Review',follow_up_at:'2026-09-15' }],
  estimates: [{ lead_id:'old', status:'sent',sent_at:'2026-09-01T00:00:00Z' }],
  start:completed.start,end:completed.end,now:now.toISOString(),
})
assert.equal(insights.pipeline.count,1)
assert.equal(insights.attention.overdue,1,'Historical report selection must not rewind live attention')
assert.equal(insights.pipeline.ageBuckets.find((bucket)=>bucket.label==='15–30 days').count,1)
assert.equal(insights.quotes.quotedCount,0)
console.log('Calendar months: SAST boundaries, matched MTD, complete months, year rollover, leap year, shorter months, validation and live pipeline independence passed.')
