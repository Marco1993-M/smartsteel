import { NextResponse } from "next/server"
import { supabaseServer } from "lib/supabase-server"
import { getEstimateResponseOption } from "lib/crmEstimateFollowUps"

import { ESTIMATE_DECLINE_REASONS, parseDeclineFeedback } from "lib/estimateDeclineReasons.mjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RESPONSE_ACTIONS = {
  call_me: {
    cancel: true,
    nextAction: "Client is ready to proceed. Contact them to confirm the order and project handoff requirements.",
  },
  request_changes: {
    cancel: true,
    nextAction: "Client would like changes to the estimate. Contact them to confirm the required revisions.",
  },
  considering: {
    cancel: true,
    nextAction: "Client is planning for later. Contact them to agree a suitable future follow-up date.",
  },
  not_proceeding: {
    cancel: true,
    nextAction: "Client requested follow-ups stop. Review their feedback and confirm their intentions before marking Lost.",
  },
}

export async function POST(request) {
  try {
    const payload = await request.json()
    const token = String(payload?.token || "").trim()
    const option = getEstimateResponseOption(payload?.choice)
    const action = option ? RESPONSE_ACTIONS[option.key] : null

    if (!token || !option || !action) {
      return NextResponse.json({ error: "Choose a valid response." }, { status: 400 })
    }

    let feedback
    try {
      feedback = parseDeclineFeedback(option.key, payload.declineReason, payload.declineComment)
    } catch (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 })
    }
    const reasonLabel = ESTIMATE_DECLINE_REASONS.find((item) => item.key === feedback.reason)?.label
    const feedbackNote = [reasonLabel ? `Reason: ${reasonLabel}.` : "", feedback.comment ? `Client comment: ${feedback.comment}` : ""].filter(Boolean).join(" ")

    const { data: sequence, error } = await supabaseServer
      .from("crm_estimate_follow_up_sequences")
      .select("id, lead_id, estimate_id, status, current_step")
      .eq("response_token", token)
      .maybeSingle()

    if (error || !sequence) {
      return NextResponse.json({ error: "This response link is invalid or no longer available." }, { status: 404 })
    }

    const respondedAt = new Date().toISOString()
    const responseRecord = await supabaseServer.from("crm_estimate_follow_up_responses").insert([{
      sequence_id: sequence.id,
      lead_id: sequence.lead_id,
      estimate_id: sequence.estimate_id,
      response_key: option.key,
      response_label: option.label,
      ...(feedback.reason || feedback.comment ? { decline_reason: feedback.reason, decline_comment: feedback.comment } : {}),
      user_agent: request.headers.get("user-agent") || null,
    }])

    if (responseRecord.error) {
      return NextResponse.json({ error: "We could not record your response. Please try again." }, { status: 500 })
    }

    const sequenceUpdate = {
      last_response_key: option.key,
      last_response_label: option.label,
      last_responded_at: respondedAt,
      updated_at: respondedAt,
    }

    if (action.cancel && sequence.status === "active") {
      Object.assign(sequenceUpdate, {
        status: "cancelled",
        cancelled_at: respondedAt,
        cancellation_reason: `Client response: ${option.label}`,
        next_send_at: null,
      })
    }

    await supabaseServer.from("crm_estimate_follow_up_sequences").update(sequenceUpdate).eq("id", sequence.id)

    const leadUpdate = { next_action: [action.nextAction, feedbackNote].filter(Boolean).join(" ") }
    if (action.cancel) leadUpdate.follow_up_at = null
    await supabaseServer.from("leads").update(leadUpdate).eq("id", sequence.lead_id)

    await supabaseServer.from("lead_activities").insert([{
      lead_id: sequence.lead_id,
      type: "follow_up",
      user_name: "Client response",
      description: `Client selected: ${option.label}. ${action.cancel ? "Remaining automatic follow-ups were cancelled." : "The automatic sequence remains active."} ${feedbackNote}`,
      timestamp: respondedAt,
    }])

    return NextResponse.json({
      success: true,
      choice: option.key,
      label: option.label,
      sequenceCancelled: action.cancel,
    })
  } catch (error) {
    console.error("Estimate follow-up response error:", error)
    return NextResponse.json({ error: "We could not record your response. Please try again." }, { status: 500 })
  }
}
