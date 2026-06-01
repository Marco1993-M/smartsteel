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

  const documentModel = buildEstimateDisplayModel(estimate, lead)

  if (isPdfRender) {
    return (
      <main className="min-h-screen bg-white px-0 py-0">
        <EstimateDocumentLayout documentModel={documentModel} estimate={estimate} />
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <EstimateDocumentViewport documentModel={documentModel} estimate={estimate} />
    </main>
  )
}
