import EstimateResponseClient from "./EstimateResponseClient"
import { supabaseServer } from "../../../lib/supabase-server"
import { isAtlasEstimate } from "../../../lib/crmEstimateFollowUps"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Estimate response | Smart Steel",
  robots: { index: false, follow: false },
}

export default async function EstimateResponsePage({ params, searchParams }) {
  const { token } = await params
  const resolvedSearchParams = await searchParams

  const { data: sequence } = await supabaseServer
    .from("crm_estimate_follow_up_sequences")
    .select("id, lead_id, estimate_id")
    .eq("response_token", token)
    .maybeSingle()

  if (!sequence) {
    return (
      <main className="min-h-screen bg-slate-100 px-5 py-12">
        <div className="mx-auto max-w-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Link unavailable</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">This response link is not available.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Please reply to the email or contact info@smartsteel.co.za and we will assist you.</p>
        </div>
      </main>
    )
  }

  const [{ data: lead }, { data: estimate }] = await Promise.all([
    supabaseServer.from("leads").select("name, last_name, product_type").eq("id", sequence.lead_id).maybeSingle(),
    supabaseServer.from("estimates").select("title, version_no, product_type_display").eq("id", sequence.estimate_id).maybeSingle(),
  ])

  return (
    <EstimateResponseClient
      token={token}
      estimateTitle={estimate?.title || `Estimate V${estimate?.version_no || 1}`}
      clientName={[lead?.name, lead?.last_name].filter(Boolean).join(" ").trim()}
      initialChoice={String(resolvedSearchParams?.choice || "")}
      isAtlas={isAtlasEstimate(lead, estimate)}
    />
  )
}
