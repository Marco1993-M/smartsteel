import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { getEstimateBrandIdentity, getNextFollowUpAt } from "lib/crmEstimateFollowUps"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatCurrency(value) {
  const amount = Number(value || 0)
  return `R ${amount.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`
}

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

function buildProposalHtml({ lead, estimate, builderSubmission, body, shareUrl }) {
  const brandIdentity = getEstimateBrandIdentity(lead, estimate)
  const isAtlas = brandIdentity === "atlas"
  const isLsf = brandIdentity === "lsf"
  const configuration = builderSubmission?.configuration || {}
  const summary = builderSubmission?.summary || {}
  const reference = configuration.designReference || summary.designReference || (isAtlas
    ? "Atlas project proposal"
    : isLsf
      ? "LSF project proposal"
      : "Smart Steel project proposal")
  const dimensions = configuration.width && configuration.length
    ? `${configuration.width}m × ${configuration.length}m${configuration.wallHeight ? ` × ${configuration.wallHeight}m` : ""}`
    : null
  const clientName = [lead.name, lead.last_name].filter(Boolean).join(" ").trim() || "Client"
  const message = escapeHtml(body).replace(/\r?\n/g, "<br>")
  const accent = isAtlas ? "#0043f3" : "#da1a33"
  const dark = isAtlas ? "#001d2e" : "#020617"
  const pale = isAtlas ? "#c1d9e5" : "#fee2e2"
  const logo = isAtlas
    ? "https://www.smartsteel.co.za/atlas/atlas-logo-horizontal-light.png"
    : "https://www.smartsteel.co.za/Logo.png"
  const brandName = isAtlas ? "Atlas by Smart Steel" : isLsf ? "Smart Steel LSF" : "Smart Steel"
  const estimateName = isAtlas ? "Atlas" : isLsf ? "LSF" : "Smart Steel"

  return `<!doctype html>
  <html lang="en">
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f5f9;">
        <tr><td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #dbe4ee;">
            <tr><td style="padding:28px 30px;background:${dark};background-image:linear-gradient(120deg,${dark},${accent});">
              <img src="${logo}" alt="${brandName}" width="210" style="display:block;max-width:210px;height:auto;border:0;">
              <p style="margin:28px 0 8px;color:${pale};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Reviewed project proposal</p>
              <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;">Your ${estimateName} estimate is ready.</h1>
            </td></tr>
            <tr><td style="padding:30px;">
              <div style="color:#334155;font-size:15px;line-height:1.75;">${message}</div>

              <div style="margin:26px 0;padding:18px 20px;background:#f8fafc;border-left:4px solid ${accent};">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr><td style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">Estimate</td><td align="right" style="color:#0f172a;font-size:13px;font-weight:800;">V${escapeHtml(estimate.version_no || 1)}</td></tr>
                  <tr><td style="padding-top:10px;color:#64748b;font-size:13px;">${escapeHtml(reference)}</td><td align="right" style="padding-top:10px;color:#0f172a;font-size:18px;font-weight:800;">${escapeHtml(formatCurrency(estimate.total))}</td></tr>
                  ${dimensions ? `<tr><td colspan="2" style="padding-top:7px;color:#64748b;font-size:12px;">${escapeHtml(dimensions)}</td></tr>` : ""}
                </table>
              </div>

              <p style="margin:0 0 20px;color:#475569;font-size:13px;line-height:1.65;">The reviewed estimate is attached as a PDF. You can also open the secure online version below.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="${accent}" style="border-radius:4px;">
                <a href="${escapeHtml(shareUrl)}" style="display:inline-block;padding:14px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">View reviewed estimate</a>
              </td></tr></table>

              <p style="margin:26px 0 0;color:#64748b;font-size:12px;line-height:1.6;">Prepared for ${escapeHtml(clientName)}. Please refer to the attached estimate for the confirmed scope, exclusions, validity and commercial terms.</p>
            </td></tr>
            <tr><td style="padding:20px 30px;background:${dark};color:#ffffff;">
              <p style="margin:0 0 5px;font-size:13px;font-weight:700;">${isAtlas ? "Atlas developed by Smart Steel" : brandName}</p>
              <p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.6;">info@smartsteel.co.za · +27 82 846 4555 · smartsteel.co.za</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>`
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  try {
    const payload = await request.json()
    const leadId = String(payload?.leadId || "").trim()
    const estimateId = String(payload?.estimateId || "").trim()
    const subject = String(payload?.subject || "").trim()
    const body = String(payload?.body || "").trim()

    if (!leadId || !estimateId || !subject || !body) {
      return NextResponse.json({ error: "Lead, estimate, subject and email copy are required." }, { status: 400 })
    }

    const [{ data: lead, error: leadError }, { data: estimate, error: estimateError }] = await Promise.all([
      supabaseServer.from("leads").select("id, name, last_name, email, product_type").eq("id", leadId).single(),
      // Keep the send lookup limited to columns guaranteed by the estimate schema.
      // Optional display fields are deliberately tolerated by the estimate save flow.
      supabaseServer.from("estimates").select("id, lead_id, title, version_no, total, share_token, product_type").eq("id", estimateId).single(),
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
    if (!lead.email) return NextResponse.json({ error: "The lead does not have an email address." }, { status: 400 })
    if (!estimate.share_token) return NextResponse.json({ error: "Save the estimate before sending it." }, { status: 400 })

    const { data: builderSubmission } = await supabaseServer
      .from("warehouse_builder_submissions")
      .select("configuration, summary")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const pdfResponse = await fetch(new URL(`/api/estimates/${estimate.id}/pdf`, request.url), { cache: "no-store" })
    if (!pdfResponse.ok) {
      const pdfError = await pdfResponse.json().catch(() => null)
      return NextResponse.json({ error: pdfError?.error || "Could not prepare the estimate PDF." }, { status: 500 })
    }
    const pdfBase64 = Buffer.from(await pdfResponse.arrayBuffer()).toString("base64")
    const shareUrl = new URL(`/quotes/${estimate.share_token}`, request.url).toString()
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
        html: buildProposalHtml({ lead, estimate, builderSubmission, body, shareUrl }),
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
        status: "quoted",
        quote_value: Number(estimate.total || 0),
        follow_up_at: firstFollowUpAt,
        next_action: `Awaiting the client's review of ${estimate.title || `estimate V${estimate.version_no || 1}`}. Automatic follow-up 1 is scheduled.`,
      })
      .eq("id", lead.id)
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
      description: `${estimate.title || `Estimate V${estimate.version_no || 1}`} sent to ${lead.email}. Resend delivery ID: ${emailId || "not returned"}. Subject: ${subject}`,
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
        status: "active",
        current_step: 0,
        next_send_at: firstFollowUpAt,
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
      await supabaseServer.from("leads").update({
        follow_up_at: null,
        next_action: "Estimate sent. Schedule the first follow-up manually because the automatic sequence could not be started.",
      }).eq("id", lead.id)
    } else {
      await supabaseServer.from("lead_activities").insert([{
        lead_id: lead.id,
        type: "follow_up",
        user_name: "System",
        description: `Three automatic estimate follow-ups scheduled. The first is due ${new Date(firstFollowUpAt).toLocaleDateString("en-ZA")}. Cancel the sequence manually if the client replies.`,
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
    })
  } catch (error) {
    console.error("Estimate proposal email error:", error)
    return NextResponse.json({ error: error?.message || "Could not send the proposal." }, { status: 500 })
  }
}
