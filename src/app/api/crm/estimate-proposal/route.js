import { buildProposalHtml } from "lib/estimateProposalEmail"
import { NextResponse } from "next/server"
import { getOsRequestContext } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { getNextFollowUpAt } from "lib/crmEstimateFollowUps"
import { SMART_STEEL_SITE_URL } from "lib/brandEntity"
import { quoteReviewUrl } from "lib/quoteReview.mjs"
import { getQuoteReviewHold, quoteReviewsReady } from "lib/quoteReviewServer"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function recordIdsMatch(left, right) {
  return String(left ?? "").trim() === String(right ?? "").trim()
}

function buildFilename(estimate) {
  const base = String(estimate?.title || "smart-steel-estimate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${base || "smart-steel-estimate"}.pdf`
}

function hasPricedServiceLine(lineItems, pattern) {
  return (Array.isArray(lineItems) ? lineItems : []).some((item) => {
    const identity = `${item?.code || ""} ${item?.label || ""}`
    return pattern.test(identity) && Number(item?.total || 0) > 0
  })
}


export async function POST(request) {
  const context = await getOsRequestContext(request)
  if (context.response) return context.response
  const senderName = String(context.user.email || "").toLowerCase() === "info@smartsteel.co.za"
    ? "Marco"
    : context.user.user_metadata?.full_name || context.user.user_metadata?.name || "The Smart Steel Team"

  try {
    const payload = await request.json()
    const leadId = String(payload?.leadId || "").trim()
    const estimateId = String(payload?.estimateId || "").trim()
    const subject = String(payload?.subject || "").trim()
    const body = String(payload?.body || "").trim()
    const deferInstallation = payload?.deferInstallation === true
    const deferDelivery = payload?.deferDelivery === true

    if (!leadId || !estimateId || !subject || !body) {
      return NextResponse.json({ error: "Lead, estimate, subject and email copy are required." }, { status: 400 })
    }

    const [{ data: lead, error: leadError }, { data: estimate, error: estimateError }] = await Promise.all([
      supabaseServer.from("leads").select("id, name, last_name, email, product_type, status, quote_value").eq("id", leadId).single(),
      // Keep the send lookup limited to columns guaranteed by the estimate schema.
      // Optional display fields are deliberately tolerated by the estimate save flow.
      supabaseServer.from("estimates").select("id, lead_id, title, version_no, total, share_token, product_type, status, input_data, line_items").eq("id", estimateId).single(),
    ])

    if (leadError) {
      console.error("Estimate proposal lead lookup failed:", leadError)
      return NextResponse.json({ error: `Could not load the lead: ${leadError.message}` }, { status: 500 })
    }
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    if (estimateError) {
      console.error("Estimate proposal estimate lookup failed:", estimateError)
      return NextResponse.json({ error: `Could not load the estimate: ${estimateError.message}` }, { status: 500 })
    }
    if (!estimate || !recordIdsMatch(estimate.lead_id, lead.id)) {
      return NextResponse.json({ error: "Estimate not found for this lead." }, { status: 404 })
    }
    if (["accepted", "cancelled", "superseded", "declined"].includes(estimate.status)) return NextResponse.json({ error: "Create and send a new quote version instead of resending a closed quote." }, { status: 409 })
    if (!lead.email) return NextResponse.json({ error: "The lead does not have an email address." }, { status: 400 })
    if (!estimate.share_token) return NextResponse.json({ error: "Save the estimate before sending it." }, { status: 400 })

    const { data: builderSubmission } = await supabaseServer
      .from("warehouse_builder_submissions")
      .select("configuration, summary")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const configuration = builderSubmission?.configuration || {}
    const estimateInput = estimate.input_data || {}
    const deliveryRequested = typeof estimateInput.deliveryRequested === "boolean"
      ? estimateInput.deliveryRequested
      : Boolean(configuration.deliveryRequired)
    const installationRequested = typeof estimateInput.installationRequested === "boolean"
      ? estimateInput.installationRequested
      : Boolean(configuration.installationInterest)
    const installationPriced = hasPricedServiceLine(estimate.line_items, /install|erection|assembly/i)
    const deliveryPriced = hasPricedServiceLine(estimate.line_items, /delivery|transport/i)
    const unresolvedServices = [
      deliveryRequested && !deliveryPriced && !deferDelivery ? "delivery" : null,
      installationRequested && !installationPriced && !deferInstallation ? "installation" : null,
    ].filter(Boolean)

    if (unresolvedServices.length) {
      return NextResponse.json({
        error: `The client requested ${unresolvedServices.join(" and ")}, but the estimate does not contain a priced ${unresolvedServices.join(" and ")} line item. Add the applicable price before sending the proposal.`,
        code: "requested_services_unpriced",
        unresolvedServices,
      }, { status: 409 })
    }

    // The explicit exception is recorded on this estimate version, so its PDF and
    // online quote show the same scope. The lead's original request is preserved.
    const installationDeferred = installationRequested && !installationPriced && deferInstallation
    const deliveryDeferred = deliveryRequested && !deliveryPriced && deferDelivery
    const nextInput = { ...estimateInput, installationRequested, installationDeferred, deliveryRequested, deliveryDeferred }
    if (Boolean(estimateInput.installationDeferred) !== installationDeferred || estimateInput.installationRequested !== installationRequested || Boolean(estimateInput.deliveryDeferred) !== deliveryDeferred || estimateInput.deliveryRequested !== deliveryRequested) {
      const { error: scopeError } = await supabaseServer.from("estimates")
        .update({ input_data: nextInput }).eq("id", estimate.id)
      if (scopeError) return NextResponse.json({ error: `Could not save the service scope: ${scopeError.message}` }, { status: 500 })
      estimate.input_data = nextInput
    }

    const pdfResponse = await fetch(new URL(`/api/estimates/${estimate.id}/pdf`, request.url), { cache: "no-store" })
    if (!pdfResponse.ok) {
      const pdfError = await pdfResponse.json().catch(() => null)
      return NextResponse.json({ error: pdfError?.error || "Could not prepare the estimate PDF." }, { status: 500 })
    }
    const pdfBase64 = Buffer.from(await pdfResponse.arrayBuffer()).toString("base64")
    const shareUrl = new URL(`/quotes/${estimate.share_token}`, SMART_STEEL_SITE_URL).toString()
    const bookingUrl = await quoteReviewsReady() ? quoteReviewUrl(estimate.share_token, SMART_STEEL_SITE_URL) : ""
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) return NextResponse.json({ error: "Email service is not configured." }, { status: 503 })

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CLIENT_CONFIRMATION_FROM || "Smart Steel <info@smartsteel.co.za>",
        to: [lead.email],
        reply_to: "info@smartsteel.co.za",
        subject,
        html: buildProposalHtml({ lead, estimate, builderSubmission, body, shareUrl, bookingUrl, senderName }),
        attachments: [{ filename: buildFilename(estimate), content: pdfBase64 }],
      }),
    })

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text()
      return NextResponse.json({ error: `Could not send the proposal: ${resendError}` }, { status: 502 })
    }

    const resendPayload = await resendResponse.json().catch(() => null)
    const emailId = resendPayload?.id || null
    const sentAt = new Date().toISOString()
    const firstFollowUpAt = getNextFollowUpAt(sentAt, 1)
    const reviewHold = await getQuoteReviewHold(lead.id)
    const lifecycleWarnings = []

    let estimateLifecycle = await supabaseServer
      .from("estimates")
      .update({ status: "sent", sent_at: sentAt, sent_by_name: "Smart Steel" })
      .eq("id", estimate.id)

    if (estimateLifecycle.error && /sent_at|sent_by_name|schema cache/i.test(estimateLifecycle.error.message || "")) {
      estimateLifecycle = await supabaseServer
        .from("estimates")
        .update({ status: "sent" })
        .eq("id", estimate.id)
    }
    if (estimateLifecycle.error) lifecycleWarnings.push(`Estimate status: ${estimateLifecycle.error.message}`)

    const leadLifecycle = await supabaseServer
      .from("leads")
      .update({
        status: lead.status === "won" ? "won" : "quoted",
        quote_value: lead.status === "won" ? lead.quote_value : Number(estimate.total || 0),
        ...(reviewHold ? {} : {
          follow_up_at: firstFollowUpAt,
          next_action: `Awaiting the client's review of ${estimate.title || `estimate V${estimate.version_no || 1}`}. Automatic follow-up 1 is scheduled.`,
        }),
      })
      .eq("id", lead.id)
      .neq("status", "won")
    if (leadLifecycle.error) lifecycleWarnings.push(`Lead status: ${leadLifecycle.error.message}`)

    const emailReceipt = await supabaseServer.from("crm_email_events").insert([{
      estimate_id: estimate.id,
      lead_id: lead.id,
      estimate_version: Number(estimate.version_no || 0) || null,
      email_type: "estimate",
      recipient: lead.email,
      subject,
      body,
      sent_at: sentAt,
      sent_by_name: "Smart Steel",
      follow_up_number: 0,
      channel: "email",
    }])
    if (emailReceipt.error && !/crm_email_events|schema cache|does not exist/i.test(emailReceipt.error.message || "")) {
      lifecycleWarnings.push(`Email receipt: ${emailReceipt.error.message}`)
    }

    const activity = await supabaseServer.from("lead_activities").insert([{
      lead_id: lead.id,
      type: "email",
      user_name: "System",
      description: `${estimate.title || `Estimate V${estimate.version_no || 1}`} sent to ${lead.email}. ${installationDeferred ? "Installation requested; deferred for separate pricing. " : ""}${deliveryDeferred ? "Delivery requested; deferred for separate pricing. " : ""}Resend delivery ID: ${emailId || "not returned"}. Subject: ${subject}`,
      timestamp: sentAt,
    }])
    if (activity.error) lifecycleWarnings.push(`Activity record: ${activity.error.message}`)

    await supabaseServer
      .from("crm_estimate_follow_up_sequences")
      .update({
        status: "cancelled",
        cancelled_at: sentAt,
        cancellation_reason: "A newer estimate was sent to this lead.",
        next_send_at: null,
        updated_at: sentAt,
      })
      .eq("lead_id", lead.id)
      .eq("status", "active")
      .neq("estimate_id", estimate.id)

    const { data: followUpSequence, error: followUpError } = await supabaseServer
      .from("crm_estimate_follow_up_sequences")
      .upsert([{
        lead_id: lead.id,
        estimate_id: estimate.id,
        recipient: lead.email,
        status: reviewHold ? "paused" : "active",
        current_step: 0,
        next_send_at: reviewHold ? null : firstFollowUpAt,
        started_at: sentAt,
        last_sent_at: null,
        completed_at: null,
        cancelled_at: null,
        cancelled_by_name: null,
        cancellation_reason: null,
        last_error: null,
        last_response_key: null,
        last_response_label: null,
        last_responded_at: null,
        updated_at: sentAt,
      }], { onConflict: "estimate_id" })
      .select("*")
      .single()

    if (followUpError) {
      lifecycleWarnings.push(`Automatic follow-ups: ${followUpError.message}`)
      if (!reviewHold) await supabaseServer.from("leads").update({
        follow_up_at: null,
        next_action: "Estimate sent. Schedule the first follow-up manually because the automatic sequence could not be started.",
      }).eq("id", lead.id)
    } else {
      await supabaseServer.from("lead_activities").insert([{
        lead_id: lead.id,
        type: "follow_up",
        user_name: "System",
        description: reviewHold ? "Generic estimate follow-ups remain paused for the quote-review workflow." : `Three automatic estimate follow-ups scheduled. The first is due ${new Date(firstFollowUpAt).toLocaleDateString("en-ZA")}. Cancel the sequence manually if the client replies.`,
        timestamp: sentAt,
      }])
    }

    return NextResponse.json({
      success: true,
      emailId,
      sentAt,
      lifecycleRecorded: lifecycleWarnings.length === 0,
      lifecycleWarnings,
      followUpSequence: followUpSequence || null,
      reviewFollowUpPaused: Boolean(reviewHold),
    })
  } catch (error) {
    console.error("Estimate proposal email error:", error)
    return NextResponse.json({ error: error?.message || "Could not send the proposal." }, { status: 500 })
  }
}
