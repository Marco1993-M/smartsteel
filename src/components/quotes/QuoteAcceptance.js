'use client'
import { useState } from 'react'
import { ACCEPTANCE_NEXT_STEPS, ACCEPTANCE_NOTICE, ACCEPTANCE_TERMS_VERSION } from '../../lib/quoteAcceptance.mjs'

export default function QuoteAcceptance({ token, updatedAt, model, version, blocker, existingOrder }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [poReference, setPoReference] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(existingOrder || null)
  async function accept(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/quotes/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, expectedUpdatedAt: updatedAt, name, email, poReference, agreed, termsVersion: ACCEPTANCE_TERMS_VERSION }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not record your acceptance.')
      setResult(payload)
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900'
  return <section id="accept-quote" className="mx-auto mb-8 max-w-4xl scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden sm:p-8">
    <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Smart Steel · Quote V{version}</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-950">{result ? result.status === 'cancelled' ? 'This order has been cancelled.' : 'Your acceptance has been received.' : 'Review & accept your quote'}</h1>
    <p className="mt-3 text-lg font-semibold text-slate-800">{model.quotationTitle}</p>
    <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><p>Quote reference: <strong>{model.estimateNumber}</strong></p><p>Prepared for: <strong>{model.clientName}</strong></p><p>Valid until: <strong>{model.validUntilLabel}</strong></p><p>Total including VAT: <strong>{model.totalInclVatLabel}</strong></p>{model.summaryFields.map((field) => <p key={field.label}>{field.label}: <strong>{field.value}</strong></p>)}</div>
    {result ? <div role="status" className="mt-5 rounded-xl bg-sky-50 p-4 text-sm leading-6 text-sky-950"><p>Order reference: <strong>{result.orderNumber}</strong></p><p>{result.status === 'cancelled' ? 'Please contact Smart Steel if you would like to proceed with a revised quote.' : 'Your acceptance is saved. Our team will manage specification confirmation, invoicing and production approval with you.'}</p>{result.status !== 'cancelled' && <p>{result.confirmationSent ? 'Your confirmation email has been sent to the email address on your quote.' : 'Your acceptance is saved, but email confirmation is still pending. Please keep your order reference.'}</p>}</div> : null}
    {result?.status !== 'cancelled' && <div className="mt-6"><h2 className="text-lg font-bold text-slate-900">What happens after you accept?</h2><ol className="mt-4 space-y-4">{ACCEPTANCE_NEXT_STEPS.map((step, index) => <li key={step.title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">{index + 1}</span><div><h3 className="text-sm font-bold text-slate-900">{step.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p></div></li>)}</ol><p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">{ACCEPTANCE_NOTICE}</p></div>}
    {!result && (blocker ? <p className="mt-5 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">{blocker} Contact <a className="underline" href="mailto:info@smartsteel.co.za">info@smartsteel.co.za</a>.</p> : <form onSubmit={accept} className="mt-6 space-y-4"><p className="text-sm leading-6 text-slate-600">Review the full quote, scope, exclusions and delivery terms below before confirming. This records acceptance of this specific version.</p><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Your full name<input required minLength={2} maxLength={160} autoComplete="name" className={field} value={name} onChange={(event) => setName(event.target.value)} /></label><label className="text-sm font-medium">Your email address<input required type="email" maxLength={254} autoComplete="email" className={field} value={email} onChange={(event) => setEmail(event.target.value)} /></label></div><label className="block text-sm font-medium">Purchase order reference (optional)<input maxLength={120} className={field} value={poReference} onChange={(event) => setPoReference(event.target.value)} /></label><label className="flex items-start gap-3 text-sm leading-6 text-slate-700"><input required type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />I am authorised to accept this quote. I have reviewed and accept the quoted scope, price, exclusions and terms, including Site Access and Transport Pricing, and understand the next steps above.</label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy || !agreed} className="min-h-12 rounded-lg bg-sky-700 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Recording acceptance…' : 'Accept this quote'}</button><p className="text-xs text-slate-500">Need changes instead? Reply to your quote email and we’ll help revise it.</p></form>)}
  </section>
}
