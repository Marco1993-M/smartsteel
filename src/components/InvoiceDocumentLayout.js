import Image from "next/image"
import { INVOICE_TERMS } from "../lib/invoices/invoiceDocument"
import { formatCurrency } from "../lib/estimates/warehouseEstimate"

export default function InvoiceDocumentLayout({ documentModel }) {
  const invoiceCardClass = "invoice-card rounded-3xl border border-slate-200 bg-white"

  return (
    <article className="invoice-sheet mx-auto w-[210mm] min-w-[210mm] rounded-[2rem] bg-white pb-[8mm] shadow-lg print:max-w-none print:min-w-0 print:rounded-none print:pb-[6mm] print:shadow-none">
      <section className="invoice-page print:break-after-page">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,_#fff7f7,_#ffffff_38%,_#f8fafc)] px-[12mm] py-[12mm] print:px-[11mm] print:py-[8mm]">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 print:gap-3">
              <Image src="/Logo.png" alt="Smart Steel Logo" width={120} height={48} className="h-12 w-auto" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-red-600">
                  Smart Steel Invoice
                </p>
                <p className="mt-1 text-sm text-slate-500 print:text-[12px]">
                  Lightweight steel structures and project supply
                </p>
              </div>
            </div>

            <div className="mt-5 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700 print:mt-4">
              Billed to {documentModel.clientName}
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 print:mt-3 print:text-[30px] print:leading-[1.05]">
              {documentModel.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 print:mt-2 print:text-[12px] print:leading-5">
              Please review the billing summary, invoice line items, and payment details below.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-4 print:mt-5 print:gap-3">
            <section className={`overflow-hidden ${invoiceCardClass}`}>
              <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white print:px-4 print:py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Invoice Summary
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

            <section className={`${invoiceCardClass} px-5 py-4`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Invoice Details
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-700 print:mt-2 print:space-y-2 print:text-[12px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Invoice no.</span>
                  <span className="font-semibold text-slate-900">{documentModel.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Issued</span>
                  <span className="font-semibold text-slate-900">{documentModel.issueDateLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Due</span>
                  <span className="font-semibold text-slate-900">{documentModel.dueDateLabel}</span>
                </div>
              </div>
            </section>

            <section className={`${invoiceCardClass} px-5 py-4`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Payment
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-700 print:mt-2 print:space-y-2 print:text-[12px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Terms</span>
                  <span className="text-right font-semibold text-slate-900">{documentModel.paymentTermsLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Prepared by</span>
                  <span className="font-semibold text-slate-900">{documentModel.preparedByLabel}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="grid grid-cols-[0.9fr_1.1fr] gap-6 border-b border-slate-200 px-[12mm] py-[10mm] print:px-[11mm] print:py-[6mm] print:gap-4">
          <section className={`${invoiceCardClass} p-6`}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Bill To</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700 print:mt-2 print:space-y-1.5 print:text-[12px]">
              <p className="text-xl font-semibold text-slate-950 print:text-lg">{documentModel.clientName}</p>
              <p>{documentModel.clientEmail}</p>
              <p>{documentModel.clientPhone}</p>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 print:mt-3 print:p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Payment Reference
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 print:mt-1 print:text-[12px]">
                {documentModel.invoiceNumber}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 print:text-[12px] print:leading-5">
                Please use this invoice number when making payment or sending proof of payment.
              </p>
            </div>
          </section>

          <section className={`${invoiceCardClass} p-6`}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Invoice Summary</h2>
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

      <section className="invoice-page print:break-after-page">
        <div className="px-[12mm] py-[10mm] print:px-[12mm] print:py-[8mm]">
          <div className="invoice-table-shell rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
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

          <div className="mt-8 grid grid-cols-[1.05fr_0.95fr] gap-6">
            <section className={`${invoiceCardClass} p-6`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Invoice Notes</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                {documentModel.notes || "Please contact Smart Steel if you need any clarification on this invoice or the billed scope."}
              </p>
            </section>

            <section className={`overflow-hidden ${invoiceCardClass}`}>
              <div className="bg-[linear-gradient(135deg,_#0f172a,_#1e293b)] px-6 py-5 text-white">
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Commercial Summary</h2>
                <p className="mt-2 text-3xl font-semibold">{documentModel.totalInclVatLabel}</p>
                <p className="mt-1 text-sm text-slate-300">Total amount payable including VAT</p>
              </div>
              <div className="p-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Totals</h2>
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

      <section className="invoice-page">
        <div className="px-[12mm] pt-0 pb-[10mm] print:px-[12mm] print:pt-0 print:pb-[8mm]">
          <div className="grid grid-cols-2 gap-6">
            <section className={`${invoiceCardClass} p-6`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payment Terms</h2>
              <ul className="mt-4 list-none space-y-3 pl-0 text-sm leading-6 text-slate-700">
                {INVOICE_TERMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Billing Entity
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {documentModel.billingDetails.divisionNote}
                </p>
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>Reg No: {documentModel.billingDetails.registrationNumber}</p>
                  <p>VAT Number: {documentModel.billingDetails.vatNumber}</p>
                </div>
              </div>
            </section>

            <section className={`${invoiceCardClass} p-6`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Banking Details</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <p>Account holder: {documentModel.billingDetails.legalEntity}</p>
                <p>Bank: {documentModel.billingDetails.bankName}</p>
                <p>Branch code: {documentModel.billingDetails.branchCode}</p>
                <p>Account number: {documentModel.billingDetails.accountNumber}</p>
                <p>Account type: {documentModel.billingDetails.accountType}</p>
                <p>Beneficiary reference: {documentModel.billingDetails.beneficiaryReference}</p>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Proof Of Payment
                </p>
                <div className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
                  <p>Please send proof of payment to:</p>
                  {documentModel.billingDetails.proofOfPaymentEmails.map((email) => (
                    <p key={email}>{email}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm leading-6 text-slate-700">
                <p>
                  For proof of payment, account queries, or invoice adjustments, please contact the Smart Steel team directly.
                </p>
                <p>Email: info@smartsteel.co.za</p>
                <p>Phone: +27 82 657 6522</p>
                <p>Reference: {documentModel.invoiceNumber}</p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </article>
  )
}
