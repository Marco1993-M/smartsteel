export const SUPPLIER_STAGES = { pending: 'Not requested', requested: 'Quote requested', quoted: 'Quote received', ordered: 'Order placed', manufacturing: 'In manufacture', ready: 'Ready' }
export const JOB_STAGES = { deposit: 'Awaiting deposit', engineering: 'Engineering', procurement: 'Supplier procurement', manufacturing: 'In manufacture', balance: 'Awaiting client balance', dispatch: 'Ready for dispatch', delivered: 'Delivered', closed: 'Closed' }
export const todaySast = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' })
export const roundMoney = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100
const supplier = (key, label) => ({ key, label, required: true, name: '', status: 'pending', quoteReference: '', quotedCost: null, expectedDate: '', invoices: [], payments: [] })
export function emptyOperations(order) {
  const data = { owner: 'info@smartsteel.co.za', baseline: { structure: null, sheeting: null, other: null, source: '', locked: false }, payments: [], engineering: { owner: 'stefan@smartsteel.co.za', status: 'pending', reference: '', revision: '', url: '', applicability: '', reusedFrom: '', matchConfirmed: false }, suppliers: [supplier('structure', 'Structure & brackets'), supplier('sheeting', 'Sheeting')], qualityChecked: false, packed: false, deliveryDate: '', deliveryReference: '', notes: '' }
  if ((order?.quote_snapshot?.input_data?.gableMode || order?.quote_snapshot?.input_data?.sheetingMode) === 'structure_only') data.suppliers[1].required = false
  return data
}
export const paymentTotal = (entries) => roundMoney(entries.reduce((total, entry) => total + (entry.kind === 'refund' ? -1 : 1) * Number(entry.amount), 0))
export function summarizeOperations(order, data) {
  const sell = Number(order.quote_snapshot?.total || 0)
  const total = roundMoney(sell * 1.15), deposit = roundMoney(total * .75), received = paymentTotal(data.payments)
  const suppliers = data.suppliers.filter((s) => s.required)
  const ready = suppliers.length > 0 && suppliers.every((s) => s.status === 'ready')
  const baselineKnown = data.baseline.locked
  const baseline = baselineKnown ? roundMoney(data.baseline.structure + data.baseline.sheeting + data.baseline.other) : null
  const committed = suppliers.every((s) => s.quotedCost != null && ['ordered','manufacturing','ready'].includes(s.status)) ? roundMoney(suppliers.reduce((sum, s) => sum + s.quotedCost, 0)) : null
  const invoiced = suppliers.reduce((sum, s) => sum + s.invoices.reduce((t, i) => t + i.amount, 0), 0)
  const invoicesComplete = suppliers.every((s) => s.invoices.length > 0)
  let stage = 'procurement', next = 'Request supplier quotations and confirm costs.'
  if (['complete', 'cancelled'].includes(order.status)) { stage = 'closed'; next = 'Order closed.' }
  else if (data.deliveryDate || order.status === 'delivered') { stage = 'delivered'; next = 'Review final supplier costs and any outstanding obligations.' }
  else if (received + .005 < deposit) { stage = 'deposit'; next = `Confirm the 75% deposit before finalising engineering.` }
  else if (data.engineering.status !== 'approved') { stage = 'engineering'; next = 'Stefan to finalise the drawings or confirm an approved design matches this order.' }
  else if (ready && data.qualityChecked && data.packed) { stage = received + .005 < total ? 'balance' : 'dispatch'; next = stage === 'balance' ? 'Collect the outstanding client balance before dispatch.' : 'Arrange delivery and record proof once delivered.' }
  else if (suppliers.some((s) => ['manufacturing', 'ready'].includes(s.status))) { stage = 'manufacturing'; next = ready ? 'Complete quality and packing checks.' : 'Confirm supplier progress and readiness dates.' }
  return { total, deposit, received, balance: Math.max(0, roundMoney(total - received)), depositOutstanding: Math.max(0, roundMoney(deposit - received)), baseline, committed, invoiced: roundMoney(invoiced), invoicesComplete, variance: baseline != null && committed != null ? roundMoney(baseline - committed) : null, ready, stage, next }
}
function fail(message) { throw new Error(message) }
function text(value, max = 2000) { return typeof value === 'string' && value.length <= max }
function money(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e10 && Math.abs(roundMoney(value) - value) < .00001 }
function date(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + 'T12:00:00Z')) && new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value }
function entries(rows, invoices = false) {
  if (!Array.isArray(rows) || rows.length > 100) return false
  return rows.every((r) => r && money(r.amount) && r.amount > 0 && date(r.date) && r.date <= todaySast() && text(r.reference, 300) && r.reference.trim() && (invoices ? [0, 15].includes(r.vatRate) : ['payment', 'refund'].includes(r.kind)))
}
export function validateOperations(data, order, previous) {
  if (!data || !text(data.owner, 254) || !data.owner.trim() || !text(data.notes, 8000)) fail('Add a responsible owner and valid notes.')
  const b = data.baseline, e = data.engineering
  if (!b || typeof b.locked !== 'boolean' || !text(b.source) || !['structure', 'sheeting', 'other'].every((k) => b[k] === null || money(b[k]))) fail('Cost allowances must be positive amounts or blank.')
  if (b.locked && (!['structure', 'sheeting', 'other'].every((k) => money(b[k])) || !b.source.trim())) fail('Record all three baseline amounts (zero where not applicable) and the source before locking.')
  if (previous?.baseline?.locked && ['structure','sheeting','other','source','locked'].some((key) => previous.baseline[key] !== b[key])) fail('The original cost baseline is locked. It cannot be overwritten.')
  if (!entries(data.payments)) fail('Client payments require an amount, valid date and reference. Refunds must be recorded separately.')
  if (paymentTotal(data.payments) < 0) fail('Refunds cannot exceed recorded payments.')
  if (!e || !['pending', 'drafting', 'approved'].includes(e.status) || !['owner','reference','revision','url','applicability','reusedFrom'].every((k) => text(e[k])) || typeof e.matchConfirmed !== 'boolean') fail('Check the drawing information.')
  if (e.url && !/^https:\/\/[^\s]+$/i.test(e.url)) fail('Use a secure HTTPS link for drawings.')
  if (!Array.isArray(data.suppliers) || data.suppliers.length !== 2 || data.suppliers[0].key !== 'structure' || data.suppliers[1].key !== 'sheeting') fail('Both supplier workstreams must be present.')
  if (!data.suppliers[0].required) fail('The structural supplier is required.')
  for (const s of data.suppliers) {
    if (typeof s.required !== 'boolean' || !text(s.name, 200) || !text(s.quoteReference, 300) || !(s.status in SUPPLIER_STAGES) || (s.quotedCost !== null && !money(s.quotedCost)) || (s.expectedDate && !date(s.expectedDate)) || !entries(s.invoices, true) || !entries(s.payments)) fail('Check supplier amounts, dates and references.')
    if (!s.required && (s.invoices.length || s.payments.length || s.status !== 'pending' || s.quotedCost !== null)) fail('Clear the unused sheeting workstream before marking it not required.')
    if (s.required && s.status !== 'pending' && !s.name.trim()) fail('Name the supplier before requesting a quote.')
    if (s.required && ['quoted','ordered','manufacturing','ready'].includes(s.status) && (s.quotedCost === null || !s.quoteReference.trim())) fail('Record the supplier quotation and cost before progressing.')
    if (paymentTotal(s.payments) < 0) fail('Supplier refunds cannot exceed payments.')
    if (s.required && ['ordered','manufacturing','ready'].includes(s.status) && (!order.specifications_confirmed_at || !order.invoice_id || e.status !== 'approved')) fail('Confirm the client specification, link the invoice and approve drawings before placing supplier orders.')
    if (s.required && ['manufacturing','ready'].includes(s.status) && paymentTotal(s.payments) <= 0) fail('Record supplier payment before marking manufacture started.')
  }
  if (typeof data.qualityChecked !== 'boolean' || typeof data.packed !== 'boolean' || !text(data.deliveryReference, 1000) || (data.deliveryDate && (!date(data.deliveryDate) || data.deliveryDate > todaySast()))) fail('Check dispatch details and delivery date.')
  const summary = summarizeOperations(order, data)
  if (e.status !== 'pending' && summary.received + .005 < summary.deposit) fail('Record the 75% client deposit before progressing engineering.')
  if (e.status === 'approved' && (!e.owner.trim() || !e.reference.trim() || !e.revision.trim() || !e.applicability.trim() || !e.matchConfirmed)) fail('Approved drawings need an owner, reference, revision, applicable specification and confirmation that they match this order.')
  if (data.suppliers[0].status !== 'pending' && e.status !== 'approved') fail('Approve the drawing set before sending the structural supplier enquiry.')
  if (data.deliveryDate && (summary.balance > .005 || !summary.ready || !data.qualityChecked || !data.packed || !data.deliveryReference.trim())) fail('Delivery requires full client payment, both required suppliers ready, quality and packing checks, and a delivery reference.')
  return data
}
