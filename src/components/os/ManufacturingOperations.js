'use client'

import { prefillManufacturingAllowances } from '../../lib/manufacturingAllowances.mjs'
import ManufacturingProgress from './ManufacturingProgress'
import ManufacturingOrderSetup from './ManufacturingOrderSetup'
import CustomerOrders from './CustomerOrders'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, FileText, Package, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { getOsAuthHeaders } from '../../lib/osClientAuth'
import { emptyOperations, JOB_STAGES, SUPPLIER_STAGES, summarizeOperations, paymentTotal, roundMoney, todaySast, requiresManufacturingCorrectionNote, manufacturingUpdateNote, COST_CATEGORIES, supplierCategory, createSupplier, costComparison, projectOrderProfit, legacyBaseline, baselineTotal } from '../../lib/manufacturingOperations.mjs'

const money = (value) => value == null ? 'Not recorded' : `R ${Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const input = 'mt-1.5 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 disabled:bg-slate-50 disabled:text-slate-500'
const primary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50'
const secondary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50'
const panel = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'
function Field({ label, value, onChange, type = 'text', disabled = false, hint }) {
  return <label className="block min-w-0 text-xs font-semibold text-slate-600">{label}<input type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? '.01' : undefined} value={value ?? ''} disabled={disabled} onChange={(event) => onChange(type === 'number' ? event.target.value === '' ? null : Number(event.target.value) : event.target.value)} className={input} />{hint && <span className="mt-1 block text-xs font-normal leading-5 text-slate-400">{hint}</span>}</label>
}
function Stat({ label, value, hint }) { return <div className="min-w-0 rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 break-words text-xl font-bold tracking-tight text-slate-950">{value}</p>{hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}</div> }
function Check({ label, value, onChange, disabled }) { return <label className="flex items-start gap-3 text-sm leading-6 text-slate-700"><input type="checkbox" checked={value} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0" />{label}</label> }

export default function ManufacturingOperations() {
  const [records, setRecords] = useState([])
  const [pendingHandoffs, setPendingHandoffs] = useState([])
  const [historicalProjects, setHistoricalProjects] = useState([])
  const [handoffWarning, setHandoffWarning] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('active')
  const [headerTarget, setHeaderTarget] = useState(null)
  useEffect(() => {
    setHeaderTarget(document.getElementById('os-manufacturing-header-tools'))
  }, [])
  async function load() {
    setLoading(true); setError(''); setHandoffWarning('')
    try {
      try {
        const sync = await fetch('/api/os/manufacturing', { method: 'POST', headers: await getOsAuthHeaders() })
        if (!sync.ok) {
          const result = await sync.json().catch(() => ({}))
          setHandoffWarning(result.error || 'Automatic handoff is temporarily unavailable.')
        }
      } catch { setHandoffWarning('Automatic handoff could not connect. Existing orders are shown below.') }
      const response = await fetch('/api/os/manufacturing', { headers: await getOsAuthHeaders(), cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      setRecords(payload.records)
      setPendingHandoffs(payload.pendingHandoffs || [])
      setHistoricalProjects(payload.historicalProjects || [])
    } catch (failure) { setError(failure.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  useEffect(() => {
    if (selectedId) return
    const refresh = () => { load() }
    const visible = () => { if (document.visibilityState === 'visible') load() }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', visible)
    return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible) }
  }, [selectedId])
  const selected = records.find((r) => r.id === selectedId)
  if (selected) return <OrderWorkspace key={selected.id} order={selected} records={records} onBack={() => setSelectedId('')} onOrderUpdated={(updated) => setRecords(current => current.map(row => row.id === updated.id ? { ...row, ...updated } : row))} onSaved={(row) => setRecords((current) => current.map((order) => order.id === row.order_id ? { ...order, status: row.data.deliveryDate ? 'delivered' : order.status, operations: row } : order))} />
  const withState = records.map((order) => ({ order, summary: summarizeOperations(order, order.operations?.data || emptyOperations(order)) }))
  const active = withState.filter(({ summary }) => !['closed','delivered'].includes(summary.stage))
  const shown = withState.filter(({ order, summary }) => (filter === 'all' || filter === 'active' ? filter === 'all' || !['closed','delivered'].includes(summary.stage) : summary.stage === filter) && `${order.order_number} ${order.accepted_by_name} ${order.quote_snapshot?.title}`.toLowerCase().includes(query.toLowerCase()))
  const headerTools = (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <input type="search" value={query} onChange={event => setQuery(event.target.value)}
        placeholder="Find client, order number or structure…" aria-label="Search manufacturing orders"
        className="min-h-9 min-w-0 flex-1 basis-52 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" />
      <select aria-label="Manufacturing stage" value={filter} onChange={event => setFilter(event.target.value)}
        className="min-h-9 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm">
        <option value="active">Active orders</option>
        <option value="all">All orders</option>
        {Object.entries(JOB_STAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <button type="button" disabled={loading} onClick={load}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
        <RefreshCw size={14} aria-hidden="true" className={loading ? 'animate-spin' : undefined} /> Refresh orders
      </button>
    </div>
  )

  return <section aria-label="Direct customer orders" className="space-y-4">
    {headerTarget ? createPortal(headerTools, headerTarget) : headerTools}
    {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{error} Existing commercial and AFGRI controls remain below.</p>}
    {handoffWarning && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{handoffWarning}</p>}
    {!loading && pendingHandoffs.length > 0 && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h3 className="font-bold text-amber-950">Acceptance needs attention · {pendingHandoffs.length}</h3><p className="mt-2 text-sm leading-6 text-amber-900">Accepted quotes arrive here automatically. These leads need their acceptance checked in CRM; you do not need to select won quotes again in Manufacturing.</p><div className="mt-3 flex flex-wrap gap-2">{pendingHandoffs.map(lead=><Link key={lead.id} href={`/os/crm?leadId=${lead.id}`} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-950">{[lead.name,lead.last_name].filter(Boolean).join(' ')} → CRM</Link>)}</div></section>}

    {!loading && !error && filter === 'all' && historicalProjects.length > 0 && <section className={panel}><h3 className="font-bold text-slate-900">Historical projects · Completed</h3><p className="mt-2 text-sm text-slate-500">Confirmed by Marco. Detailed historic payments, costs and milestone dates have not been reconstructed.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{historicalProjects.filter(project => `${project.lead?.name || ''} ${project.lead?.last_name || ''}`.toLowerCase().includes(query.toLowerCase())).map(project => <Link key={project.lead_id} href={`/os/crm?leadId=${project.lead_id}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm"><span className="font-semibold">{[project.lead?.name, project.lead?.last_name].filter(Boolean).join(' ') || 'Historical project'}</span><span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />Completed</span></Link>)}</div></section>}
    <div className="grid gap-3 sm:grid-cols-3"><Stat label="Active orders" value={loading || error ? '—' : active.length} /><Stat label="Awaiting engineering" value={loading || error ? '—' : active.filter(({ summary }) => summary.stage === 'engineering').length} /><Stat label="Ready for dispatch" value={loading || error ? '—' : active.filter(({ summary }) => summary.stage === 'dispatch').length} /></div>
    {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading manufacturing orders…</p> : !shown.length && !error ? <div className={`${panel} py-12 text-center`}><Package className="mx-auto text-slate-300" /><h3 className="mt-3 font-bold text-slate-800">{records.length ? 'No orders match this view' : 'Accepted orders will appear here'}</h3><p className="mt-2 text-sm text-slate-500">Each job starts with the client’s accepted quote and a 75% deposit requirement.</p></div> : <div className="grid gap-4 xl:grid-cols-2">{shown.map(({ order, summary }) => <button key={order.id} className={`${panel} text-left transition hover:border-blue-300 hover:shadow-md`} onClick={() => setSelectedId(order.id)}><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs text-slate-500">{order.order_number}</span><div className="flex flex-wrap gap-2">{order.status!=="cancelled" && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Won quote</span>}<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{JOB_STAGES[summary.stage]}</span></div></div><h3 className="mt-4 text-lg font-bold text-slate-900">{order.accepted_by_name}</h3><p className="mt-1 text-sm text-slate-500">{order.quote_snapshot?.title}</p><ManufacturingProgress order={order} compact /><div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-3"><ArrowRight className="mt-0.5 shrink-0 text-blue-600" size={16} /><p className="text-sm leading-6 text-slate-700">{summary.next}</p></div><div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>Owner: {order.operations?.data.owner || 'info@smartsteel.co.za'}</span><span>{order.operations?.data.baseline.locked ? 'Cost baseline locked' : 'Cost baseline not recorded'}</span></div></button>)}</div>}
  </section>
}

function Ledger({ title, entries, onChange, invoices = false }) {
  return <div className="mt-5"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold text-slate-900">{title}</h4><button type="button" className="inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-blue-700" onClick={() => onChange([...entries, { amount: null, date: todaySast(), reference: '', ...(invoices ? { vatRate: 15 } : { kind: 'payment' }) }])}><Plus size={14} />Add {invoices ? 'invoice' : 'payment / refund'}</button></div>
    {!entries.length && <p className="mt-2 text-xs text-slate-400">Nothing recorded yet.</p>}
    <div className="mt-2 space-y-3">{entries.map((entry, index) => { const patch = (key, value) => onChange(entries.map((row, i) => i === index ? { ...row, [key]: value } : row)); return <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="grid gap-3 sm:grid-cols-2"><Field label={invoices ? 'Invoice cost excl. VAT · R' : 'Amount incl. VAT · R'} type="number" value={entry.amount} onChange={(v) => patch('amount', v)} /><Field label="Date" type="date" value={entry.date} onChange={(v) => patch('date', v)} /><Field label={invoices ? 'Invoice number / reference' : 'Payment evidence / reference'} value={entry.reference} onChange={(v) => patch('reference', v)} /><label className="text-xs font-semibold text-slate-600">{invoices ? 'VAT on this invoice' : 'Entry type'}<select className={input} value={invoices ? entry.vatRate : entry.kind} onChange={(e) => patch(invoices ? 'vatRate' : 'kind', invoices ? Number(e.target.value) : e.target.value)}>{invoices ? <><option value={15}>15%</option><option value={0}>No VAT</option></> : <><option value="payment">Payment</option><option value="refund">Refund</option></>}</select></label></div><button type="button" aria-label={`Remove ${invoices ? 'invoice' : 'payment'} ${index + 1}`} className="mt-2 inline-flex min-h-10 items-center gap-1 text-xs text-rose-700" onClick={() => onChange(entries.filter((_, i) => i !== index))}><Trash2 size={13} />Remove entry</button></div> })}</div>
  </div>
}

function SupplierCard({ supplier, onChange, costsOnly = false }) {
  const hasQuote = supplier.name.trim() && supplier.quoteReference.trim() && supplier.quotedCost !== null
  const gross = supplier.invoices.reduce((sum,invoice)=>sum+Number(invoice.amount||0)*(1+invoice.vatRate/100),0)
  return <section className={panel}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">{supplier.label || COST_CATEGORIES[supplierCategory(supplier)]}</h3><Check label="Required for this order" value={supplier.required} onChange={required=>onChange({required})} /></div>
    {supplierCategory(supplier) === 'sheeting' && <p className="mt-2 text-xs text-slate-500">Includes flashings and roofing screws. Record their cost here once.</p>}
    {supplierCategory(supplier) === 'other' && <p className="mt-2 text-xs text-slate-500">Installation, foundations, delivery or other project expenses. These services do not block material dispatch.</p>}
    {supplier.required ? <>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Supplier name" value={supplier.name} onChange={name=>onChange({name})} /><Field label="Quote number / reference" value={supplier.quoteReference} onChange={quoteReference=>onChange({quoteReference})} /><Field label="Quoted amount excl. VAT · R" type="number" value={supplier.quotedCost} onChange={quotedCost=>onChange({quotedCost})} />{!costsOnly && <Field label="Expected ready date (optional)" type="date" value={supplier.expectedDate} onChange={expectedDate=>onChange({expectedDate})} />}</div>
      {!hasQuote && <p className="mt-3 text-xs leading-5 text-slate-500">Add the supplier, quote reference and amount. The status changes to “Quote received” automatically.</p>}
      <details className="mt-5 rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold">Supplier invoices & payments{supplier.invoices.length || supplier.payments.length ? ` · ${supplier.invoices.length} invoices / ${supplier.payments.length} payments` : ' · add later'}</summary><p className="mt-3 text-xs leading-5 text-slate-500">A quote is not an invoice. Add invoices and cleared payments here when received or paid.</p><Ledger title="Actual supplier invoices" invoices entries={supplier.invoices} onChange={invoices=>onChange({invoices})} /><Ledger title="Supplier payments" entries={supplier.payments} onChange={payments=>onChange({payments})} />{(supplier.invoices.length > 0 || supplier.payments.length > 0) && <div className="mt-4 grid gap-3 sm:grid-cols-2"><Stat label="Invoices incl. VAT" value={money(roundMoney(gross))} /><Stat label="Invoice balance incl. VAT" value={money(roundMoney(gross-paymentTotal(supplier.payments)))} /></div>}</details>
      {!costsOnly && <details className="mt-3 rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold">Order / work progress{['ordered','manufacturing','ready'].includes(supplier.status) ? ` · ${SUPPLIER_STAGES[supplier.status]}` : ' · when placed'}</summary><p className="mt-3 text-xs leading-5 text-slate-500">Record what has happened with this supplier. Production release is a separate action in the Project tab.</p><label className="mt-3 block text-xs font-semibold text-slate-600">Supplier stage<select className={input} value={supplier.status} onChange={event=>onChange({status:event.target.value})}>{Object.entries(SUPPLIER_STAGES).map(([key,label])=><option key={key} value={key}>{supplierCategory(supplier) === 'other' && key === 'manufacturing' ? 'Work in progress' : supplierCategory(supplier) === 'other' && key === 'ready' ? 'Work complete' : label}</option>)}</select></label></details>}
      {!costsOnly && supplier.expectedDate && supplier.expectedDate < todaySast() && supplier.status !== 'ready' && <p className="mt-3 text-xs font-semibold text-amber-800">Expected ready date has passed — follow up with the supplier.</p>}
    </> : <p className="mt-3 text-sm text-slate-500">This entry is not included in the order costs or readiness checks.</p>}
  </section>
}

function OrderWorkspace({ order, records, onBack, onSaved, onOrderUpdated }) {
  const [draft, setDraft] = useState(() => prefillManufacturingAllowances(order))
  const [saved, setSaved] = useState(() => JSON.stringify(order.operations?.data || emptyOperations(order)))
  const [tab, setTab] = useState('overview')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [note, setNote] = useState('')
  const [events, setEvents] = useState(null)
  const [showOrderTools, setShowOrderTools] = useState(false)
  const [addCategory, setAddCategory] = useState('structure')
  const dirty = JSON.stringify(draft) !== saved || !!note.trim()
  const needsCorrectionNote = requiresManufacturingCorrectionNote(order.operations?.data, draft)
  const closed = ['complete','cancelled'].includes(order.status)
  const state = summarizeOperations(order, draft)
  const costRows = costComparison(draft)
  const projection = projectOrderProfit(order, costRows)
  const margin = projection.profit != null && projection.revenue > 0
    ? 100 * projection.profit / projection.revenue
    : null
  const patch = (key, value) => setDraft((old) => ({ ...old, [key]: value }))
  const engineering = (key, value) => patch('engineering', { ...draft.engineering, ...(['reference','revision','url','applicability'].includes(key) ? { matchConfirmed: false, status: 'pending' } : {}), [key]: value })
  const updateSupplier = (index, changes) => setDraft(old => ({ ...old, suppliers: old.suppliers.map((supplier, i) => {
    if (i !== index) return supplier
    const next = { ...supplier, ...changes }
    if (['pending','requested'].includes(next.status) && next.name.trim() && next.quoteReference.trim() && next.quotedCost !== null) next.status = 'quoted'
    return next
  }) }))
  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    const guard = (e) => { const a = e.target.closest?.('a[href]'); if (dirty && a && a.target !== '_blank' && !window.confirm('Leave without saving this manufacturing update?')) { e.preventDefault(); e.stopPropagation() } }
    window.addEventListener('beforeunload', warn); document.addEventListener('click', guard, true)
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', guard, true) }
  }, [dirty])
  async function save(event) {
    event.preventDefault(); if (busy) return
    if (needsCorrectionNote && note.trim().length < 5) { setError('Add a short reason for correcting an existing payment or invoice.'); return }
    if (draft.baseline.locked && !order.operations?.data.baseline.locked && !window.confirm('Lock this original cost allowance? It cannot be overwritten after saving.')) return
    if (draft.deliveryDate && !order.operations?.data.deliveryDate && !window.confirm('Confirm this order has been delivered and the evidence is correct?')) return
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/os/manufacturing', { method: 'PUT', headers: await getOsAuthHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ id: order.id, revision: order.operations?.revision || 0, data: draft, note: note.trim() || manufacturingUpdateNote(order.operations?.data, draft) }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      onSaved(payload.record); setDraft(structuredClone(payload.record.data)); setSaved(JSON.stringify(payload.record.data)); setNote(''); setNotice('Update saved.'); setEvents(null)
    } catch (failure) { setError(failure.message); window.scrollTo({ top: 0, behavior: 'smooth' }) } finally { setBusy(false) }
  }
  async function history() {
    setTab('history'); setError('')
    try { const response = await fetch(`/api/os/manufacturing?orderId=${order.id}`, { headers: await getOsAuthHeaders(), cache: 'no-store' }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setEvents(payload.events) } catch (failure) { setError(failure.message) }
  }
  const reuse = records.filter((r) => r.id !== order.id && r.operations?.data.engineering.status === 'approved' && !['cancelled'].includes(r.status))
  const original = order.operations?.data.baseline
  return <div className="space-y-5">
    <button type="button" disabled={busy} className={secondary} onClick={() => { if (!dirty || window.confirm('Leave without saving your changes?')) onBack() }}><ArrowLeft size={16} />All manufacturing orders</button>
    <section className="rounded-3xl bg-[radial-gradient(ellipse_at_top_right,#164569_0%,#001d2e_65%)] p-5 text-white shadow-lg shadow-slate-900/10 sm:p-7"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-sky-200">{order.order_number} · Accepted quote V{order.quote_snapshot?.version_no}</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{order.accepted_by_name}</h2><p className="mt-2 text-sm text-slate-300">{order.quote_snapshot?.title}</p></div><span className="inline-flex h-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold"><span aria-hidden="true" className="size-1.5 rounded-full bg-sky-300" />{JOB_STAGES[state.stage]}{dirty ? ' · unsaved preview' : ''}</span></div>
      <ManufacturingProgress order={order} data={draft} preview={dirty} embedded />
      <p className="mt-4 flex items-start gap-2 text-sm leading-5 text-sky-100"><ArrowRight aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-sky-300" />{state.next}</p>
    </section>
    {draft.allowanceBasis && !draft.baseline.locked && <button type="button" className="text-left text-sm font-semibold text-blue-700" onClick={()=>setTab('costs')}>Atlas allowances prepared · review cost comparison →</button>}
    <nav className="flex w-fit max-w-full flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1" aria-label="Manufacturing order sections">{[['overview','Project'],['suppliers','Supplier quotes & orders'],['dispatch','Delivery'],['costs','Cost comparison'],['history','History']].map(([key,label]) => <button type="button" key={key} onClick={() => key === 'history' ? history() : setTab(key)} className={`rounded-full px-4 py-2.5 text-xs font-semibold ${(tab === key || key === 'overview' && ['payments','engineering'].includes(tab)) ? 'bg-white text-[#001d2e] shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/70'}`}>{label}</button>)}</nav>
    {['payments','engineering'].includes(tab) && <button type="button" className="text-sm font-semibold text-blue-700" onClick={()=>setTab('overview')}>← Back to project</button>}
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}{notice && <p role="status" className="text-sm font-semibold text-emerald-700">{notice}</p>}
    {draft.quoteRevisionReview?.required && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Won quote updated to V{draft.quoteRevisionReview.version}. Review the invoice, specifications, drawings and supplier scope. Existing payments and supplier records have been retained.</p>}
    {closed && <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">This order is {order.status}. Its manufacturing record is read-only.</p>}
    <form onSubmit={save}><fieldset disabled={busy || closed} className="min-w-0 space-y-5">
    {tab === 'overview' && <>
      <div className="grid gap-3 sm:grid-cols-3"><Stat label="Accepted order incl. VAT" value={money(state.total)} /><Stat label="Client receipts recorded" value={money(state.received)} /><Stat label="Client balance" value={money(state.balance)} /></div>
      <section className={panel}><h3 className="text-lg font-bold">What would you like to record?</h3><p className="mt-2 text-sm leading-6 text-slate-500">Add the information you have now. Future steps can wait.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={()=>setTab('suppliers')} className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-left"><span className="block text-sm font-bold text-blue-900">Supplier quote received →</span><span className="mt-1 block text-xs leading-5 text-blue-800">Supplier, quote number and amount excl. VAT. That’s all you need to record a quote.</span></button>
        <button type="button" onClick={()=>setTab('payments')} className="rounded-xl border border-slate-200 p-4 text-left"><span className="block text-sm font-bold">Client payment →</span><span className="mt-1 block text-xs leading-5 text-slate-500">{state.depositOutstanding <= .005 ? '75% deposit already recorded. Add a receipt only when another payment clears.' : 'Record a cleared receipt and bank reference.'}</span></button>
        <button type="button" onClick={()=>setTab('engineering')} className="rounded-xl border border-slate-200 p-4 text-left"><span className="block text-sm font-bold">Drawings →</span><span className="mt-1 block text-xs leading-5 text-slate-500">{draft.engineering.reference || 'No drawing set recorded'}{draft.engineering.revision ? ` · Rev ${draft.engineering.revision}` : ''} · {draft.engineering.status === 'approved' ? 'Approved' : draft.engineering.status === 'drafting' ? 'Being finalised' : 'Not yet approved'}</span></button>
        <button type="button" onClick={()=>setTab('dispatch')} className="rounded-xl border border-slate-200 p-4 text-left"><span className="block text-sm font-bold">Delivery preparation →</span><span className="mt-1 block text-xs leading-5 text-slate-500">Quality, packing and proof of delivery, when the order is ready.</span></button>
      </div></section>
      <ManufacturingOrderSetup order={order} data={draft} dirty={dirty} onUpdated={onOrderUpdated} />
      <div><button type="button" disabled={dirty || busy} onClick={()=>setShowOrderTools(value=>!value)} className="min-h-10 text-xs font-semibold text-slate-500 underline underline-offset-4">{showOrderTools ? 'Hide other order actions' : 'Other order actions · close, cancel or resend confirmation'}</button></div>
      <details className={panel}><summary className="cursor-pointer text-sm font-bold">Project notes & responsibility</summary><div className="mt-4"><Field label="Responsible person / email" value={draft.owner} onChange={value=>patch('owner',value)} /></div><label className="mt-4 block text-xs font-semibold text-slate-600">Notes and dependencies<textarea rows={3} maxLength={8000} className={input} value={draft.notes} onChange={event=>patch('notes',event.target.value)} /></label><div className="mt-4 flex flex-wrap gap-3"><Link href={`/os/crm?leadId=${encodeURIComponent(order.lead_id)}`} className={secondary}>Open client / invoice</Link>{order.quote_snapshot?.share_token && <Link href={`/quotes/${order.quote_snapshot.share_token}`} target="_blank" rel="noreferrer" className={secondary}><FileText size={16} />Accepted quote</Link>}</div></details>
    </>}
    {tab === 'payments' && <section className={panel}><h3 className="text-lg font-bold">Client receipts</h3><p className="mt-2 text-sm leading-6 text-slate-500">Standard terms: 75% before engineering, remaining 25% before delivery. Record cleared amounts, not an invoice merely issued. All amounts here include VAT.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><Stat label="Deposit still due" value={money(state.depositOutstanding)} /><Stat label="Received to date" value={money(state.received)} /><Stat label="Balance before delivery" value={money(state.balance)} /></div><Ledger title="Payments and refunds" entries={draft.payments} onChange={(v) => patch('payments', v)} /><p className="mt-4 text-xs text-slate-500">A payment does not send an email or initiate a bank transaction. Corrections are retained in update history.</p></section>}
    {tab === 'engineering' && <section className={panel}><h3 className="text-lg font-bold">Drawing set for this order</h3><p className="mt-2 text-sm leading-6 text-slate-500">Stefan finalises the applicable drawings after the deposit. A repeat order can use an approved set once its specification and revision are checked.</p>{reuse.length > 0 && <label className="mt-4 block text-xs font-semibold text-slate-600">Reuse a drawing reference from an approved order<select className={input} defaultValue="" onChange={(event) => { const source = reuse.find((r) => r.id === event.target.value); if (source) patch('engineering', { ...source.operations.data.engineering, owner: 'stefan@smartsteel.co.za', status: 'pending', reusedFrom: source.order_number, matchConfirmed: false }) }}><option value="">Choose an approved drawing set…</option>{reuse.map((r) => <option key={r.id} value={r.id}>{r.order_number} · {r.operations.data.engineering.reference} · Rev {r.operations.data.engineering.revision}</option>)}</select></label>}<div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Drawing owner" value={draft.engineering.owner} onChange={(v) => engineering('owner',v)} /><label className="text-xs font-semibold text-slate-600">Engineering progress<select className={input} value={draft.engineering.status} onChange={(e) => engineering('status',e.target.value)}><option value="pending">Awaiting deposit / preparation</option><option value="drafting">Finalising drawings</option><option value="approved">Approved for this order</option></select></label><Field label="Drawing set reference" value={draft.engineering.reference} onChange={(v) => engineering('reference',v)} /><Field label="Revision" value={draft.engineering.revision} onChange={(v) => engineering('revision',v)} /><Field label="Secure drawing link (optional)" type="url" value={draft.engineering.url} onChange={(v) => engineering('url',v)} hint="Link to the controlled drawing file. Access is managed where the file is stored." /><Field label="Applicable specification" value={draft.engineering.applicability} onChange={(v) => engineering('applicability',v)} hint="Dimensions, member profiles, enclosure and relevant design conditions." /></div>{draft.engineering.reusedFrom && <p className="mt-4 text-xs text-blue-700">Reference copied from {draft.engineering.reusedFrom}. Order suitability still requires confirmation.</p>}<div className="mt-5"><Check label="The drawing reference and revision match this order’s accepted specification and are approved for manufacture." value={draft.engineering.matchConfirmed} onChange={(v) => engineering('matchConfirmed',v)} /></div>{draft.engineering.url && /^https:\/\//i.test(draft.engineering.url) && <a target="_blank" rel="noreferrer" className={`${secondary} mt-4`} href={draft.engineering.url}>Open drawing file</a>}</section>}
    {tab === 'suppliers' && <div className="space-y-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">Enter the supplier, quote reference and amount, then save. For actual costs, open Supplier invoices & payments and add the invoice amount excl. VAT. Update the supplier stage only when it changes.</div>
      {draft.quoteRevisionReview && <section className={panel}><Check label={`Supplier prices, orders and scope reviewed against accepted V${draft.quoteRevisionReview.version}.`} value={!draft.quoteRevisionReview.required} onChange={value => patch('quoteRevisionReview', {...draft.quoteRevisionReview, required: !value})} /></section>}
      {Object.entries(COST_CATEGORIES).map(([category, label]) => <div key={category} className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h3>
        {draft.suppliers.map((supplier, index) => supplierCategory(supplier) === category ? <SupplierCard key={supplier.key} supplier={supplier} onChange={changes=>updateSupplier(index,changes)} /> : null)}
        {!draft.suppliers.some(s => supplierCategory(s) === category) && <button type="button" className={secondary} onClick={() => patch('suppliers', [...draft.suppliers, createSupplier(category, `${category}-${crypto.randomUUID()}`)])}><Plus size={14} />Add {label.toLowerCase()}</button>}
      </div>)}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"><label className="text-xs font-semibold text-slate-600">Additional supplier / service<select className={input} value={addCategory} onChange={e=>setAddCategory(e.target.value)}>{Object.entries(COST_CATEGORIES).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><button type="button" className={secondary} disabled={draft.suppliers.length >= 50} onClick={()=>patch('suppliers',[...draft.suppliers,createSupplier(addCategory,`${addCategory}-${crypto.randomUUID()}`)])}><Plus size={14} />Add supplier</button></div>
    </div>}
    {tab === 'costs' && <>
      <section className={panel}>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 text-[#001d2e] sm:p-6">
            <p className="text-sm font-semibold text-slate-600">Projected job profit · excl. VAT</p>
            <p className="mt-2 break-words text-3xl font-bold tracking-tight tabular-nums sm:text-5xl">
              {projection.profit == null ? 'Awaiting figures' : money(projection.profit)}
            </p>
            {margin != null && <p className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${margin < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {margin.toLocaleString('en-ZA', { maximumFractionDigits: 1 })}% projected margin
            </p>}
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 sm:p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                <dt className="text-slate-600">Accepted order excl. VAT</dt><dd className="font-bold tabular-nums">{money(projection.revenue)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                <dt className="text-slate-600">Projected costs excl. VAT</dt><dd className="font-bold tabular-nums">{money(projection.cost)}</dd>
              </div>
            </dl>
            {margin != null && <div className="mt-4">
              <div aria-hidden="true" className={`h-2.5 overflow-hidden rounded-full ${margin < 0 ? 'bg-rose-500' : 'bg-emerald-400'}`}>
                {margin >= 0 && <div className="h-full bg-[#0043f3]" style={{ width: `${Math.max(0, Math.min(100, 100 - margin))}%` }} />}
              </div>
              {margin < 0
                ? <p className="mt-2 text-xs text-rose-800">Projected costs exceed the accepted order value</p>
                : <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-[#0043f3]" />Costs</span>
                    <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-emerald-400" />Projected profit</span>
                  </div>}

            </div>}
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Uses supplier quotes when all quotes in a category are entered and the allowance while quotes are pending. Invoices raise the projection when recorded costs exceed the estimate.
        </p>
        {projection.missing.length > 0 && <p className="mt-1 text-xs text-amber-800">Add a cost or allowance for {projection.missing.join(', ')} to show the profit.</p>}
      </section>
      <section className={panel}>
        <h3 className="text-lg font-bold">Record supplier costs</h3>
        <p className="mt-1 text-sm text-slate-500">Enter supplier quotes or add invoice amounts below. The comparison updates as you type. All costs exclude VAT.</p>
        <div className="mt-4 space-y-2">
          {Object.entries(COST_CATEGORIES).map(([category, label]) => {
            const suppliers = draft.suppliers.filter(supplier => supplierCategory(supplier) === category && supplier.required)
            const quotes = suppliers.filter(supplier => supplier.quotedCost != null)
            const invoices = suppliers.flatMap(supplier => supplier.invoices)
            const quoted = quotes.reduce((total, supplier) => total + supplier.quotedCost, 0)
            const invoiced = invoices.reduce((total, invoice) => total + Number(invoice.amount || 0), 0)

            return (
              <details key={category} className="group overflow-hidden rounded-xl border border-slate-200 open:border-blue-200">
                <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 group-open:bg-blue-50 [&::-webkit-details-marker]:hidden">
                  <span className="flex flex-1 items-center gap-3 text-sm font-bold text-[#001d2e]">
                    <ChevronDown aria-hidden="true" size={16} className="shrink-0 -rotate-90 text-blue-700 transition-transform group-open:rotate-0 motion-reduce:transition-none" />
                    {label}
                  </span>
                  <span className="flex flex-wrap gap-2 pl-7 text-xs tabular-nums sm:pl-0">
                    {quotes.length > 0 && <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-900">{quotes.length < suppliers.length ? 'Quoted so far' : 'Quoted'} <strong>{money(quoted)}</strong></span>}
                    {invoices.length > 0 && <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-900">Invoiced <strong>{money(invoiced)}</strong></span>}
                    {!quotes.length && !invoices.length && <span className="px-2 py-1 text-slate-500">No costs entered</span>}
                  </span>
                </summary>
                <div className="space-y-3 border-t border-blue-100 bg-slate-50 p-3 sm:p-4">
                  {draft.suppliers.map((supplier, index) => supplierCategory(supplier) === category && (
                    <SupplierCard key={supplier.key} supplier={supplier} costsOnly onChange={changes => updateSupplier(index, changes)} />
                  ))}
                  <button type="button" className={secondary} disabled={draft.suppliers.length >= 50}
                    onClick={() => patch('suppliers', [...draft.suppliers, createSupplier(category, `${category}-${crypto.randomUUID()}`)])}>
                    <Plus size={14} /> Add supplier
                  </button>
                </div>
              </details>
            )
          })}
        </div>
      </section>
      {(draft.allowanceBasis || order.allowanceSuggestion) && <section className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        {(draft.allowanceBasis || order.allowanceSuggestion).available ? <><h3 className="font-semibold">{draft.allowanceBasis ? 'Atlas allowance basis' : 'Atlas cost reference'}</h3><p>{(draft.allowanceBasis || order.allowanceSuggestion).specification}</p><p className="mt-1 text-xs">{(draft.allowanceBasis || order.allowanceSuggestion).basis} · {(draft.allowanceBasis || order.allowanceSuggestion).snapshot.capturedAt.slice(0,10)} · Excl. VAT, before selling uplift.</p><p className="mt-2">{draft.baseline.locked ? 'Your reviewed allowance is locked. This calculation reference is retained for comparison with supplier costs.' : draft.allowanceBasis ? 'Review the amounts below, add other costs (or zero), then lock your budget. Editing allowances does not change Atlas prices.' : 'Your entered allowance has been preserved. This reference has not replaced it.'}</p>{!draft.baseline.locked && (draft.allowanceBasis || order.allowanceSuggestion).warnings.map((warning,i)=><p key={i} className="mt-2 text-amber-900">{warning}</p>)}</> : <p>{order.allowanceSuggestion.message}</p>}
      </section>}
      <details open={!original?.locked} className={panel}><summary className="cursor-pointer text-base font-bold text-slate-900"><span className="inline-flex items-center gap-2"><ShieldCheck size={18} className="text-blue-600" />Original buffered cost allowance{original?.locked ? ` · ${money(state.baseline)} · Locked` : ''}</span></summary><p className="mt-2 text-sm leading-6 text-slate-500">Record the internal cost allowance used for this accepted quote, before selling uplift. Do not replace it with the cheaper supplier quote. All comparisons exclude VAT.</p><p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-900">{original?.locked ? legacyBaseline(draft.baseline) ? 'Original combined allowance preserved. Steel and bracket suppliers are compared together; any supplemental fastener allowance is shown in the comparison below. Do not duplicate costs already included in a supplier quote.' : 'Baseline locked. Supplier changes appear as variances; the original allowance stays intact.' : draft.allowanceBasis ? 'Atlas figures are ready for review. Complete any missing allowance before locking; supplier quotes will be compared against this saved budget.' : 'No verified cost baseline is stored for this order. Enter a manual baseline with its original source. Missing costs are not treated as zero.'}</p><div className="mt-4 grid gap-4 sm:grid-cols-3">{(legacyBaseline(draft.baseline) && original?.locked ? [['structure','Structure & brackets · original combined allowance'],['sheeting','Sheeting & flashings'],['other','Other costs']] : Object.entries(COST_CATEGORIES)).map(([key,label]) => <Field key={key} label={`${label} · R excl. VAT`} type="number" disabled={original?.locked} value={draft.baseline[key]} onChange={(v) => patch('baseline',{...Object.fromEntries(Object.keys(COST_CATEGORIES).map(k=>[k,null])),...draft.baseline,[key]:v})} />)}</div><div className="mt-4"><Field label="Original estimate / cost schedule source" disabled={original?.locked} value={draft.baseline.source} onChange={(v) => patch('baseline',{...draft.baseline,source:v})} hint="Include the document reference and date; label reconstructed historical allowances clearly." /></div><div className="mt-4"><Check disabled={original?.locked} label="Lock this as the original cost baseline on save." value={draft.baseline.locked} onChange={(v) => patch('baseline',{...draft.baseline,locked:v})} /></div></details><section className={panel}><h3 className="text-lg font-bold">Allowance vs supplier costs</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="py-3 pr-3">Workstream</th><th className="p-3">Original allowance</th><th className="p-3">Supplier quotes</th><th className="p-3">Invoiced to date</th><th className="p-3">Allowance less quotes</th></tr></thead><tbody>{costRows.map(row => <tr key={row.key} className="border-b border-slate-100"><th className="py-4 pr-3 font-medium">{row.label}<span className="mt-1 block text-xs font-normal text-slate-500">{row.suppliers.length ? `${row.suppliers.length} supplier / service entries` : 'No supplier costs recorded'}</span></th><td className="p-3">{money(row.allowance)}</td><td className="p-3">{money(row.quoted)}</td><td className="p-3">{money(row.invoiced)}</td><td className="p-3">{row.quoteVariance == null ? 'Not available' : <span className={row.quoteVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{money(row.quoteVariance)}<span className="mt-1 block text-xs">{row.quoteVariance >= 0 ? 'Within allowance' : 'Over allowance'}</span></span>}</td></tr>)}</tbody></table></div><p className="mt-4 text-xs leading-5 text-slate-500">Quote savings are based on the suppliers entered for each category. Invoice totals are shown separately and may be partial.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Stat label="Original total allowance" value={money(state.baseline)} /><Stat label="Supplier commitments so far" value={money(state.committed)} /><Stat label="Invoiced to date excl. VAT" value={state.invoicesComplete ? money(state.invoiced) : `${money(state.invoiced)} · partial / missing invoices`} /><Stat label="Invoiced less committed" value={state.invoicesComplete && state.committed != null ? money(roundMoney(state.invoiced - state.committed)) : 'Not available'} hint="Positive = invoices exceed commitments. Provisional until all supplier invoices are received." /></div></section></>}
    {tab === 'dispatch' && <section className={panel}><h3 className="text-lg font-bold">Ready to leave the factory?</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><Stat label="Required suppliers" value={state.ready ? 'All ready' : 'Not all ready'} /><Stat label="Client balance outstanding" value={money(state.balance)} /></div><div className="mt-5 space-y-4"><Check label="Final quality check completed for all supplied components." value={draft.qualityChecked} onChange={(v) => patch('qualityChecked',v)} /><Check label="Packing, component counts and dispatch labels checked." value={draft.packed} onChange={(v) => patch('packed',v)} /></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Actual delivery / collection date" type="date" disabled={!!order.operations?.data.deliveryDate} value={draft.deliveryDate} onChange={(v) => patch('deliveryDate',v)} /><Field label="Proof of delivery / collection reference" disabled={!!order.operations?.data.deliveryDate} value={draft.deliveryReference} onChange={(v) => patch('deliveryReference',v)} /></div><p className="mt-4 text-xs leading-5 text-slate-500">Only record delivery once it has happened. Saving requires full client payment, approved drawings, supplier readiness, quality and packing checks, plus a linked invoice and confirmed specification.</p></section>}
    {tab === 'history' && <section className={panel}><h3 className="text-lg font-bold">Update history</h3><p className="mt-2 text-xs text-slate-500">Latest 50 saved revisions. Every update retains its full record, author and explanation.</p>{events === null ? <p className="mt-4 text-sm">Loading history…</p> : !events.length ? <p className="mt-4 text-sm text-slate-500">No manufacturing updates saved yet.</p> : <div className="mt-4 space-y-3">{events.map((event) => <details key={event.revision} className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold">Revision {event.revision} · {event.actor}<span className="mt-1 block text-xs font-normal text-slate-500">{new Date(event.created_at).toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg'})} SAST · {event.note}</span></summary><div className="mt-4 space-y-3 text-xs leading-6 text-slate-600"><p><strong>Owner:</strong> {event.data.owner}</p><p><strong>Client receipts incl. VAT:</strong> {money(paymentTotal(event.data.payments))} · {event.data.payments.length} entries</p><p><strong>Drawings:</strong> {event.data.engineering.reference || 'Not recorded'} · {event.data.engineering.revision || 'No revision'} · {event.data.engineering.status}</p><p><strong>Baseline:</strong> {event.data.baseline.locked ? money(baselineTotal(event.data.baseline)) : 'Not locked'} · {event.data.baseline.source}</p>{event.data.suppliers.map((supplier) => <div key={supplier.key} className="rounded-lg bg-slate-50 p-3"><strong>{supplier.name || supplier.label}</strong><p>{supplier.required ? SUPPLIER_STAGES[supplier.status] : 'Not required'} · Committed {money(supplier.quotedCost)}</p>{supplier.invoices.map((invoice,i) => <p key={i}>Invoice {invoice.reference} · {invoice.date} · {money(invoice.amount)} excl. VAT</p>)}{supplier.payments.map((payment,i) => <p key={i}>{payment.kind} · {payment.reference} · {payment.date} · {money(payment.amount)} incl. VAT</p>)}</div>)}<p><strong>Delivery:</strong> {event.data.deliveryDate || 'Not recorded'} · {event.data.deliveryReference}</p>{event.data.notes && <p className="whitespace-pre-wrap">{event.data.notes}</p>}</div></details>)}</div>}</section>}
    {!closed && (dirty || !order.operations) && <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1"><Field label={needsCorrectionNote ? "Reason for correcting a payment or invoice" : "Add a note (optional)"} value={note} onChange={setNote} hint={needsCorrectionNote ? "A short explanation is required for this correction." : "A summary of your changes and your account are recorded automatically."} /></div><button disabled={busy || needsCorrectionNote && note.trim().length < 5 || (!dirty && !!order.operations)} className={primary}><CheckCircle2 size={16} />{busy ? 'Saving…' : tab === 'costs' ? 'Save costs' : tab === 'suppliers' ? 'Save supplier details' : 'Save update'}</button></div><p className="mt-2 text-xs text-slate-500">{dirty ? 'Unsaved changes — figures above are a preview.' : order.operations ? `Saved revision ${order.operations.revision}` : 'Not yet saved. No production or payment actions are triggered automatically.'}</p></div>}
    </fieldset></form>
    {showOrderTools && tab === 'overview' && !dirty && <CustomerOrders orderId={order.id} onUpdated={onOrderUpdated} />}
  </div>
}
