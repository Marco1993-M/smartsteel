import assert from 'node:assert/strict'
import { ACCEPTANCE_TERMS_VERSION, validateAcceptance, acceptanceBlocker } from '../src/lib/quoteAcceptance.mjs'
import { buildFollowUpHtml, buildFollowUpCopy } from '../src/lib/crmEstimateFollowUps.js'
const payload = { token: '11111111-1111-4111-8111-111111111111', expectedUpdatedAt: new Date().toISOString(), name: 'Client Name', email: 'client@example.com', agreed: true, termsVersion: ACCEPTANCE_TERMS_VERSION }
assert.equal(validateAcceptance(payload).name, 'Client Name')
for (const change of [{ agreed: false }, { termsVersion: 'old' }, { name: '' }, { email: 'invalid' }, { token: 'bad' }, { expectedUpdatedAt: '' }, { poReference: 'x'.repeat(121) }]) assert.throws(() => validateAcceptance({ ...payload, ...change }))
const quote = { status: 'sent', total: 1000, version_no: 2, created_at: new Date().toISOString() }
assert.equal(acceptanceBlocker(quote, 2), '')
assert.match(acceptanceBlocker(quote, 3), /newer/)
assert.match(acceptanceBlocker({ ...quote, created_at: '2020-01-01' }, 2), /expired/)
for (const status of ['accepted', 'prepared', 'cancelled', 'declined', 'superseded']) assert.match(acceptanceBlocker({ ...quote, status }, 2), /not open/)
const html = buildFollowUpHtml({ copy: buildFollowUpCopy({ stepNumber: 1, lead: { name: 'Client' }, estimate: {} }), estimate: {}, shareUrl: 'https://example.com/quotes/token', responseBaseUrl: 'https://example.com/estimate-response/token' })
assert.match(html, /href="https:\/\/example.com\/quotes\/token#accept-quote"/)
assert.match(html, /Review &amp; accept quote/)
assert.match(html, /choice=not_proceeding/)
assert.doesNotMatch(html, /choice=call_me/)
console.log('Acceptance validation, quote eligibility and email CTA routing passed.')

// Exercise HTTP handler validation/idempotent RPC response handling without a live database or email service.
const { readFile } = await import('node:fs/promises')
const routeSource = (await readFile(new URL('../src/app/api/quotes/accept/route.js', import.meta.url), 'utf8')).replace(/^import .*$/gm, '').replaceAll('export const ', 'const ').replace('export async function POST', 'async function POST')
let writes = 0
const order = { id: 'order', order_number: 'SS-SO-000001', status: 'awaiting_specifications' }
const factory = (rpcResult) => new Function('NextResponse','supabaseServer','validateAcceptance','ACCEPTANCE_TERMS_VERSION','ACCEPTANCE_NEXT_STEPS','ACCEPTANCE_NOTICE','ESTIMATE_TERMS','ESTIMATE_DELIVERY_TERMS','ESTIMATE_EXCLUSIONS','sendSalesOrderConfirmation', `${routeSource}; return POST`)(
  { json: (body, options) => ({ body, status: options?.status || 200 }) }, { rpc: async () => { writes++; return rpcResult } }, validateAcceptance, ACCEPTANCE_TERMS_VERSION, [], 'Notice', [], [], [], async () => ({ sent: false }),
)
const invalid = await factory({ data: order })({ json: async () => ({ ...payload, agreed: false }) })
assert.equal(invalid.status, 400); assert.equal(writes, 0)
for (const data of [order, [order]]) {
  const saved = await factory({ data, error: null })({ json: async () => payload })
  assert.equal(saved.status, 200); assert.equal(saved.body.orderNumber, order.order_number)
  assert.equal(saved.body.confirmationSent, false, 'Mail failure must not undo or duplicate acceptance')
  assert.equal(saved.body.quote_snapshot, undefined, 'Public receipt must not expose stored quote internals')
}
const conflict = await factory({ error: { code: 'P0001', message: 'The quote changed.' } })({ json: async () => payload })
assert.equal(conflict.status, 409)
const unavailable = await factory({ error: { code: 'PGRST202', message: 'Internal database detail' } })({ json: async () => payload })
assert.equal(unavailable.status, 503); assert.doesNotMatch(unavailable.body.error, /Internal database/)
console.log('Public API confirmation requirement, RPC object/array receipts, mail failure and safe error handling passed.')
