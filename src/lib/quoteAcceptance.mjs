export const ACCEPTANCE_TERMS_VERSION = 'quote-acceptance-2026-09-v1'
export const ACCEPTANCE_NEXT_STEPS = [
  { title: 'We confirm your order details', text: 'Our team will contact you to check the dimensions, specifications, delivery address and site access.' },
  { title: 'You receive your invoice', text: 'Once the details are confirmed, we’ll send your invoice with the payment requirements.' },
  { title: 'We confirm production and delivery timing', text: 'Manufacturing starts after the final specifications and required payment or credit arrangements are approved.' },
]
export const ACCEPTANCE_NOTICE = 'Accepting this quote does not start manufacturing immediately. If your requirements change and affect the price or scope, we’ll send a revised quote for your approval.'
export function validateAcceptance(payload) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload?.token || '')) throw new Error('This quote link is invalid.')
  if (payload.agreed !== true || payload.termsVersion !== ACCEPTANCE_TERMS_VERSION) throw new Error('Please review and accept the scope, terms and next steps.')
  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim().toLowerCase()
  if (name.length < 2 || name.length > 160) throw new Error('Please enter your full name.')
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.')
  if (!payload.expectedUpdatedAt || !Number.isFinite(Date.parse(payload.expectedUpdatedAt))) throw new Error('Reload the quote before accepting.')
  const poReference = String(payload.poReference || '').trim()
  if (poReference.length > 120) throw new Error('The PO reference must be 120 characters or fewer.')
  return { token: payload.token, name, email, poReference, expectedUpdatedAt: payload.expectedUpdatedAt }
}
export function acceptanceBlocker(estimate, latestVersion, now = Date.now()) {
  if (!estimate) return 'This quote is unavailable.'
  if (estimate.status !== 'sent') return 'This quote is not open for acceptance. Please request a current quote from Smart Steel.'
  if (Number(latestVersion) > Number(estimate.version_no)) return 'A newer quote exists. Please review the latest version before accepting.'
  if (!(Number(estimate.total) > 0)) return 'Please contact Smart Steel to confirm the quote amount.'
  if (!estimate.created_at || Date.parse(estimate.created_at) + 14 * 86400000 <= now) return 'This quote has expired. Please ask Smart Steel to issue an updated quote.'
  return ''
}
export const SALES_ORDER_STAGES = {
  awaiting_specifications: 'Awaiting specification confirmation',
  awaiting_invoice: 'Specifications confirmed · invoice required',
  awaiting_payment: 'Awaiting payment / credit clearance',
  ready_for_release: 'Ready for manufacturing approval',
  in_production: 'In production',
  ready_for_dispatch: 'Ready for dispatch',
  delivered: 'Delivered',
  complete: 'Complete',
  cancelled: 'Cancelled',
}
