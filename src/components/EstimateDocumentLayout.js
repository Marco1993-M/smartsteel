import Image from "next/image"
import { ESTIMATE_EXCLUSIONS, ESTIMATE_TERMS } from "../lib/estimates/estimateDocument"
import { formatCurrency } from "../lib/estimates/warehouseEstimate"

export default function EstimateDocumentLayout({
  documentModel,
  estimate,
}) {
  return (
    <article className="estimate-sheet mx-auto w-[210mm] min-w-[210mm] rounded-[2rem] bg-white pb-[8mm] shadow-lg print:max-w-none print:min-w-0 print:rounded-none print:pb-[6mm] print:shadow-none">
      <section className="estimate-page estimate-cover-page print:break-after-page">
      <div className="estimate-block border-b border-slate-200 bg-[linear-gradient(135deg,_#fff7f7,_#ffffff_38%,_#f8fafc)] px-[12mm] py-[12mm] print:px-[11mm] print:py-[8mm]">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 print:gap-3">
              <Image src="/Logo.png" alt="Smart Steel Logo" width={120} height={48} className="h-12 w-auto" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-red-600">
                  Smart Steel Quotation
                </p>
                <p className="mt-1 text-sm text-slate-500 print:text-[12px]">
                  Lightweight steel structures tailored to your project
                </p>
              </div>
          </div>
          <div className="mt-5 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700 print:mt-4">
            Prepared for {documentModel.clientName}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 print:mt-3 print:text-[30px] print:leading-[1.05]">
            {documentModel.quotationTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 print:mt-2 print:text-[12px] print:leading-5">
            Thank you for the opportunity to quote on your project. Please review the scope,
            pricing summary, and commercial notes below.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 print:mt-3 print:text-[12px]">
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

        <div className="mt-6 grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-4 print:mt-5 print:gap-3">
          <section className="estimate-card overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white print:px-4 print:py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                Quote Summary
              </p>
              <p className="mt-2 text-3xl font-semibold print:text-[26px]">{documentModel.totalInclVatLabel}</p>
              <p className="mt-1 text-sm text-slate-300 print:text-[12px]">Total including VAT</p>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm text-slate-700 print:space-y-2 print:px-4 print:py-3 print:text-[12px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Total excl. VAT</span>
                <span className="font-semibold text-slate-900">{documentModel.subtotalLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">VAT (15%)</span>
                <span className="font-semibold text-slate-900">{documentModel.vatLabel}</span>
              </div>
            </div>
          </section>

          <section className="estimate-card rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Quote Details
            </p>
            <div className="mt-3 space-y-3 text-sm text-slate-700 print:mt-2 print:space-y-2 print:text-[12px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Quote no.</span>
                <span className="font-semibold text-slate-900">{documentModel.estimateNumber}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Version</span>
                <span className="font-semibold text-slate-900">{estimate.version_no}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Prepared</span>
                <span className="font-semibold text-slate-900">{documentModel.createdLabel}</span>
              </div>
            </div>
          </section>

          <section className="estimate-card rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Validity
            </p>
            <div className="mt-3 space-y-3 text-sm text-slate-700 print:mt-2 print:space-y-2 print:text-[12px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Valid until</span>
                <span className="font-semibold text-slate-900">{documentModel.validUntilLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Prepared by</span>
                <span className="font-semibold text-slate-900">{documentModel.preparedByLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Product</span>
                <span className="font-semibold text-slate-900">{documentModel.productType}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="estimate-block grid grid-cols-[0.9fr_1.1fr] gap-6 border-b border-slate-200 px-[12mm] py-[10mm] print:px-[11mm] print:py-[6mm] print:gap-4">
        <section className="estimate-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Client
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700 print:mt-2 print:space-y-1.5 print:text-[12px]">
            <p className="text-xl font-semibold text-slate-950 print:text-lg">{documentModel.clientName}</p>
            <p>{documentModel.clientEmail}</p>
            <p>{documentModel.clientPhone}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 print:mt-3 print:p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Prepared by
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 print:mt-1 print:text-[12px]">Smart Steel</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 print:text-[12px] print:leading-5">
              Pretoria-based lightweight steel structure specialists serving projects across South Africa.
            </p>
          </div>
        </section>

        <section className="estimate-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Project Summary
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700 print:mt-2 print:gap-2 print:text-[12px]">
            {documentModel.summaryFields.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 print:px-3 print:py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      </section>

      <section className="estimate-page estimate-pricing-page print:break-after-page">
      <div className="estimate-block px-[12mm] py-[10mm] print:px-[12mm] print:py-[8mm]">
        <div className="estimate-table-shell rounded-3xl border border-slate-200 shadow-sm">
          <table className="estimate-table min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-950">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <th className="px-6 py-4 text-slate-300">Item</th>
                <th className="px-6 py-4 text-slate-300">Qty</th>
                <th className="px-6 py-4 text-slate-300">Unit</th>
                <th className="px-6 py-4 text-slate-300">Rate</th>
                <th className="px-6 py-4 text-right text-slate-300">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
              {documentModel.lineItems.map((item) => (
                <tr key={item.id || item.code || item.label} className="estimate-row">
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

        <div className="mt-8 grid grid-cols-[1.05fr_0.95fr] gap-6">
          <section className="estimate-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Project Notes
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              {documentModel.notes ||
                "This quotation is based on the project information available at the time of pricing and may be revised if scope, site, or delivery requirements change."}
            </p>
          </section>

          <section className="estimate-card overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-[linear-gradient(135deg,_#0f172a,_#1e293b)] px-6 py-5 text-white">
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                Commercial Summary
              </h2>
              <p className="mt-2 text-3xl font-semibold">{documentModel.totalInclVatLabel}</p>
              <p className="mt-1 text-sm text-slate-300">Total amount payable including VAT</p>
            </div>
            <div className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Totals
            </h2>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Total excl. VAT</span>
                <span className="font-medium text-slate-900">{documentModel.subtotalLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>VAT (15%)</span>
                <span className="font-medium text-slate-900">{documentModel.vatLabel}</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between text-base font-semibold text-slate-950">
                  <span>Total incl. VAT</span>
                  <span>{documentModel.totalInclVatLabel}</span>
                </div>
              </div>
            </div>
            </div>
          </section>
        </div>
      </div>
      </section>

      <section className="estimate-page">
      <div className="estimate-block px-[12mm] pt-0 pb-[10mm] print:px-[12mm] print:pt-0 print:pb-[8mm]">
        <div className="grid grid-cols-2 gap-6">
          <section className="estimate-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Terms
            </h2>
            <ul className="mt-4 list-none space-y-3 pl-0 text-sm leading-6 text-slate-700">
              {ESTIMATE_TERMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="estimate-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Exclusions
            </h2>
            <ul className="mt-4 list-none space-y-3 pl-0 text-sm leading-6 text-slate-700">
              {ESTIMATE_EXCLUSIONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="estimate-card estimate-acceptance mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Acceptance
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
            By signing or approving this quotation, the client confirms that the quoted scope,
            principal commercial terms, and exclusions have been reviewed and accepted.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div>
              <div className="h-16 rounded-t-xl bg-slate-50" />
              <div className="border-b border-slate-300" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Name
              </p>
            </div>
            <div>
              <div className="h-16 rounded-t-xl bg-slate-50" />
              <div className="border-b border-slate-300" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Signature
              </p>
            </div>
            <div>
              <div className="h-16 rounded-t-xl bg-slate-50" />
              <div className="border-b border-slate-300" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Date
              </p>
            </div>
          </div>
          <div className="estimate-card mt-8 rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Prepared by Smart Steel
            </p>
            <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{documentModel.preparedByLabel}</p>
                <p className="mt-1 text-sm text-slate-600">
                  For project questions, revisions, or acceptance, please contact the Smart Steel team directly.
                </p>
              </div>
              <div className="min-w-[160px]">
                <div className="h-12 border-b border-slate-300" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Smart Steel Sign-off
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
      </section>
    </article>
  )
}
