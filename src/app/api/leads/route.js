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

function getSafeBuilderUrl(value) {
  try {
    const url = new URL(String(value || ""), "https://www.smartsteel.co.za")
    if (url.pathname !== "/warehouse-builder") return "https://www.smartsteel.co.za/warehouse-builder"
    return `https://www.smartsteel.co.za${url.pathname}${url.search}`
  } catch {
    return "https://www.smartsteel.co.za/warehouse-builder"
  }
}

function buildConfigurationReceivedEmailHtml(body) {
  const isAtlas = body.productType === "LCSS Warehouse"
  const firstName = escapeHtml(body.name || "there")
  const systemName = isAtlas ? "Atlas W-Series Warehouse" : "Engineered LSF Warehouse"
  const dimensions = `${body.configuration?.width || "-"}m × ${body.configuration?.length || "-"}m × ${body.configuration?.wallHeight || "-"}m`
  const sheeting = isAtlas
    ? body.gableModeLabel || body.summary?.gableModeLabel || "To be confirmed"
    : body.enclosureLabel || body.summary?.enclosureLabel || "To be confirmed"
  const reference = body.designReference || "Warehouse builder enquiry"
  const location = [body.location, body.province].filter(Boolean).join(", ") || "To be confirmed"
  const builderUrl = getSafeBuilderUrl(body.configurationUrl)
  const accent = isAtlas ? "#0043f3" : "#da1a33"
  const dark = isAtlas ? "#001d2e" : "#020617"
  const pale = isAtlas ? "#c1d9e5" : "#fee2e2"
  const logo = isAtlas
    ? "https://www.smartsteel.co.za/atlas/atlas-logo-horizontal-light.png"
    : "https://www.smartsteel.co.za/Logo.png"

  const detailRow = (label, value) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">${escapeHtml(label)}</td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:700;">${escapeHtml(value)}</td>
    </tr>`

  return `<!doctype html>
  <html lang="en">
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f5f9;">
        <tr><td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #dbe4ee;">
            <tr>
              <td style="padding:28px 30px;background:linear-gradient(120deg,${dark},${accent});">
                <img src="${logo}" alt="${isAtlas ? "Atlas by Smart Steel" : "Smart Steel"}" width="210" style="display:block;max-width:210px;height:auto;border:0;" />
                <p style="margin:28px 0 8px;color:${pale};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Configuration received</p>
                <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;">Your warehouse project is with us.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Good day ${firstName},</p>
                <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">Thank you for configuring your ${escapeHtml(systemName)}. We have received your project details and will review the structure, site information and selected requirements before preparing the right next step.</p>

                <div style="margin:0 0 24px;padding:18px 20px;background:#f8fafc;border-left:4px solid ${accent};">
                  <p style="margin:0 0 4px;color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;">Design reference</p>
                  <p style="margin:0;color:#0f172a;font-size:18px;font-weight:800;">${escapeHtml(reference)}</p>
                </div>

                <h2 style="margin:0 0 8px;font-size:18px;">Your starting configuration</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  ${detailRow("System", systemName)}
                  ${detailRow("Warehouse size", dimensions)}
                  ${detailRow(isAtlas ? "Sheeting" : "Enclosure", sheeting)}
                  ${isAtlas ? detailRow("Steel finish", body.steelFinish || body.summary?.steelFinish || "To be confirmed") : ""}
                  ${detailRow("Project location", location)}
                  ${detailRow("Budget guide excl. VAT", body.priceLabel || "To be reviewed")}
                </table>

                <div style="margin:28px 0;padding:20px;background:${isAtlas ? "#eef6fa" : "#fff7f7"};">
                  <p style="margin:0 0 10px;color:${dark};font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">What happens next</p>
                  <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">A Smart Steel team member will review your configuration and contact you if any details need clarification. We will then prepare a project-specific proposal for your consideration.</p>
                </div>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="${accent}" style="border-radius:4px;">
                  <a href="${escapeHtml(builderUrl)}" style="display:inline-block;padding:14px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Review your configuration</a>
                </td></tr></table>

                <p style="margin:26px 0 0;color:#64748b;font-size:12px;line-height:1.6;">This online amount is a planning guide excluding VAT. Final pricing remains subject to review of the confirmed scope, engineering, site requirements, delivery and installation where applicable.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 30px;background:${dark};color:#ffffff;">
                <p style="margin:0 0 5px;font-size:13px;font-weight:700;">${isAtlas ? "Atlas developed by Smart Steel" : "Smart Steel"}</p>
                <p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.6;">info@smartsteel.co.za · +27 82 846 4555 · smartsteel.co.za</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>`
}

async function sendBuilderConfirmation(body) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey || !body?.email) return { success: false, reason: "Email service is not configured." }

  const isAtlas = body.productType === "LCSS Warehouse"
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CLIENT_CONFIRMATION_FROM || "Smart Steel <info@smartsteel.co.za>",
      to: [body.email],
      reply_to: "info@smartsteel.co.za",
      subject: isAtlas
        ? `Your Atlas warehouse configuration | ${body.designReference || "Smart Steel"}`
        : `Your Smart Steel warehouse configuration | ${body.designReference || "Received"}`,
      html: buildConfigurationReceivedEmailHtml(body),
    }),
  })

  if (!response.ok) return { success: false, reason: await response.text() }
  const payload = await response.json().catch(() => null)
  return { success: true, reference: payload?.id || null }
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
        const confirmationResult = isBuilderSubmission
          ? await sendBuilderConfirmation(body)
          : { success: false, reason: "Not a builder submission." }
        if (isBuilderSubmission && !confirmationResult.success) {
          console.error("Builder confirmation email failed:", confirmationResult.reason)
        }
        return NextResponse.json(
          {
            lead: null,
            builderSubmission: null,
            fallbackSaved: true,
            fallbackReference: fallbackResult.reference,
            confirmationEmailSent: confirmationResult.success,
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

    const confirmationResult = isBuilderSubmission
      ? await sendBuilderConfirmation(body)
      : { success: false, reason: "Not a builder submission." }
    if (isBuilderSubmission && !confirmationResult.success) {
      console.error("Builder confirmation email failed:", confirmationResult.reason)
    }

    return NextResponse.json(
      {
        lead,
        builderSubmission,
        submissionWarning: submissionWarning || null,
        confirmationEmailSent: confirmationResult.success,
        confirmationEmailReference: confirmationResult.reference || null,
      },
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
        const isBuilderSubmission =
          Boolean(body?.configuration) ||
          Boolean(body?.summary) ||
          body?.lead_source === "Warehouse Builder" ||
          body?.leadSource === "Warehouse Builder"
        const confirmationResult = isBuilderSubmission
          ? await sendBuilderConfirmation(body)
          : { success: false, reason: "Not a builder submission." }
        if (isBuilderSubmission && !confirmationResult.success) {
          console.error("Builder confirmation email failed:", confirmationResult.reason)
        }
        return NextResponse.json(
          {
            lead: null,
            builderSubmission: null,
            fallbackSaved: true,
            fallbackReference: fallbackResult.reference,
            confirmationEmailSent: confirmationResult.success,
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
