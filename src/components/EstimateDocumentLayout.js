import Image from "next/image"
import { ESTIMATE_EXCLUSIONS, ESTIMATE_TERMS } from "../lib/estimates/estimateDocument"
import { formatCurrency } from "../lib/estimates/warehouseEstimate"

export default function EstimateDocumentLayout({
  documentModel,
  estimate,
  shareUrl = "",
  publicView = false,
}) {
  return (
    <article className="estimate-sheet mx-auto w-full max-w-[210mm] overflow-hidden rounded-[2rem] bg-white shadow-lg print:max-w-none print:rounded-none print:shadow-none">
      <div className="border-b border-slate-200 px-[12mm] py-[12mm] print:px-[12mm] print:py-[10mm]">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4">
              <Image src="/Logo.png" alt="Smart Steel Logo" width={120} height={48} className="h-12 w-auto" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
                  Smart Steel Estimate
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Lightweight steel structures for South African projects
                </p>
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">
              {estimate.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Formal estimate prepared by Smart Steel for structured review, internal approval, and
              fast client follow-up.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <a href="mailto:info@smartsteel.co.za" className="hover:text-red-600">
                info@smartsteel.co.za
              </a>
              <a href="tel:+27826576522" className="hover:text-red-600">
                +27 82 657 6522
              </a>
              <span>Pretoria, South Africa</span>
              <a href="https://www.smartsteel.co.za" className="hover:text-red-600">
                www.smartsteel.co.za
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Estimate no:</span>{" "}
              {documentModel.estimateNumber}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-slate-900">Version:</span> {estimate.version_no}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-slate-900">Prepared:</span>{" "}
              {documentModel.createdLabel}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-slate-900">Product:</span>{" "}
              {documentModel.productType}
            </p>
            {publicView && shareUrl ? (
              <p className="mt-2 break-all text-xs text-slate-500">{shareUrl}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 border-b border-slate-200 px-[12mm] py-[10mm] md:grid-cols-2 print:px-[12mm] print:py-[8mm]">
        <section className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Client
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p className="text-lg font-semibold text-slate-950">{documentModel.clientName}</p>
            <p>{documentModel.clientEmail}</p>
            <p>{documentModel.clientPhone}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Project Summary
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-900">Width:</span> {documentModel.widthLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Length:</span> {documentModel.lengthLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Area:</span> {documentModel.areaLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Cladding:</span> {documentModel.claddingLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Delivery:</span> {documentModel.deliveryLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Installation:</span> {documentModel.installationLabel}
            </p>
          </div>
        </section>
      </div>

      <div className="px-[12mm] py-[10mm] print:px-[12mm] print:py-[8mm]">
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Rate</th>
                <th className="px-6 py-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
              {documentModel.lineItems.map((item) => (
                <tr key={item.id || item.code || item.label}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    {item.overrideReason ? (
                      <p className="mt-1 text-xs text-slate-500">Reason: {item.overrideReason}</p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">{item.unit}</td>
                  <td className="px-6 py-4">{formatCurrency(item.unitRate || 0)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(item.total || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Estimate Notes
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              {documentModel.notes ||
                "This estimate is prepared from the Smart Steel pricing workflow and may be revised if project requirements, delivery conditions, or scope change."}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Totals
            </h2>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{documentModel.subtotalLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Markup factor</span>
                <span className="font-medium text-slate-900">{documentModel.markupLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Markup value</span>
                <span className="font-medium text-slate-900">{documentModel.markupValueLabel}</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between text-base font-semibold text-slate-950">
                  <span>Estimated total</span>
                  <span>{documentModel.totalLabel}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Terms
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {ESTIMATE_TERMS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Exclusions
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {ESTIMATE_EXCLUSIONS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Acceptance
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
            By signing or approving this estimate, the client confirms that the commercial scope,
            estimate basis, and principal exclusions have been reviewed and accepted for the next
            project step.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <div className="h-16 border-b border-slate-300" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Name
              </p>
            </div>
            <div>
              <div className="h-16 border-b border-slate-300" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Signature
              </p>
            </div>
            <div>
              <div className="h-16 border-b border-slate-300" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Date
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  )
}
