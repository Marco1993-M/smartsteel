"use client"

import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react"

const STATUS_META = {
  submitted: { label: "New request", className: "bg-amber-100 text-amber-800", action: "Begin review", next: "in_review" },
  in_review: { label: "In review", className: "bg-blue-100 text-blue-800", action: "Approve price", next: "quoted" },
  quoted: { label: "Price approved", className: "bg-emerald-100 text-emerald-800", action: "Close opportunity", next: "closed" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600", action: "Reopen review", next: "in_review" },
}

const money = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
})

export default function PartnerOpportunityReviewDrawer({
  record,
  notes,
  setNotes,
  quoteResponse,
  setQuoteResponse,
  saving,
  onClose,
  onAdvance,
}) {
  const meta = STATUS_META[record.status] || STATUS_META.submitted
  const config = record.configuration || {}
  const proposal = record.proposedQuote
  const scopeLabel = config.gableMode === "roof_only"
    ? "Roof sheeting"
    : config.gableMode === "fully_enclosed"
      ? "Roof and walls sheeted"
      : "Structure only"
  const reviewChecks = [
    ["Customer contact", Boolean(record.customerPhone || record.customerEmail)],
    ["Site location", Boolean(record.siteLocation)],
    ["Controlled configuration", Boolean(proposal?.pricingRelease)],
    ["Proposed price", Number(proposal?.amountExVat) > 0],
  ]
  const finalAmount = Number(quoteResponse.finalQuoteAmountExVat || 0)
  const variance = proposal ? finalAmount - proposal.amountExVat : 0

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#001d2e]/45 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside className="ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <header className="border-b border-slate-200 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${meta.className}`}>
                {meta.label}
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{record.customerName}</h2>
              <p className="mt-1 text-sm text-slate-500">{record.reference} · {record.partner?.name || "AFGRI"}</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {proposal ? (
            <section className="overflow-hidden rounded-2xl bg-[#001d2e] text-white">
              <div className="grid gap-px bg-white/15 sm:grid-cols-[1.35fr_0.65fr]">
                <div className="bg-[linear-gradient(135deg,#001d2e,#063379)] p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c1d9e5]">Proposed supply-only quote</p>
                  <p className="mt-3 text-4xl font-black tracking-tight">{money.format(proposal.amountExVat)}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/55">Excl. VAT</p>
                </div>
                <div className="bg-[#063379] p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Including VAT</p>
                  <p className="mt-3 text-2xl font-black">{money.format(proposal.amountInclVat)}</p>
                  <p className="mt-2 text-xs text-white/55">VAT {money.format(proposal.vatAmount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-px bg-white/10">
                <ProposalAmount label="Structure" value={proposal.structureAmountExVat} />
                <ProposalAmount label="Connections" value={proposal.connectionsAmountExVat} />
                <ProposalAmount label="Sheeting" value={proposal.sheetingAmountExVat} />
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
              This configuration could not be recalculated. Confirm the released product before quoting.
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#eef4f8] p-5">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[#0043f3]" />
                <div>
                  <p className="font-black">{record.product?.name || "Atlas Warehouse"}</p>
                  <p className="text-xs text-slate-500">Release {record.product?.releaseVersion || "—"}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <Detail label="Size" value={`${config.width}m × ${config.length}m × ${config.wallHeight}m`} />
                <Detail label="Steel finish" value={config.steelFinish} />
                <Detail label="Scope" value={scopeLabel} />
                <Detail label="Sheeting area" value={proposal?.sheetingAreaSqm ? `${proposal.sheetingAreaSqm} sqm` : "None"} />
                <Detail label="Steel mass" value={proposal?.totalSteelKg ? `${proposal.totalSteelKg} kg` : "—"} />
                <Detail label="Pricing release" value={proposal?.pricingRelease || "—"} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Review readiness</p>
              <div className="mt-4 space-y-3">
                {reviewChecks.map(([label, complete]) => (
                  <div key={label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className={`grid h-6 w-6 place-items-center rounded-full ${complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {complete ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <ContactLine icon={UserRound} value={record.customerName} />
              {record.customerPhone ? <ContactLine icon={Phone} value={record.customerPhone} /> : null}
              {record.customerEmail ? <ContactLine icon={Mail} value={record.customerEmail} /> : null}
              {record.siteLocation ? <ContactLine icon={MapPin} value={record.siteLocation} /> : null}
            </div>
          </section>

          {record.partnerNotes ? (
            <section>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Salesperson notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{record.partnerNotes}</p>
            </section>
          ) : null}

          {proposal ? (
            <section className="grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2">
              <ScopeList title="Included" items={proposal.inclusions} />
              <ScopeList title="Excluded" items={proposal.exclusions} />
              {proposal.provisionalItems?.length ? (
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Confirm during review</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{proposal.provisionalItems.join(" · ")}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Internal review note</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="3" placeholder="Record anything the Smart Steel team must confirm before release." className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base outline-none focus:border-[#0043f3]" />
          </label>

          {record.status === "in_review" || record.status === "quoted" ? (
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Price returned to AFGRI</p>
                  <p className="mt-1 text-sm text-slate-600">Confirm the approved amount. A formal proposal can be attached now or added later.</p>
                </div>
                {proposal ? (
                  <button type="button" onClick={() => setQuoteResponse((current) => ({ ...current, finalQuoteAmountExVat: proposal.amountExVat }))} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0043f3] shadow-sm">
                    Use proposed price
                  </button>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                <QuoteField label="Final amount excl. VAT">
                  <input type="number" min="0" step="0.01" value={quoteResponse.finalQuoteAmountExVat} onChange={(event) => setQuoteResponse((current) => ({ ...current, finalQuoteAmountExVat: event.target.value }))} />
                </QuoteField>
                {proposal && variance !== 0 ? (
                  <p className={`text-xs font-bold ${variance > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                    {variance > 0 ? "+" : ""}{money.format(variance)} against the calculated proposal
                  </p>
                ) : null}
                <QuoteField label="Formal quote link (optional)">
                  <input value={quoteResponse.quoteUrl} onChange={(event) => setQuoteResponse((current) => ({ ...current, quoteUrl: event.target.value }))} placeholder="Add when a formal proposal has been issued" />
                </QuoteField>
                <QuoteField label="Message to salesperson">
                  <textarea rows="3" value={quoteResponse.partnerQuoteMessage} onChange={(event) => setQuoteResponse((current) => ({ ...current, partnerQuoteMessage: event.target.value }))} placeholder="The reviewed proposal is ready. Open the quote for scope and commercial terms." />
                </QuoteField>
              </div>
            </section>
          ) : null}
        </div>

        <footer className="border-t border-slate-200 bg-white p-4 sm:p-5">
          <button type="button" disabled={saving} onClick={() => onAdvance(meta.next)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-5 text-sm font-black text-white disabled:opacity-50">
            {record.status === "in_review" ? <FileCheck2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? "Saving..." : meta.action}
          </button>
        </footer>
      </aside>
    </div>
  )
}

function ProposalAmount({ label, value }) {
  return <div className="bg-[#001d2e] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">{label}</p><p className="mt-1 text-sm font-black text-white">{money.format(value || 0)}</p></div>
}

function ContactLine({ icon: Icon, value }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm"><Icon className="h-4 w-4 shrink-0 text-slate-400" /><span className="min-w-0 break-words font-semibold text-slate-700">{value}</span></div>
}

function Detail({ label, value }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words font-black text-slate-900">{value || "—"}</p></div>
}

function ScopeList({ title, items = [] }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p><div className="mt-3 space-y-2">{items.map((item) => <p key={item} className="flex gap-2 text-sm leading-5 text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0043f3]" />{item}</p>)}</div></div>
}

function QuoteField({ label, children }) {
  return <label className="block text-xs font-bold text-slate-700">{label}<span className="mt-1.5 block [&>input]:min-h-11 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-blue-200 [&>input]:bg-white [&>input]:px-3 [&>input]:text-base [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-blue-200 [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:text-base">{children}</span></label>
}
