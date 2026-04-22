const RECIPIENTS = [
  "stefan@smartsteel.co.za",
  "niel@smartsteel.co.za",
  "info@smartsteel.co.za",
]

function formatCurrency(value) {
  if (!value && value !== 0) return "Not set"
  const number = Number(value)
  if (Number.isNaN(number)) return String(value)
  return `R ${number.toLocaleString("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value) {
  if (!value) return "Not set"
  return new Date(value).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function buildHtml({ eventType, lead, actor, summary, changedFields }) {
  const leadName = [lead?.name, lead?.last_name].filter(Boolean).join(" ") || "Unknown lead"
  const headingMap = {
    new_lead: "New CRM Lead",
    lead_updated: "CRM Lead Updated",
    status_changed: "CRM Status Updated",
  }

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">${headingMap[eventType] || "CRM Notification"}</h2>
      <p style="margin: 0 0 16px;"><strong>${summary || "A CRM update was made."}</strong></p>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Lead</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${leadName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${lead?.status || "Not set"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Assigned To</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${lead?.allocated_to || "Unassigned"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Lead Source</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${lead?.lead_source || "Not set"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Product Type</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${lead?.product_type || "Not set"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Next Action</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${lead?.next_action || "Not set"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Follow-up</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatDate(lead?.follow_up_at)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Quote Value</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(lead?.quote_value)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Expected Close</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatDate(lead?.expected_close_date)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Changed Fields</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${(changedFields || []).join(", ") || "General update"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Updated By</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${actor || "Smart Steel CRM"}</td></tr>
      </table>
      ${
        lead?.estimate_request
          ? `<p style="margin-top: 16px;"><strong>Request:</strong> ${lead.estimate_request}</p>`
          : ""
      }
    </div>
  `
}

export async function POST(request) {
  try {
    const body = await request.json()
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail =
      process.env.CRM_NOTIFICATION_FROM || "Smart Steel CRM <crm@smartsteel.co.za>"

    if (!resendApiKey) {
      return Response.json(
        { skipped: true, reason: "Missing RESEND_API_KEY" },
        { status: 200 }
      )
    }

    const leadName = [body?.lead?.name, body?.lead?.last_name].filter(Boolean).join(" ") || "Unknown lead"
    const subjectMap = {
      new_lead: `New CRM lead: ${leadName}`,
      lead_updated: `CRM update: ${leadName}`,
      status_changed: `CRM status changed: ${leadName}`,
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: RECIPIENTS,
        subject: subjectMap[body.eventType] || `CRM notification: ${leadName}`,
        html: buildHtml(body),
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      return Response.json(
        { error: `Resend error: ${errorText}` },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: error.message || "Unable to send CRM notification" },
      { status: 500 }
    )
  }
}
