import { supabaseServer } from "./supabase-server"
import { SMART_STEEL_SITE_URL } from "./brandEntity"
import { REVIEW_HOST, formatReviewTime, quoteReviewUrl, escapeReviewHtml, reviewMailApplies } from "./quoteReview.mjs"

export function reviewSchemaMissing(error) {
  return /crm_quote_review|schema cache|does not exist/i.test(error?.message || "")
}

export async function quoteReviewsReady() {
  const { error } = await supabaseServer.from("crm_quote_reviews").select("id").limit(1)
  if (error && reviewSchemaMissing(error)) return false
  if (error) throw new Error("Call availability could not be checked. Please try again.")
  return true
}

export async function getQuoteReviewHold(leadId) {
  const { data, error } = await supabaseServer.from("crm_quote_reviews").select("id,status,starts_at").eq("lead_id", leadId).eq("follow_up_hold", true).order("created_at", { ascending: false }).limit(1).maybeSingle()
  if (error && reviewSchemaMissing(error)) return null
  if (error) throw new Error("Could not check quote-review follow-up coverage.")
  return data
}

export async function loadQuoteReviewContext(token) {
  if (!/^[a-zA-Z0-9_-]{20,128}$/.test(String(token || ""))) return null
  const { data: estimate, error } = await supabaseServer.from("estimates").select("id,lead_id,title,version_no,status,share_token").eq("share_token", token).maybeSingle()
  if (error || !estimate) return null
  const [{ data: lead }, { data: latest }, { data: reviews, error: reviewError }] = await Promise.all([
    supabaseServer.from("leads").select("id,name,last_name,email,phone,status").eq("id", estimate.lead_id).maybeSingle(),
    supabaseServer.from("estimates").select("version_no").eq("lead_id", estimate.lead_id).order("version_no", { ascending: false }).limit(1).maybeSingle(),
    supabaseServer.from("crm_quote_reviews").select("id,estimate_id,starts_at,status,revision,phone,question,customer_timezone,quote_version,quote_title").eq("lead_id", estimate.lead_id).order("created_at", { ascending: false }).limit(20),
  ])
  if (reviewError) throw new Error(reviewSchemaMissing(reviewError) ? "Call booking is being set up. Please reply to your proposal email to arrange a call." : "Call availability is temporarily unavailable.")
  if (!lead) return null
  const review = reviews?.find((item) => item.status === "booked") || reviews?.[0] || null
  const canBook = estimate.status === "sent" && !["won", "lost"].includes(String(lead.status).toLowerCase()) && latest?.version_no === estimate.version_no
  return { estimate, lead, review, canBook }
}

function buildMail({ job, review, lead, token }) {
  const owner = job.kind.startsWith("owner_")
  const cancelled = job.kind.endsWith("cancellation")
  const reminder = job.kind.endsWith("reminder")
  const name = [lead.name, lead.last_name].filter(Boolean).join(" ") || "Client"
  const time = formatReviewTime(review.starts_at)
  const heading = cancelled ? "Your quote review has been cancelled" : reminder ? "Your quote review is coming up" : review.revision > 1 ? "Your quote review has been updated" : "Your quote review is booked"
  const safe = escapeReviewHtml
  const manageUrl = quoteReviewUrl(token, SMART_STEEL_SITE_URL)
  const link = owner ? new URL(`/os?review=${review.id}#quote-reviews`, SMART_STEEL_SITE_URL).toString() : manageUrl
  const customerTime = formatReviewTime(review.starts_at, review.customer_timezone)
  return {
    to: owner ? REVIEW_HOST.email : lead.email,
    subject: `${owner ? `${name}: ` : ""}${cancelled ? "Quote review cancelled" : reminder ? "Quote review reminder" : review.revision > 1 ? "Quote review rescheduled" : "Quote review confirmed"} · ${time} SAST`,
    html: `<div style="background:#f1f5f9;padding:24px;font-family:Arial,sans-serif;color:#001d2e;"><div style="max-width:600px;margin:auto;padding:28px;background:white;border:1px solid #dbe4ee;border-radius:12px;"><p style="font-size:12px;font-weight:700;color:#0043f3;">SMART STEEL · QUOTE REVIEW</p><h1 style="font-size:24px;">${safe(heading)}</h1><p>Hi ${safe(owner ? "Marco" : String(lead.name || "there").split(/\s+/)[0])},</p><p style="line-height:1.6;">${cancelled ? "The appointment has been cancelled. Please get in touch if you would like to agree another time." : `${owner ? `Call ${safe(name)}` : "Marco will call you"} on <strong>${safe(review.phone)}</strong> for a 15-minute conversation about the proposal.`}</p><div style="padding:16px;background:#f8fafc;line-height:1.7;"><strong>${safe(time)} SAST (UTC+2)</strong>${!owner && review.customer_timezone !== REVIEW_HOST.timeZone ? `<br>${safe(customerTime)} · ${safe(review.customer_timezone)}` : ""}<br>${safe(review.quote_title)} · V${review.quote_version}</div>${owner && review.question ? `<p style="line-height:1.6;"><strong>Question in advance:</strong><br>${safe(review.question)}</p>` : ""}<p style="margin-top:24px;"><a href="${safe(link)}" style="display:inline-block;border-radius:6px;padding:12px 18px;background:#0043f3;color:#fff;text-decoration:none;font-weight:700;">${owner ? "Open review in the OS" : cancelled ? "Choose another time" : "Change or cancel this call"}</a></p><p style="font-size:13px;line-height:1.6;color:#64748b;">${owner ? "Record attendance, the outcome and the next action after the call." : "You can also reply directly to this email. Your proposal remains available through its original link."}</p><p>Kind regards,<br>The Smart Steel Team</p></div></div>`,
  }
}

export async function processQuoteReviewMail({ reviewId, limit = 30 } = {}) {
  if (!process.env.RESEND_API_KEY) return { processed: 0, warning: "Email service is not configured." }
  let query = supabaseServer.from("crm_quote_review_mail").select("*").is("sent_at", null).is("discarded_at", null).lte("scheduled_at", new Date().toISOString()).lt("attempts", 8).order("scheduled_at").limit(limit)
  if (reviewId) query = query.eq("review_id", reviewId)
  const { data: jobs, error } = await query
  if (error && reviewSchemaMissing(error)) return { processed: 0, setupRequired: true }
  if (error) return { processed: 0, error: error.message }
  const results = []
  for (const job of jobs || []) {
    const { data: claimed, error: claimError } = await supabaseServer.rpc("crm_claim_quote_review_mail", { p_id: job.id })
    if (claimError || !claimed) continue
    const { data: review } = await supabaseServer.from("crm_quote_reviews").select("*").eq("id", job.review_id).maybeSingle()
    if (!reviewMailApplies(job, review)) {
      await supabaseServer.from("crm_quote_review_mail").update({ discarded_at: new Date().toISOString(), last_error: "Superseded appointment or reminder no longer applicable." }).eq("id", job.id)
      continue
    }
    try {
      if (job.first_attempt_at && new Date(job.first_attempt_at).getTime() < Date.now() - 23 * 3600000) throw new Error("Delivery retry window elapsed. Verify the previous email delivery before sending manually.")
      const [{ data: lead }, { data: estimate }] = await Promise.all([
        supabaseServer.from("leads").select("name,last_name,email").eq("id", review.lead_id).single(),
        supabaseServer.from("estimates").select("share_token").eq("id", review.estimate_id).single(),
      ])
      if (!lead?.email || !estimate?.share_token) throw new Error("Customer contact or proposal link is unavailable.")
      const message = buildMail({ job, review, lead, token: estimate.share_token })
      // Fetch the current revision immediately before dispatch, including retries.
      const { data: current, error: currentError } = await supabaseServer.from("crm_quote_reviews").select("revision,status").eq("id", review.id).single()
      if (currentError) throw new Error("Could not recheck the booking before sending.")
      if (current.revision !== job.revision || current.status !== review.status) {
        await supabaseServer.from("crm_quote_review_mail").update({ discarded_at: new Date().toISOString() }).eq("id", job.id)
        continue
      }
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `quote-review-${job.id}` }, body: JSON.stringify({ from: process.env.CLIENT_CONFIRMATION_FROM || "Smart Steel <info@smartsteel.co.za>", reply_to: REVIEW_HOST.email, to: [message.to], subject: message.subject, html: message.html }) })
      if (!response.ok) throw new Error(`Email delivery returned ${response.status}.`)
      const { error: receiptError } = await supabaseServer.from("crm_quote_review_mail").update({ sent_at: new Date().toISOString(), last_error: null }).eq("id", job.id)
      if (receiptError) throw new Error("Email sent; delivery receipt could not be saved. Retry uses the same delivery key.")
      results.push({ id: job.id, status: "sent" })
    } catch (sendError) {
      await supabaseServer.from("crm_quote_review_mail").update({ last_error: sendError.message, claimed_at: null, scheduled_at: new Date(Date.now() + 5 * 60000).toISOString() }).eq("id", job.id)
      results.push({ id: job.id, status: "failed" })
    }
  }
  return { processed: results.length, results }
}
