import { NextResponse } from "next/server"
import { supabaseServer } from "lib/supabase-server"
import { loadQuoteReviewContext, processQuoteReviewMail } from "lib/quoteReviewServer"
import { REVIEW_HOST, reviewSlots, validReviewSlot } from "lib/quoteReview.mjs"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function bookingError(error) {
  return ["P0001", "23505"].includes(error.code) ? error.message : "The booking could not be updated. Refresh the page and try again."
}

function publicReview(review) {
  if (!review) return null
  return { startsAt: review.starts_at, status: review.status, revision: review.revision, phone: review.phone, question: review.question, timezone: review.customer_timezone }
}

export async function GET(request, { params }) {
  try {
    const { token } = await params
    const context = await loadQuoteReviewContext(token)
    if (!context) return NextResponse.json({ error: "This proposal link is unavailable. Please contact info@smartsteel.co.za." }, { status: 404 })
    const { data: bookings, error } = await supabaseServer.from("crm_quote_reviews").select("starts_at").eq("status", "booked").gte("starts_at", new Date().toISOString())
    const { data: blocks, error: blockError } = await supabaseServer.from("crm_quote_review_blocks").select("starts_at").gte("starts_at", new Date().toISOString())
    if (error || blockError) throw new Error("Available times could not be loaded. Please try again.")
    return NextResponse.json({ title: context.estimate.title, version: context.estimate.version_no, firstName: String(context.lead.name || "").split(/\s+/)[0], phone: context.review?.phone || context.lead.phone || "", host: REVIEW_HOST, canBook: context.canBook, review: publicReview(context.review), dates: reviewSlots(new Date(), [...(bookings || []), ...(blocks || [])].map((row) => row.starts_at)) }, { headers: { "Cache-Control": "private, no-store" } })
  } catch {
    return NextResponse.json({ error: "Available times could not be loaded. Please try again or contact info@smartsteel.co.za." }, { status: 503 })
  }
}

export async function POST(request, { params }) {
  try {
    const { token } = await params
    const context = await loadQuoteReviewContext(token)
    if (!context) return NextResponse.json({ error: "This proposal link is unavailable." }, { status: 404 })
    const body = await request.json()
    let review
    if (body.action === "cancel") {
      if (context.review?.status !== "booked") return NextResponse.json({ error: "There is no active call to cancel." }, { status: 409 })
      const result = await supabaseServer.rpc("crm_update_quote_review", { p_review_id: context.review.id, p_action: "cancel", p_actor: "Customer", p_expected_revision: Number(body.revision), p_notes: "Customer cancelled the call." })
      if (result.error) return NextResponse.json({ error: bookingError(result.error) }, { status: 409 })
      review = result.data
    } else if (body.action === "book") {
      if (!validReviewSlot(body.startsAt)) return NextResponse.json({ error: "Please select an available call time." }, { status: 400 })
      const phone = String(body.phone || "").trim()
      if (!/^[+\d()\s.-]{7,40}$/.test(phone) || phone.replace(/\D/g, "").length < 7) return NextResponse.json({ error: "Please confirm a valid contact number." }, { status: 400 })
      const timezone = String(body.timezone || REVIEW_HOST.timeZone)
      try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format() } catch { return NextResponse.json({ error: "Please choose a valid timezone." }, { status: 400 }) }
      const question = String(body.question || "").trim()
      if (question.length > 1000) return NextResponse.json({ error: "Keep your question under 1,000 characters." }, { status: 400 })
      const result = await supabaseServer.rpc("crm_book_quote_review", { p_estimate_id: context.estimate.id, p_starts_at: new Date(body.startsAt).toISOString(), p_phone: phone, p_question: question, p_timezone: timezone, p_expected_revision: body.revision == null ? null : Number(body.revision) })
      if (result.error) return NextResponse.json({ error: bookingError(result.error) }, { status: 409 })
      review = result.data
    } else return NextResponse.json({ error: "Choose a valid booking action." }, { status: 400 })
    const notifications = await processQuoteReviewMail({ reviewId: review.id })
    return NextResponse.json({ review: publicReview(review), notificationPending: Boolean(notifications.warning || notifications.error || notifications.results?.some((item) => item.status === "failed")) })
  } catch {
    return NextResponse.json({ error: "Your request could not be completed. Refresh to check your booking before trying again." }, { status: 503 })
  }
}
