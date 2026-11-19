export const SUPPLIER_STAGES = { pending: 'Not requested', requested: 'Quote requested', quoted: 'Quote received', ordered: 'Order placed', manufacturing: 'In manufacture', ready: 'Ready' }
export const JOB_STAGES = { deposit: 'Awaiting deposit', engineering: 'Engineering', procurement: 'Supplier procurement', manufacturing: 'In manufacture', balance: 'Awaiting client balance', dispatch: 'Ready for dispatch', delivered: 'Delivered', closed: 'Closed' }
export const todaySast = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' })
export const roundMoney = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100
export const COST_CATEGORIES = { structure: 'Structural steel', brackets: 'Brackets & connections', fasteners: 'Bolts, nuts, washers & anchors', sheeting: 'Sheeting & flashings', other: 'Other costs' }
export const supplierCategory = (s) => s.category || s.key
export const isDispatchSupplier = (s) => s.required && supplierCategory(s) !== 'other'
export const legacyBaseline = (b) => !Object.hasOwn(b, 'brackets') && !Object.hasOwn(b, 'fasteners')
export const baselineTotal = (b) => b.locked ? roundMoney(Object.keys(COST_CATEGORIES).reduce((sum, key) => sum + Number(b[key] || 0), 0)) : null
export const createSupplier = (category, key = category, required = true) => ({ key, category, label: COST_CATEGORIES[category], required, name: '', status: 'pending', quoteReference: '', quotedCost: null, expectedDate: '', invoices: [], payments: [] })
export function emptyOperations(order) {
  const data = { owner: 'info@smartsteel.co.za', baseline: { structure: null, brackets: null, fasteners: null, sheeting: null, other: null, source: '', locked: false }, payments: [], engineering: { owner: 'stefan@smartsteel.co.za', status: 'pending', reference: '', revision: '', url: '', applicability: '', reusedFrom: '', matchConfirmed: false }, suppliers: [createSupplier('structure'), createSupplier('sheeting')], qualityChecked: false, packed: false, deliveryDate: '', deliveryReference: '', notes: '' }
  if ((order?.quote_snapshot?.input_data?.gableMode || order?.quote_snapshot?.input_data?.sheetingMode) === 'structure_only') data.suppliers[1].required = false
  return data
}
// Group suppliers before comparing costs: an allowance belongs to a category, not each supplier.
// Historical combined allowances remain intact, including when more suppliers are added.
export function costComparison(data) {
  const legacy = legacyBaseline(data.baseline)
  const groups = legacy
    ? [['structure', 'Structure & brackets · combined allowance', ['structure', 'brackets']], ['fasteners', COST_CATEGORIES.fasteners, ['fasteners']], ['sheeting', COST_CATEGORIES.sheeting, ['sheeting']], ['other', COST_CATEGORIES.other, ['other']]]
    : Object.entries(COST_CATEGORIES).map(([key, label]) => [key, label, [key]])
  return groups.map(([key, label, categories]) => {
    const suppliers = data.suppliers.filter(s => s.required && categories.includes(supplierCategory(s)))
    const committed = suppliers.length && suppliers.every(s => s.quotedCost != null && ['ordered', 'manufacturing', 'ready'].includes(s.status)) ? roundMoney(suppliers.reduce((sum, s) => sum + s.quotedCost, 0)) : null
    const invoices = suppliers.flatMap(s => s.invoices)
    const allowance = data.baseline[key] ?? null
    const quoted = suppliers.length && suppliers.every(s => s.quotedCost != null)
      ? roundMoney(suppliers.reduce((sum, s) => sum + s.quotedCost, 0))
      : null
    const quoteVariance = allowance != null && quoted != null ? roundMoney(allowance - quoted) : null
    return { key, label, suppliers, allowance, quoted, quoteVariance, committed, invoiced: invoices.length ? roundMoney(invoices.reduce((sum, i) => sum + i.amount, 0)) : null, variance: allowance != null && committed != null ? roundMoney(allowance - committed) : null }
  })
}
export const paymentTotal = (entries) => roundMoney(entries.reduce((total, entry) => total + (entry.kind === 'refund' ? -1 : 1) * Number(entry.amount), 0))
export function summarizeOperations(order, data) {
  const sell = Number(order.quote_snapshot?.total || 0)
  const total = roundMoney(sell * 1.15), deposit = roundMoney(total * .75), received = paymentTotal(data.payments)
  const suppliers = data.suppliers.filter((s) => s.required)
  const dispatchSuppliers = suppliers.filter(isDispatchSupplier)
  const ready = dispatchSuppliers.length > 0 && dispatchSuppliers.every((s) => s.status === 'ready')
  const baseline = baselineTotal(data.baseline)
  const committed = suppliers.length > 0 && suppliers.every((s) => s.quotedCost != null && ['ordered','manufacturing','ready'].includes(s.status)) ? roundMoney(suppliers.reduce((sum, s) => sum + s.quotedCost, 0)) : null
  const invoiced = suppliers.reduce((sum, s) => sum + s.invoices.reduce((t, i) => t + i.amount, 0), 0)
  const invoicesComplete = suppliers.length > 0 && suppliers.every((s) => s.invoices.length > 0)
  let stage = 'procurement', next = 'Request supplier quotations and confirm costs.'
  if (['complete', 'cancelled'].includes(order.status)) { stage = 'closed'; next = 'Order closed.' }
  else if (data.deliveryDate || order.status === 'delivered') { stage = 'delivered'; next = 'Review final supplier costs and any outstanding obligations.' }
  else if (received + .005 < deposit) { stage = 'deposit'; next = `Confirm the 75% deposit before finalising engineering.` }
  else if (data.engineering.status !== 'approved') { stage = 'engineering'; next = 'Stefan to finalise the drawings or confirm an approved design matches this order.' }
  else if (data.quoteRevisionReview?.required) { stage = 'procurement'; next = 'Review supplier scope against the updated won quote before production.' }
  else if (ready && data.qualityChecked && data.packed) { stage = received + .005 < total ? 'balance' : 'dispatch'; next = stage === 'balance' ? 'Collect the outstanding client balance before dispatch.' : 'Arrange delivery and record proof once delivered.' }
  else if (dispatchSuppliers.some((s) => ['manufacturing', 'ready'].includes(s.status))) { stage = 'manufacturing'; next = ready ? 'Complete quality and packing checks.' : 'Confirm supplier progress and readiness dates.' }
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
  const baselineKeys = b && legacyBaseline(b) ? ['structure', 'sheeting', 'other'] : Object.keys(COST_CATEGORIES)
  if (!b || typeof b.locked !== 'boolean' || !text(b.source) || !baselineKeys.every((k) => b[k] === null || money(b[k]))) fail('Cost allowances must be positive amounts or blank.')
  if (b.locked && (!baselineKeys.every((k) => money(b[k])) || !b.source.trim())) fail('Record all category allowances (zero where not applicable) and the source before locking.')
  if (previous?.baseline?.locked && [...new Set([...Object.keys(previous.baseline), ...Object.keys(b)])].some(key => previous.baseline[key] !== b[key])) fail('The original cost baseline is locked. It cannot be overwritten.')
  if (!entries(data.payments)) fail('Client payments require an amount, valid date and reference. Refunds must be recorded separately.')
  if (paymentTotal(data.payments) < 0) fail('Refunds cannot exceed recorded payments.')
  if (!e || !['pending', 'drafting', 'approved'].includes(e.status) || !['owner','reference','revision','url','applicability','reusedFrom'].every((k) => text(e[k])) || typeof e.matchConfirmed !== 'boolean') fail('Check the drawing information.')
  if (e.url && !/^https:\/\/[^\s]+$/i.test(e.url)) fail('Use a secure HTTPS link for drawings.')
  if (!Array.isArray(data.suppliers) || !data.suppliers.length || data.suppliers.length > 50 || new Set(data.suppliers.map(s => s.key)).size !== data.suppliers.length || data.suppliers.some(s => !text(s.key, 100) || !s.key || !Object.hasOwn(COST_CATEGORIES, supplierCategory(s)))) fail('Check supplier categories and unique references (maximum 50 entries).')
  if (!data.suppliers.some(s => supplierCategory(s) === 'structure' && s.required)) fail('At least one structural steel supplier is required.')
  if (previous?.suppliers.some(s => !data.suppliers.some(next => next.key === s.key && supplierCategory(next) === supplierCategory(s)))) fail('Existing supplier entries and categories must be retained for the audit trail.')
  for (const s of data.suppliers) {
    if (typeof s.required !== 'boolean' || !text(s.name, 200) || !text(s.quoteReference, 300) || !(s.status in SUPPLIER_STAGES) || (s.quotedCost !== null && !money(s.quotedCost)) || (s.expectedDate && !date(s.expectedDate)) || !entries(s.invoices, true) || !entries(s.payments)) fail('Check supplier amounts, dates and references.')
    if (!s.required && (s.invoices.length || s.payments.length || s.status !== 'pending' || s.quotedCost !== null)) fail('Clear the unused supplier entry before marking it not required.')
    if (s.required && s.status !== 'pending' && !s.name.trim()) fail('Name the supplier before requesting a quote.')
    if (s.required && ['quoted','ordered','manufacturing','ready'].includes(s.status) && (s.quotedCost === null || !s.quoteReference.trim())) fail('Record the supplier quotation and cost before progressing.')
    if (paymentTotal(s.payments) < 0) fail('Supplier refunds cannot exceed payments.')
    if (isDispatchSupplier(s) && ['manufacturing','ready'].includes(s.status) && paymentTotal(s.payments) <= 0) fail('Record supplier payment before marking manufacture started.')
  }
  if (typeof data.qualityChecked !== 'boolean' || typeof data.packed !== 'boolean' || !text(data.deliveryReference, 1000) || (data.deliveryDate && (!date(data.deliveryDate) || data.deliveryDate > todaySast()))) fail('Check dispatch details and delivery date.')
  const summary = summarizeOperations(order, data)
  if (e.status !== 'pending' && summary.received + .005 < summary.deposit) fail('Record the 75% client deposit before progressing engineering.')
  if (e.status === 'approved' && (!e.owner.trim() || !e.reference.trim() || !e.revision.trim() || !e.applicability.trim() || !e.matchConfirmed)) fail('Approved drawings need an owner, reference, revision, applicable specification and confirmation that they match this order.')
  if (data.deliveryDate && (summary.balance > .005 || !summary.ready || !data.qualityChecked || !data.packed || !data.deliveryReference.trim())) fail('Delivery requires full client payment, all required material suppliers ready, quality and packing checks, and a delivery reference.')
  return data
}

// Milestones describe recorded evidence; later activity never fills missing earlier records.
export function manufacturingMilestones(order, data = order.operations?.data || emptyOperations(order)) {
  const summary = summarizeOperations(order, data)
  const suppliers = data.suppliers.filter(isDispatchSupplier)
  const hasValue = summary.total > 0
  const steps = [
    { key: 'won', label: 'Quote won', done: order.status !== 'cancelled' },
    { key: 'deposit', label: '75% deposit', done: hasValue && summary.received + .005 >= summary.deposit },
    { key: 'engineering', label: 'Drawings', done: data.engineering.status === 'approved' },
    { key: 'procurement', label: 'Suppliers ordered', done: suppliers.length > 0 && suppliers.every((supplier) => ['ordered', 'manufacturing', 'ready'].includes(supplier.status)) },
    { key: 'manufacturing', label: 'Made & checked', done: summary.ready && data.qualityChecked && data.packed },
    { key: 'balance', label: 'Fully paid', done: hasValue && summary.balance <= .005 },
    { key: 'delivered', label: 'Delivered', done: !!data.deliveryDate || order.status === 'delivered' },
  ]
  const stopped = ['cancelled', 'complete'].includes(order.status)
  const next = stopped ? -1 : steps.findIndex((step) => !step.done)
  return steps.map((step, index) => ({ ...step, state: step.done ? 'done' : index === next ? 'current' : 'pending' }))
}

// Routine updates keep an audit trail without requiring a second description of
// the fields just entered. Changes/removals to existing ledger entries need a reason.
export function requiresManufacturingCorrectionNote(previous, next) {
  if (!previous) return false
  const changedExisting = (before = [], after = []) => before.some((row, index) => JSON.stringify(row) !== JSON.stringify(after[index]))
  return changedExisting(previous.payments, next.payments) || previous.suppliers.some((supplier) => {
    const match = next.suppliers.find(s => s.key === supplier.key)
    return changedExisting(supplier.invoices, match?.invoices) || changedExisting(supplier.payments, match?.payments)
  })
}
export function manufacturingUpdateNote(previous, next) {
  const before = previous || emptyOperations()
  const changes = []
  if (JSON.stringify(before.payments) !== JSON.stringify(next.payments)) changes.push('Client receipts updated')
  if (JSON.stringify(before.engineering) !== JSON.stringify(next.engineering)) changes.push('Drawing information updated')
  next.suppliers.forEach((supplier) => {
    if (JSON.stringify(before.suppliers.find(s => s.key === supplier.key)) !== JSON.stringify(supplier)) changes.push(`${supplier.label || supplier.key}: ${SUPPLIER_STAGES[supplier.status] || supplier.status}; quote ${supplier.quoteReference || 'not recorded'}${supplier.quotedCost == null ? '' : `; R ${supplier.quotedCost.toFixed(2)} excl. VAT`}`)
  })
  if (JSON.stringify(before.baseline) !== JSON.stringify(next.baseline)) changes.push('Original cost allowance updated')
  if (before.deliveryDate !== next.deliveryDate || before.packed !== next.packed || before.qualityChecked !== next.qualityChecked) changes.push('Delivery preparation updated')
  return changes.join('. ') || 'Project details updated'
}
