import QuoteAcceptance from "../../../components/quotes/QuoteAcceptance"
import { acceptanceBlocker } from "../../../lib/quoteAcceptance.mjs"
import EstimateDocumentLayout from "../../../components/EstimateDocumentLayout"
import EstimateDocumentViewport from "../../../components/EstimateDocumentViewport"
import { buildEstimateDisplayModel } from "../../../lib/estimates/estimateDocument"
import { supabaseServer } from "../../../lib/supabase-server"

export const dynamic = "force-dynamic"
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PublicQuotePage({ params, searchParams }) {
  const { shareToken } = await params
  const resolvedSearchParams = await searchParams
  const isPdfRender = resolvedSearchParams?.pdf === "1"

  const { data: estimate } = await supabaseServer
    .from("estimates")
    .select("*")
    .eq("share_token", shareToken)
    .single()

  if (!estimate) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-red-600">
            This estimate link is invalid or no longer available.
          </p>
        </div>
      </main>
    )
  }

  const { data: lead } = await supabaseServer
    .from("leads")
    .select("*")
    .eq("id", estimate.lead_id)
    .single()

  const { data: order, error: orderError } = await supabaseServer.from("sales_orders")
    .select("order_number, status, confirmation_sent_at, terms_snapshot, quote_snapshot").eq("estimate_id", estimate.id).maybeSingle()
  const documentModel = {
    ...buildEstimateDisplayModel(order?.quote_snapshot || estimate, lead),
    ...(order ? { terms: order.terms_snapshot.terms, deliveryTerms: order.terms_snapshot.delivery, exclusions: order.terms_snapshot.exclusions } : {}),
  }

  if (isPdfRender) {
    return (
      <main className="min-h-screen bg-white px-0 py-0">
        <EstimateDocumentLayout documentModel={documentModel} estimate={estimate} />
      </main>
    )
  }

  const { data: latest } = await supabaseServer.from("estimates").select("version_no").eq("lead_id", estimate.lead_id).order("version_no", { ascending: false }).limit(1).maybeSingle()
  const blocker = orderError || !latest ? "Online acceptance is temporarily unavailable. Please contact our team." : acceptanceBlocker(estimate, latest.version_no)

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <QuoteAcceptance token={shareToken} updatedAt={estimate.updated_at} model={documentModel} version={estimate.version_no} blocker={blocker} existingOrder={order ? { orderNumber: order.order_number, status: order.status, confirmationSent: Boolean(order.confirmation_sent_at) } : null} />
      <EstimateDocumentViewport documentModel={documentModel} estimate={estimate} />
    </main>
  )
}
