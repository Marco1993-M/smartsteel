import assert from 'node:assert/strict'
import { buildDeclineSummary, parseDeclineFeedback } from '../src/lib/estimateDeclineReasons.mjs'
assert.deepEqual(parseDeclineFeedback('not_proceeding', '', ''), { reason: null, comment: null })
assert.deepEqual(parseDeclineFeedback('not_proceeding', 'price', ' Too high '), { reason: 'price', comment: 'Too high' })
assert.deepEqual(parseDeclineFeedback('call_me', 'price', 'old answer'), { reason: null, comment: null })
assert.throws(() => parseDeclineFeedback('not_proceeding', 'invalid', ''))
assert.throws(() => parseDeclineFeedback('not_proceeding', 'other', 'x'.repeat(1001)))
assert.throws(() => parseDeclineFeedback('not_proceeding', '', {}))
const summary = buildDeclineSummary([
  { sequence_id: 'a', created_at: '2026-09-10', response_key: 'not_proceeding', decline_reason: 'price' },
  { sequence_id: 'a', created_at: '2026-09-11', response_key: 'not_proceeding', decline_reason: 'price' },
  { sequence_id: 'b', created_at: '2026-09-10', response_key: 'not_proceeding', decline_reason: 'scope' },
  { sequence_id: 'b', created_at: '2026-09-12', response_key: 'call_me' },
  { sequence_id: 'c', created_at: '2026-09-10', response_key: 'not_proceeding' },
])
assert.equal(summary.total, 2)
assert.equal(summary.withReason, 1)
assert.equal(summary.reasons.find((item) => item.key === 'price').percentage, 50)
assert.equal(summary.reasons.find((item) => item.key === 'not_provided').value, 1)
assert.equal(buildDeclineSummary([]).total, 0)
console.log('Decline feedback validation and deduplicated analytics checks passed.')

// Exercise the response handler without sending email or modifying real leads.
const { readFile } = await import('node:fs/promises')
const { getEstimateResponseOption } = await import('../src/lib/crmEstimateFollowUps.js')
const { ESTIMATE_DECLINE_REASONS } = await import('../src/lib/estimateDeclineReasons.mjs')
const source = (await readFile(new URL('../src/app/api/crm/estimate-follow-ups/respond/route.js', import.meta.url), 'utf8'))
  .replace(/^import .*$/gm, '').replace(/export const /g, 'const ').replace('export async function POST', 'async function POST')
for (const choice of ['call_me', 'request_changes', 'considering', 'not_proceeding']) {
  const writes = []
  const db = { from(table) {
    return {
      select() { return { eq() { return { maybeSingle: async () => ({ data: { id: 'sequence', lead_id: 'lead', estimate_id: 'estimate', status: 'active' } }) } } } },
      async insert(rows) { writes.push({ table, rows }); return { error: null } },
      update(values) { writes.push({ table, values }); return { eq: () => ({ error: null, not: async () => ({ error: null }) }) } },
    }
  } }
  const handler = new Function('NextResponse', 'supabaseServer', 'getEstimateResponseOption', 'ESTIMATE_DECLINE_REASONS', 'parseDeclineFeedback', `${source}; return POST`)(
    { json: (body, options) => ({ body, status: options?.status || 200 }) }, db, getEstimateResponseOption, ESTIMATE_DECLINE_REASONS, parseDeclineFeedback,
  )
  const result = await handler({ json: async () => ({ token: 'token', choice, declineReason: 'price', declineComment: 'My budget is limited' }), headers: new Headers() })
  assert.equal(result.status, 200)
  assert.equal(result.body.choice, choice)
  const lead = writes.find((write) => write.table === 'leads').values
  assert.equal(Object.hasOwn(lead, 'status'), false, 'Client responses must never move a lead to Lost')
  const response = writes.find((write) => write.table === 'crm_estimate_follow_up_responses').rows[0]
  assert.equal(response.response_key, choice)
  assert.equal(response.decline_reason, choice === 'not_proceeding' ? 'price' : undefined)
  if (choice === 'not_proceeding') {
    assert.match(lead.next_action, /Price was above my budget/)
    assert.match(writes.find((write) => write.table === 'lead_activities').rows[0].description, /My budget is limited/)
  }
}
console.log('All four response mappings, feedback persistence and unchanged lead status verified.')
