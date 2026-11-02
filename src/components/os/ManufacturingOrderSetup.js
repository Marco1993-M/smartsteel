'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOsAuthHeaders } from '../../lib/osClientAuth'
import { summarizeOperations } from '../../lib/manufacturingOperations.mjs'

const input = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm'
export default function ManufacturingOrderSetup({ order, data, dirty, onUpdated }) {
  const [invoices, setInvoices] = useState([])
  const [note, setNote] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const summary = summarizeOperations(order, data)
  const status = order.status
  useEffect(() => { setNote(''); setInvoiceId(''); setConfirmed(false); setError('') }, [order.id, status])
  useEffect(() => {
    if (status !== 'awaiting_invoice') return
    let active = true
    ;(async () => {
      try {
        const response = await fetch('/api/os/sales-orders', { headers: await getOsAuthHeaders(), cache: 'no-store' })
        const result = await response.json()
        if (!response.ok || result.invoiceWarning) throw new Error(result.error || result.invoiceWarning || 'Invoices could not be loaded.')
        if (active) setInvoices((result.invoices || []).filter(invoice => invoice.lead_id === order.lead_id && invoice.reference_no === order.order_number && Date.parse(invoice.created_at) >= Date.parse(order.specifications_confirmed_at) && Number(invoice.total) > 0))
      } catch (failure) { if (active) setError(failure.message) }
    })()
    return () => { active = false }
  }, [order.id, order.lead_id, order.order_number, order.specifications_confirmed_at, status])
  const action = {
    awaiting_specifications: ['confirm_specifications', 'Confirm client scope'],
    awaiting_invoice: ['link_invoice', 'Link issued client invoice'],
    awaiting_payment: ['confirm_payment', 'Confirm recorded deposit'],
    ready_for_release: ['release_production', 'Approve production release'],
  }[status]
  if (!action) return null
  const savedPayments = order.operations?.data.payments || []
  const automaticNote = status === 'awaiting_payment'
    ? `Cleared client receipts verified: ${savedPayments.map(payment => `${payment.reference} (${payment.amount})`).join('; ')}`
    : `Approved manufacturing drawing ${data.engineering.reference}, revision ${data.engineering.revision}`
  const blocked = dirty || status === 'awaiting_payment' && summary.depositOutstanding > .005
  async function run() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/os/sales-orders', { method: 'PATCH', headers: await getOsAuthHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ id: order.id, expectedStatus: status, action: action[0], confirmed: true, invoiceId, note: ['awaiting_payment','ready_for_release'].includes(status) ? automaticNote : note }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save this confirmation.')
      onUpdated(result.record)
    } catch (failure) { setError(failure.message) } finally { setBusy(false) }
  }
  return <details className="rounded-2xl border border-slate-200 bg-white p-5" open={undefined}>
    <summary className="cursor-pointer text-sm font-bold text-slate-900">Client order setup · {action[1]}</summary>
    <p className="mt-3 text-xs leading-6 text-slate-500">These confirmations are needed before a supplier order is placed. You can record a supplier quotation now.</p>
    {status === 'awaiting_specifications' && <label className="mt-3 block text-xs font-semibold text-slate-600">Agreed scope, site details and client confirmation<textarea rows={3} minLength={10} maxLength={4000} value={note} onChange={event => setNote(event.target.value)} className={input} /></label>}
    {status === 'awaiting_invoice' && <><p className="mt-3 text-xs leading-6 text-slate-500">Select the issued invoice with reference {order.order_number}. <Link href={`/os/crm?leadId=${order.lead_id}`} className="font-semibold text-blue-700">Open client invoicing →</Link></p><label className="mt-2 block text-xs font-semibold">Issued invoice<select className={input} value={invoiceId} onChange={event=>setInvoiceId(event.target.value)}><option value="">Choose an invoice…</option>{invoices.map(invoice=><option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · R {Number(invoice.total).toLocaleString('en-ZA')}</option>)}</select></label></>}
    {status === 'awaiting_payment' && <p className="mt-3 text-sm text-slate-600">Verify the cleared receipts already recorded under Client payments. No amount needs to be entered again.</p>}
    {status === 'ready_for_release' && <p className="mt-3 text-sm leading-6 text-slate-600">Release uses the saved drawing reference and supplier progress. The production checks still apply.</p>}
    {dirty && <p className="mt-3 text-xs text-amber-800">Save your project changes before confirming this step.</p>}
    {status === 'awaiting_payment' && summary.depositOutstanding > .005 && <p className="mt-3 text-xs text-amber-800">Record the cleared 75% deposit under Client payments first.</p>}
    <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600"><input type="checkbox" className="mt-0.5" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} />{status === 'awaiting_specifications' ? 'The client confirmed this scope, delivery and access details. The accepted price and scope are unchanged.' : status === 'awaiting_invoice' ? 'This invoice has been sent to the client.' : 'I have checked the saved evidence and confirm this step.'}</label>
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    <button type="button" onClick={run} disabled={busy || blocked || !confirmed || status === 'awaiting_specifications' && note.trim().length < 10 || status === 'awaiting_invoice' && !invoiceId} className="mt-4 min-h-11 rounded-xl bg-[#0043f3] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">{busy ? 'Saving…' : action[1]}</button>
  </details>
}
