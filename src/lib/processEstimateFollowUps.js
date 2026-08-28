import { supabaseServer } from "lib/supabase-server"
import {
  buildFollowUpCopy,
  buildFollowUpHtml,
  getEstimateBrandIdentity,
  getNextFollowUpAt,
} from "lib/crmEstimateFollowUps"

async function stopSequence(sequence, reason) {
  const now = new Date().toISOString()
  await supabaseServer.from("crm_estimate_follow_up_sequences").update({
    status: "cancelled",
    cancellation_reason: reason,
    cancelled_at: now,
    next_send_at: null,
    updated_at: now,
  }).eq("id", sequence.id)
}

export async function processDueEstimateFollowUps({ requestUrl, limit = 25 } = {}) {
  if (!process.env.RESEND_API_KEY) return { error: "Email service is not configured.", status: 503 }

  const now = new Date().toISOString()
  const { data: sequences, error } = await supabaseServer
    .from("crm_estimate_follow_up_sequences")
    .select("*")
    .eq("status", "active")
    .lte("next_send_at", now)
    .order("next_send_at", { ascending: true })
    .limit(limit)

  if (error) return { error: error.message, status: 500 }

  const results = []
  for (const sequence of sequences || []) {
    const [{ data: lead }, { data: estimate }] = await Promise.all([
      supabaseServer.from("leads").select("id, name, last_name, email, product_type, status").eq("id", sequence.lead_id).maybeSingle(),
      supabaseServer.from("estimates").select("id, title, version_no, product_type, share_token, status").eq("id", sequence.estimate_id).maybeSingle(),
    ])

    if (!lead || !estimate || !lead.email || !estimate.share_token) {
      await stopSequence(sequence, "Required lead or estimate information is no longer available.")
      results.push({ id: sequence.id, status: "cancelled", reason: "missing_record" })
      continue
    }

    if (["won", "lost"].includes(String(lead.status || "").toLowerCase()) || ["accepted", "declined", "cancelled", "superseded"].includes(String(estimate.status || "").toLowerCase())) {
      await stopSequence(sequence, "The lead or estimate is no longer awaiting a decision.")
      results.push({ id: sequence.id, status: "cancelled", reason: "lifecycle_changed" })
      continue
    }

    const stepNumber = Number(sequence.current_step || 0) + 1
    const copy = buildFollowUpCopy({ stepNumber, lead, estimate })
    if (!copy) {
      await stopSequence(sequence, "No further follow-up step is available.")
      continue
    }

    const baseUrl = requestUrl || "https://www.smartsteel.co.za"
    const shareUrl = new URL(`/quotes/${estimate.share_token}`, baseUrl).toString()
    const responseBaseUrl = new URL(`/estimate-response/${sequence.response_token}`, baseUrl).toString()
    const brandIdentity = getEstimateBrandIdentity(lead, estimate)
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `estimate-follow-up-${sequence.id}-${stepNumber}`,
      },
      body: JSON.stringify({
        from: process.env.CLIENT_CONFIRMATION_FROM || "Smart Steel <info@smartsteel.co.za>",
        to: [lead.email],
        reply_to: "info@smartsteel.co.za",
        subject: copy.subject,
        html: buildFollowUpHtml({ copy, estimate: { ...estimate, brandIdentity }, shareUrl, responseBaseUrl, isAtlas: brandIdentity === "atlas" }),
      }),
    })

    if (!resendResponse.ok) {
      const lastError = await resendResponse.text()
      await supabaseServer.from("crm_estimate_follow_up_sequences").update({ last_error: lastError, updated_at: now }).eq("id", sequence.id)
      results.push({ id: sequence.id, status: "failed", stepNumber })
      continue
    }

    const resendPayload = await resendResponse.json().catch(() => null)
    const completed = stepNumber >= 3
    const nextSendAt = completed ? null : getNextFollowUpAt(now, stepNumber + 1)

    await supabaseServer.from("crm_email_events").insert([{
      estimate_id: estimate.id,
      lead_id: lead.id,
      estimate_version: Number(estimate.version_no || 0) || null,
      email_type: "follow_up",
      recipient: lead.email,
      subject: copy.subject,
      body: copy.body,
      sent_at: now,
      sent_by_name: "Smart Steel automation",
      follow_up_number: stepNumber,
      channel: "email",
    }])

    await supabaseServer.from("lead_activities").insert([{
      lead_id: lead.id,
      type: "email",
      user_name: "System",
      description: `Automatic estimate follow-up ${stepNumber} sent to ${lead.email}. Resend delivery ID: ${resendPayload?.id || "not returned"}. Subject: ${copy.subject}`,
      timestamp: now,
    }])

    await supabaseServer.from("crm_estimate_follow_up_sequences").update({
      status: completed ? "completed" : "active",
      current_step: stepNumber,
      last_sent_at: now,
      next_send_at: nextSendAt,
      completed_at: completed ? now : null,
      last_error: null,
      updated_at: now,
    }).eq("id", sequence.id)

    await supabaseServer.from("leads").update({
      follow_up_at: nextSendAt,
      next_action: completed
        ? "Automatic estimate follow-ups completed. Review the lead and decide whether to call, nurture or mark unresponsive."
        : `Automatic estimate follow-up ${stepNumber} sent. Awaiting the client's reply.`,
    }).eq("id", lead.id)

    results.push({ id: sequence.id, status: completed ? "completed" : "sent", stepNumber, nextSendAt })
  }

  return { processed: results.length, results }
}
