import InvoiceDocumentLayout from "../../../components/InvoiceDocumentLayout"
import InvoiceDocumentViewport from "../../../components/InvoiceDocumentViewport"
import { buildInvoiceDisplayModel } from "../../../lib/invoices/invoiceDocument"
import { supabaseServer } from "../../../lib/supabase-server"

export const dynamic = "force-dynamic"
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PublicInvoicePage({ params, searchParams }) {
  const { shareToken } = await params
  const resolvedSearchParams = await searchParams
  const isPdfRender = resolvedSearchParams?.pdf === "1"

  const { data: invoice } = await supabaseServer
    .from("invoices")
    .select("*")
    .eq("share_token", shareToken)
    .single()

  if (!invoice) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-red-600">
            This invoice link is invalid or no longer available.
          </p>
        </div>
      </main>
    )
  }

  const { data: lead } = await supabaseServer
    .from("leads")
    .select("*")
    .eq("id", invoice.lead_id)
    .single()

  const documentModel = buildInvoiceDisplayModel(invoice, lead)

  if (isPdfRender) {
    return (
      <main className="min-h-screen bg-white px-0 py-0">
        <InvoiceDocumentLayout documentModel={documentModel} />
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <InvoiceDocumentViewport documentModel={documentModel} />
    </main>
  )
}
