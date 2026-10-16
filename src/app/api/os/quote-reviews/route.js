import { NextResponse } from "next/server"
import { getOsRequestContext } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { processQuoteReviewMail, reviewSchemaMissing } from "lib/quoteReviewServer"
import { REVIEW_HOST, REVIEW_OUTCOMES, validReviewSlot } from "lib/quoteReview.mjs"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request) {
  const context = await getOsRequestContext(request)
  if (context.response) return context.response
  const leadId = new URL(request.url).searchParams.get("leadId")
  let query = supabaseServer.from("crm_quote_reviews").select("*").order("starts_at", { ascending: false }).limit(200)
  query = leadId ? query.eq("lead_id", leadId) : query.in("status", ["booked", "cancelled", "no_show"])
  const { data: reviews, error } = await query
  if (error && reviewSchemaMissing(error)) return NextResponse.json({ records: [], blocks: [], setupRequired: true })
  if (error) return NextResponse.json({ error: "Quote reviews could not be loaded." }, { status: 500 })
  const leadIds = [...new Set((reviews || []).map((row) => row.lead_id))]
  const reviewIds = (reviews || []).map((row) => row.id)
  const [{ data: leads, error: leadError }, { data: estimates, error: estimateError }, { data: mail, error: mailError }, { data: blocks, error: blockError }] = await Promise.all([
    leadIds.length ? supabaseServer.from("leads").select("id,name,last_name,status").in("id", leadIds) : { data: [] },
    leadIds.length ? supabaseServer.from("estimates").select("lead_id,version_no,share_token,id").in("lead_id", leadIds).order("version_no", { ascending: false }) : { data: [] },
    reviewIds.length ? supabaseServer.from("crm_quote_review_mail").select("review_id,revision,last_error,sent_at,discarded_at").in("review_id", reviewIds) : { data: [] },
    supabaseServer.from("crm_quote_review_blocks").select("id,starts_at,note").gte("starts_at", new Date().toISOString()).order("starts_at"),
  ])
  if (leadError || estimateError || mailError || blockError) return NextResponse.json({ error: "Some review details could not be loaded. Please retry." }, { status: 500 })
  return NextResponse.json({ records: (reviews || []).map((review) => ({ ...review, lead: leads?.find((lead) => lead.id === review.lead_id), latestVersion: estimates?.find((estimate) => estimate.lead_id === review.lead_id)?.version_no, token: estimates?.find((estimate) => estimate.id === review.estimate_id)?.share_token, notificationError: mail?.some((item) => item.review_id === review.id && item.revision === review.revision && item.last_error && !item.sent_at && !item.discarded_at) })), blocks: blocks || [], mailReady: Boolean(process.env.RESEND_API_KEY), canManage: context.user.email?.toLowerCase() === REVIEW_HOST.email })
}

export async function POST(request) {
  const context = await getOsRequestContext(request)
  if (context.response) return context.response
  if (context.user.email?.toLowerCase() !== REVIEW_HOST.email) return NextResponse.json({ error: "Marco manages these call appointments." }, { status: 403 })
  try {
    const body = await request.json()
    if (body.action === "block") {
      if (!validReviewSlot(body.startsAt)) return NextResponse.json({ error: "Choose a future weekday hour within the booking window." }, { status: 400 })
      const { error } = await supabaseServer.rpc("crm_block_quote_review_slot", { p_starts_at: body.startsAt, p_note: String(body.note || "Unavailable").slice(0, 200) })
      if (error) return NextResponse.json({ error: error.message }, { status: 409 })
    } else if (body.action === "unblock") {
      const { error } = await supabaseServer.from("crm_quote_review_blocks").delete().eq("id", String(body.blockId || ""))
      if (error) throw error
    } else if (["complete", "no_show", "cancel"].includes(body.action)) {
      const notes = String(body.notes || "").trim()
      if (body.action === "complete" && (!REVIEW_OUTCOMES.includes(body.outcome) || notes.length < 3)) return NextResponse.json({ error: "Add an outcome and a short review note." }, { status: 400 })
      const { data, error } = await supabaseServer.rpc("crm_update_quote_review", { p_review_id: body.reviewId, p_action: body.action, p_actor: "Marco", p_expected_revision: Number(body.revision), p_notes: notes, p_outcome: body.outcome || null, p_next_action: body.nextAction || null, p_next_at: body.nextAt || null })
      if (error) return NextResponse.json({ error: error.message }, { status: 409 })
      if (body.action === "cancel") await processQuoteReviewMail({ reviewId: data.id })
    } else if (body.action === "retry_notifications") {
      await supabaseServer.from("crm_quote_review_mail").update({ attempts: 0, claimed_at: null, scheduled_at: new Date().toISOString() }).eq("review_id", body.reviewId).is("sent_at", null).is("discarded_at", null).not("last_error", "is", null)
      const result = await processQuoteReviewMail({ reviewId: body.reviewId })
      if (result.warning || result.error || result.results?.some((job) => job.status === "failed")) return NextResponse.json({ error: result.warning || result.error || "A notification still needs attention. Check delivery before retrying again." }, { status: 503 })
    } else return NextResponse.json({ error: "Choose a valid review action." }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "The review update could not be saved. Refresh and try again." }, { status: 500 })
  }
}
