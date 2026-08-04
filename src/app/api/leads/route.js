import { NextResponse } from "next/server"
import { supabaseServer } from "../../../lib/supabase-server"

export const runtime = "nodejs"

const FALLBACK_RECIPIENTS = [
  "stefan@smartsteel.co.za",
  "niel@smartsteel.co.za",
  "info@smartsteel.co.za",
]

function getNextBusinessMorningIso() {
  const date = new Date()
  date.setHours(9, 0, 0, 0)
  date.setDate(date.getDate() + 1)

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1)
  }

  return date.toISOString()
}

function buildBuilderNotes(payload) {
  const isLcssWarehouse = payload.productType === "LCSS Warehouse"
  const lines = [
    "Warehouse Builder submission",
    payload.productType ? `System: ${payload.productType === "LCSS Warehouse" ? "Atlas W-Series Warehouse" : payload.productType}` : null,
    "Budget basis: Supply only",
    payload.intendedUse ? `Intended use: ${payload.intendedUse}` : null,
    payload.projectStage ? `Project stage: ${payload.projectStage}` : null,
    payload.targetTimeline ? `Target timeline: ${payload.targetTimeline}` : null,
    `Installation support requested: ${payload.installationInterest ? "Yes" : "No"}`,
    isLcssWarehouse ? `Steel finish: ${payload.steelFinish}` : null,
    isLcssWarehouse ? `Sheeting type: ${payload.gableModeLabel}` : `Enclosure: ${payload.enclosureLabel}`,
    isLcssWarehouse ? null : `Cladding: ${payload.cladding}`,
    payload.sheetingColorLabel ? `Sheeting colour: ${payload.sheetingColorLabel}` : null,
    `Roof: ${payload.roofTypeLabel}`,
    isLcssWarehouse ? null : `Garage door openings: ${payload.rollerDoorCount}`,
    isLcssWarehouse ? null : payload.garageDoorOpeningTypeLabel ? `Garage opening size: ${payload.garageDoorOpeningTypeLabel}` : null,
    isLcssWarehouse || !payload.rollerDoorCount ? null : `Main opening wall: ${payload.rollerDoorFace}`,
    isLcssWarehouse ? null : `Pedestrian door openings: ${payload.pedestrianDoorCount}`,
    isLcssWarehouse || !payload.pedestrianDoorCount ? null : `Personnel opening wall: ${payload.pedestrianDoorFace}`,
    payload.province ? `Province: ${payload.province}` : null,
    payload.location ? `Location: ${payload.location}` : null,
    `Delivery support requested: ${payload.deliveryRequired ? "Yes" : "No"}`,
    payload.deliveryRequired && payload.deliveryDistance ? `Estimated delivery distance: ${payload.deliveryDistance}km` : null,
    payload.userNotes ? `Client notes: ${payload.userNotes}` : null,
    payload.summaryNote ? `System note: ${payload.summaryNote}` : null,
    `Supply-only budget guide: ${payload.priceLabel}`,
  ].filter(Boolean)

  return lines.join("\n")
}

function buildBuilderSubmission(payload, leadId) {
  return {
    lead_id: leadId,
    customer_name: [payload.name, payload.lastName].filter(Boolean).join(" ").trim() || payload.name,
    customer_email: payload.email,
    customer_phone: payload.phone,
    province: payload.province || null,
    location: payload.location || null,
    estimate_request: payload.estimateRequest || "",
    estimated_total: payload.estimatedTotal || 0,
    status: "new",
    configuration: payload.configuration || {},
    summary: payload.summary || {},
    notes: buildBuilderNotes(payload),
  }
}

function buildGenericNotes(payload) {
  const lines = [
    payload.lead_source ? `${payload.lead_source} enquiry` : "Website enquiry",
    payload.product_type ? `Product: ${payload.product_type}` : null,
    payload.estimate_request ? `Request: ${payload.estimate_request}` : null,
    payload.notes ? `Client notes: ${payload.notes}` : null,
  ].filter(Boolean)

  return lines.join("\n")
}

function buildGenericLeadPayload(payload) {
  return {
    name: payload.name,
    last_name: payload.lastName || payload.last_name || "Website Enquiry",
    email: payload.email,
    phone: payload.phone || null,
    estimate_request: payload.estimate_request || payload.estimateRequest || "",
    allocated_to: payload.allocated_to || payload.allocatedTo || "",
    notes: buildGenericNotes(payload),
    status: payload.status || "new",
    lead_source: payload.lead_source || payload.leadSource || "Website",
    product_type: payload.product_type || payload.productType || "General Enquiry",
    next_action:
      payload.next_action ||
      payload.nextAction ||
      "Review website enquiry and contact the client with the right next step.",
    follow_up_at: payload.follow_up_at || payload.followUpAt || getNextBusinessMorningIso(),
    quote_value: payload.quote_value || payload.quoteValue || null,
    created_at: new Date().toISOString(),
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildFallbackLeadEmailHtml({ body, insertPayload, reason }) {
  const leadName = [insertPayload?.name, insertPayload?.last_name].filter(Boolean).join(" ").trim() || "Unknown lead"
  const configurationJson = body?.configuration
    ? `<pre style="white-space: pre-wrap; margin: 0; font-size: 12px; line-height: 1.5;">${escapeHtml(JSON.stringify(body.configuration, null, 2))}</pre>`
    : "Not supplied"
  const summaryJson = body?.summary
    ? `<pre style="white-space: pre-wrap; margin: 0; font-size: 12px; line-height: 1.5;">${escapeHtml(JSON.stringify(body.summary, null, 2))}</pre>`
    : "Not supplied"

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">Website lead fallback capture</h2>
      <p style="margin: 0 0 16px;">
        Supabase lead save failed, so this enquiry was captured by the fallback email route.
      </p>
      <table style="border-collapse: collapse; width: 100%; max-width: 760px;">
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Client</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(leadName)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(insertPayload?.email || "Not supplied")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(insertPayload?.phone || "Not supplied")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Lead source</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(insertPayload?.lead_source || "Website")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Product type</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(insertPayload?.product_type || "General Enquiry")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Estimate request</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(insertPayload?.estimate_request || "Not supplied")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Quote value</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(insertPayload?.quote_value || "Not supplied")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Next action</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(insertPayload?.next_action || "Not supplied")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${escapeHtml(insertPayload?.notes || "Not supplied")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Fallback reason</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(reason || "Unknown error")}</td></tr>
      </table>
      <h3 style="margin: 20px 0 8px;">Configuration</h3>
      ${configurationJson}
      <h3 style="margin: 20px 0 8px;">Summary</h3>
      ${summaryJson}
    </div>
  `
}

async function sendFallbackLeadNotification({ body, insertPayload, reason }) {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail =
    process.env.CRM_NOTIFICATION_FROM || "Smart Steel CRM <crm@smartsteel.co.za>"

  if (!resendApiKey) {
    return {
      success: false,
      reason: "Missing RESEND_API_KEY",
    }
  }

  const leadName = [insertPayload?.name, insertPayload?.last_name].filter(Boolean).join(" ").trim() || "Unknown lead"
  const subject = `Fallback website lead: ${leadName}`

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: FALLBACK_RECIPIENTS,
      subject,
      html: buildFallbackLeadEmailHtml({ body, insertPayload, reason }),
    }),
  })

  if (!resendResponse.ok) {
    return {
      success: false,
      reason: await resendResponse.text(),
    }
  }

  const responsePayload = await resendResponse.json().catch(() => null)
  return {
    success: true,
    reference: responsePayload?.id || null,
  }
}

export async function POST(request) {
  let body = null
  try {
    body = await request.json()
    const isBuilderSubmission =
      Boolean(body?.configuration) ||
      Boolean(body?.summary) ||
      Boolean(body?.estimatedTotal) ||
      body?.lead_source === "Warehouse Builder" ||
      body?.leadSource === "Warehouse Builder"

    if (!body?.name || !body?.email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      )
    }

    if (isBuilderSubmission && !body?.phone) {
      return NextResponse.json(
        { error: "Phone is required for warehouse builder submissions." },
        { status: 400 }
      )
    }

    if (isBuilderSubmission && !body?.projectStage) {
      return NextResponse.json(
        { error: "Project stage is required for warehouse builder submissions." },
        { status: 400 }
      )
    }

    if (isBuilderSubmission && !String(body?.location || "").trim()) {
      return NextResponse.json(
        { error: "Project location is required for warehouse builder submissions." },
        { status: 400 }
      )
    }

    const insertPayload = isBuilderSubmission
      ? {
          name: body.name,
          last_name: body.lastName || "Warehouse Builder",
          email: body.email,
          phone: body.phone,
          estimate_request: body.estimateRequest,
          allocated_to: "",
          notes: buildBuilderNotes(body),
          status: "new",
          lead_source: "Warehouse Builder",
          product_type: body.productType || "LSF Warehouse",
          next_action:
            "Review builder project, confirm scope and site details, then decide the right next step.",
          follow_up_at: getNextBusinessMorningIso(),
          quote_value: body.estimatedTotal || null,
          created_at: new Date().toISOString(),
        }
      : buildGenericLeadPayload(body)

    const { data, error } = await supabaseServer.from("leads").insert([insertPayload]).select()

    if (error) {
      console.error("Lead insert error:", error)
      const fallbackResult = await sendFallbackLeadNotification({
        body,
        insertPayload,
        reason: error.message,
      })

      if (fallbackResult.success) {
        return NextResponse.json(
          {
            lead: null,
            builderSubmission: null,
            fallbackSaved: true,
            fallbackReference: fallbackResult.reference,
            submissionWarning:
              "Supabase was unavailable, so this enquiry was captured by the fallback route and sent to the Smart Steel team for manual follow-up.",
          },
          { status: 200 }
        )
      }

      return NextResponse.json(
        {
          error: "Could not save the lead to Supabase, and the fallback capture also failed.",
          supabaseError: error.message,
          fallbackError: fallbackResult.reason,
        },
        { status: 503 }
      )
    }

    const lead = data?.[0] || null
    let builderSubmission = null
    let submissionWarning = ""

    if (isBuilderSubmission && lead?.id) {
      const submissionPayload = buildBuilderSubmission(body, lead.id)
      const { data: submissionData, error: submissionError } = await supabaseServer
        .from("warehouse_builder_submissions")
        .insert([submissionPayload])
        .select()
        .maybeSingle()

      if (submissionError) {
        if (submissionError.code === "42P01") {
          submissionWarning =
            "Lead saved, but structured builder submissions table does not exist yet. Run the warehouse builder SQL."
          console.warn("Warehouse Builder submissions table missing:", submissionError.message)
        } else {
          submissionWarning = "Lead saved, but the structured builder record could not be saved."
          console.error("Warehouse Builder submission insert error:", submissionError)
        }
      } else {
        builderSubmission = submissionData || null
      }
    }

    return NextResponse.json(
      { lead, builderSubmission, submissionWarning: submissionWarning || null },
      { status: 200 }
    )
  } catch (error) {
    console.error("Lead API error:", error)
    if (body?.name && body?.email) {
      const insertPayload = buildGenericLeadPayload(body)
      const fallbackResult = await sendFallbackLeadNotification({
        body,
        insertPayload,
        reason: error?.message || "Unexpected API error",
      })

      if (fallbackResult.success) {
        return NextResponse.json(
          {
            lead: null,
            builderSubmission: null,
            fallbackSaved: true,
            fallbackReference: fallbackResult.reference,
            submissionWarning:
              "The enquiry could not be stored in the live CRM, but it was captured by the fallback route and sent to the Smart Steel team for manual follow-up.",
          },
          { status: 200 }
        )
      }
    }

    return NextResponse.json(
      { error: error?.message || "Could not save the lead." },
      { status: 500 }
    )
  }
}
