import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import {
  buildFollowUpCopy,
  buildFollowUpHtml,
  getFollowUpPlan,
  isAtlasEstimate,
} from "lib/crmEstimateFollowUps"

export const dynamic = "force-dynamic"

function isMissingSchema(error) {
  return /crm_estimate_follow_up_sequences|schema cache|does not exist/i.test(error?.message || "")
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const leadId = String(new URL(request.url).searchParams.get("leadId") || "").trim()
  if (!leadId) return NextResponse.json({ error: "Lead is required." }, { status: 400 })

  const { data, error } = await supabaseServer
    .from("crm_estimate_follow_up_sequences")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && isMissingSchema(error)) return NextResponse.json({ sequence: null, migrationRequired: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const previewRequested = new URL(request.url).searchParams.get("preview") === "1"
  if (previewRequested && data) {
    const [{ data: lead }, { data: estimate }] = await Promise.all([
      supabaseServer.from("leads").select("name, last_name, product_type").eq("id", data.lead_id).maybeSingle(),
      supabaseServer.from("estimates").select("title, version_no, product_type_display, share_token").eq("id", data.estimate_id).maybeSingle(),
    ])

    if (!lead || !estimate?.share_token) {
      return NextResponse.json({ error: "The email preview could not be prepared." }, { status: 404 })
    }

    const copy = buildFollowUpCopy({ stepNumber: 1, lead, estimate })
    const shareUrl = new URL(`/quotes/${estimate.share_token}`, request.url).toString()
    const responseBaseUrl = new URL(`/estimate-response/${data.response_token}`, request.url).toString()
    return NextResponse.json({
      subject: copy.subject,
      html: buildFollowUpHtml({
        copy,
        estimate,
        shareUrl,
        responseBaseUrl,
        isAtlas: isAtlasEstimate(lead, estimate),
      }),
    })
  }

  return NextResponse.json({ sequence: data || null, plan: getFollowUpPlan() })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const payload = await request.json()
  const sequenceId = String(payload?.sequenceId || "").trim()
  if (!sequenceId || payload?.action !== "cancel") {
    return NextResponse.json({ error: "A valid sequence and action are required." }, { status: 400 })
  }

  const cancelledAt = new Date().toISOString()
  const reason = String(payload?.reason || "Client replied; follow-up sequence cancelled manually.").trim()
  const { data, error } = await supabaseServer
    .from("crm_estimate_follow_up_sequences")
    .update({
      status: "cancelled",
      cancelled_at: cancelledAt,
      cancelled_by_name: String(payload?.cancelledByName || "Smart Steel").trim(),
      cancellation_reason: reason,
      next_send_at: null,
      updated_at: cancelledAt,
    })
    .eq("id", sequenceId)
    .eq("status", "active")
    .select("*")
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "This sequence is no longer active." }, { status: 409 })

  await supabaseServer.from("lead_activities").insert([{
    lead_id: data.lead_id,
    type: "follow_up",
    user_name: payload?.cancelledByName || "Smart Steel",
    description: `Automatic estimate follow-ups cancelled. ${reason}`,
    timestamp: cancelledAt,
  }])

  await supabaseServer.from("leads").update({
    follow_up_at: null,
    next_action: "Client replied. Review the response and set the next appropriate action.",
  }).eq("id", data.lead_id)

  return NextResponse.json({ sequence: data })
}
