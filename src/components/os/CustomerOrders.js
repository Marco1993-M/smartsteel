'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getOsAuthHeaders } from '../../lib/osClientAuth'
import { SALES_ORDER_STAGES } from '../../lib/quoteAcceptance.mjs'

const ACTIONS = {
  awaiting_specifications: ['confirm_specifications', 'Confirm specifications', 'Record the agreed dimensions, scope, delivery address, site access and how/when the client confirmed. If scope or price changes, cancel this order and issue a new quote version for acceptance.'],
  awaiting_invoice: ['link_invoice', 'Confirm invoice issued', 'Create and send the invoice through the CRM, then select it below. Set the invoice reference to this order number exactly. Only invoices created after specification confirmation will appear.'],
  awaiting_payment: ['confirm_payment', 'Record payment / credit clearance', 'Record the received deposit/payment reference or authorised credit approval. Do not clear this based only on an invoice being sent.'],
  ready_for_release: ['release_production', 'Approve manufacturing', 'Check the specifications, payment clearance and manufacturing information. Enter the approved drawing or manufacturing pack reference.'],
  in_production: ['ready_for_dispatch', 'Mark ready for dispatch', 'Confirm the order has passed quality and packing checks.'],
  ready_for_dispatch: ['delivered', 'Confirm delivery', 'Record the delivery confirmation.'],
  delivered: ['complete', 'Complete order', 'Confirm all order obligations have been completed.'],
}
const button = 'rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold disabled:opacity-50'
export default function CustomerOrders() {
  const [records, setRecords] = useState([])
  const [invoices, setInvoices] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [showClosed, setShowClosed] = useState(false)
  async function load() {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/os/sales-orders', { headers: await getOsAuthHeaders(), cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      setRecords(payload.records); setInvoices(payload.invoices)
      if (payload.invoiceWarning) setError(payload.invoiceWarning)
    } catch (failure) { setError(failure.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  async function update(order, action, note, invoiceId) {
    setSaving(order.id); setError('')
    try {
      const response = await fetch('/api/os/sales-orders', { method: 'PATCH', headers: await getOsAuthHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ id: order.id, expectedStatus: order.status, action, note, invoiceId, confirmed: true }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not update order.')
      await load()
      return true
    } catch (failure) { setError(failure.message); return false }
    finally { setSaving('') }
  }
  const shown = records.filter((order) => showClosed || !['cancelled', 'complete'].includes(order.status))
  return <section className="rounded-2xl border border-sky-200 bg-white p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-sky-700">Direct customer orders</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Accepted quotes → manufacturing</h2><p className="mt-2 text-sm text-slate-600">Orders remain on hold until specifications, invoicing, payment clearance and production approval are recorded.</p></div><button className={button} disabled={loading} onClick={load}>Refresh customer orders</button></div><label className="mt-4 flex gap-2 text-sm text-slate-600"><input type="checkbox" checked={showClosed} onChange={(event) => setShowClosed(event.target.checked)} />Include completed and cancelled orders</label>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <p className="py-8 text-sm text-slate-500">Loading customer orders…</p> : !shown.length ? <p className="py-8 text-sm text-slate-500">No customer orders in this view.</p> : <div className="mt-5 space-y-4">{shown.map((order) => <OrderCard key={`${order.id}-${order.status}`} order={order} invoices={invoices.filter((invoice) => invoice.lead_id === order.lead_id && Date.parse(invoice.created_at) >= Date.parse(order.specifications_confirmed_at) && invoice.reference_no === order.order_number && Number(invoice.total) > 0)} saving={saving === order.id} onUpdate={update} />)}</div>}</section>
}
function OrderCard({ order, invoices, saving, onUpdate }) {
  const [note, setNote] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const quote = order.quote_snapshot
  const action = ACTIONS[order.status]
  const canCancel = ['awaiting_specifications', 'awaiting_invoice', 'awaiting_payment', 'ready_for_release'].includes(order.status)
  const run = (event) => { event.preventDefault(); onUpdate(order, cancelling ? 'cancel' : action[0], note, invoiceId) }
  return <article className="rounded-xl border border-slate-200 p-4 sm:p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-mono text-xs font-bold text-sky-700">{order.order_number}</p><h3 className="mt-2 text-lg font-bold">{quote.title} · V{quote.version_no}</h3><p className="mt-1 text-sm text-slate-600">Accepted by {order.accepted_by_name} · {new Date(order.accepted_at).toLocaleString('en-ZA')}</p><p className="mt-1 text-sm text-slate-600">R {(Number(quote.total) * 1.15).toLocaleString('en-ZA', { maximumFractionDigits: 2 })} incl. VAT{order.po_reference ? ` · PO ${order.po_reference}` : ''}</p></div><span className="h-fit rounded-full bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900">{SALES_ORDER_STAGES[order.status]}</span></div><div className="mt-4 flex flex-wrap gap-2"><Link className={button} href={`/os/crm?leadId=${encodeURIComponent(order.lead_id)}`}>Open client / issue invoice</Link><Link className={button} href={`/quotes/${quote.share_token}`} target="_blank" rel="noreferrer">View accepted quote</Link>{!order.confirmation_sent_at && order.status !== 'cancelled' && <button className={button} disabled={saving} onClick={() => onUpdate(order, 'retry_confirmation')}>Retry confirmation email</button>}</div><dl className="mt-4 space-y-2 text-xs leading-5 text-slate-600">{order.specifications_note && <div><dt className="font-bold">Confirmed specifications</dt><dd className="whitespace-pre-wrap">{order.specifications_note}</dd></div>}{order.payment_reference && <div><dt className="font-bold">Payment / credit clearance</dt><dd>{order.payment_reference}</dd></div>}{order.production_reference && <div><dt className="font-bold">Approved manufacturing reference</dt><dd>{order.production_reference}</dd></div>}</dl>
    {action && <form onSubmit={run} className="mt-5 space-y-3 border-t border-slate-100 pt-4"><p className="text-sm font-semibold text-slate-800">{cancelling ? 'Cancel / replace this order' : action[1]}</p><p className="text-xs leading-5 text-slate-500">{cancelling ? 'Record the reason. This does not refund payments or mark the lead Lost. Issue a new quote version for changed scope or pricing.' : action[2]}</p>{!cancelling && order.status === 'awaiting_invoice' && <label className="block text-sm">Issued invoice<select required className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)}><option value="">Select the invoice you have sent</option>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · R {Number(invoice.total).toLocaleString('en-ZA')}</option>)}</select></label>}<label className="block text-sm">{cancelling ? 'Cancellation reason' : 'Confirmation / reference'}<textarea required={cancelling || ['awaiting_specifications', 'awaiting_payment', 'ready_for_release'].includes(order.status)} minLength={order.status === 'awaiting_specifications' && !cancelling ? 10 : 5} maxLength={4000} value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm" /></label><label className="flex items-start gap-2 text-xs leading-5 text-slate-600"><input type="checkbox" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />{!cancelling && order.status === 'awaiting_specifications' ? 'The client has confirmed the specifications, delivery and site access. The accepted scope and price are unchanged.' : !cancelling && order.status === 'awaiting_invoice' ? 'I confirm this invoice has been sent to the client.' : 'I have checked this order and confirm this action is correct.'}</label><div className="flex flex-wrap gap-2"><button disabled={saving || !confirmed} className="rounded-lg bg-sky-700 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : cancelling ? 'Confirm cancellation' : action[1]}</button>{canCancel && <button type="button" className={button} onClick={() => { setCancelling(!cancelling); setNote(''); setConfirmed(false) }}>{cancelling ? 'Back' : 'Cancel / replace order'}</button>}</div></form>}
  </article>
}
