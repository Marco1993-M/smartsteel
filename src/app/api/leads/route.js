import { NextResponse } from "next/server"
import { supabaseServer } from "../../../lib/supabase-server"

export const runtime = "nodejs"

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
  const lines = [
    "Warehouse Builder submission",
    `Scope: ${payload.scopeLabel}`,
    `Enclosure: ${payload.enclosureLabel}`,
    `Cladding: ${payload.cladding}`,
    `Roof: ${payload.roofTypeLabel}`,
    `Garage door openings: ${payload.rollerDoorCount}`,
    payload.garageDoorOpeningTypeLabel ? `Garage opening size: ${payload.garageDoorOpeningTypeLabel}` : null,
    `Pedestrian door openings: ${payload.pedestrianDoorCount}`,
    `Delivery required: ${payload.deliveryRequired ? "Yes" : "No"}`,
    payload.province ? `Province: ${payload.province}` : null,
    payload.location ? `Location: ${payload.location}` : null,
    payload.userNotes ? `Client notes: ${payload.userNotes}` : null,
    payload.summaryNote ? `System note: ${payload.summaryNote}` : null,
    `Indicative budget: ${payload.priceLabel}`,
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

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body?.name || !body?.email || !body?.phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required." },
        { status: 400 }
      )
    }

    const insertPayload = {
      name: body.name,
      last_name: body.lastName || "Warehouse Builder",
      email: body.email,
      phone: body.phone,
      estimate_request: body.estimateRequest,
      allocated_to: "",
      notes: buildBuilderNotes(body),
      status: "new",
      lead_source: "Warehouse Builder",
      product_type: "Warehouse",
      next_action: "Call builder lead, confirm scope and site details, then load configuration into estimate workflow.",
      follow_up_at: getNextBusinessMorningIso(),
      quote_value: body.estimatedTotal || null,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer.from("leads").insert([insertPayload]).select()

    if (error) {
      console.error("Warehouse Builder lead insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const lead = data?.[0] || null
    let builderSubmission = null
    let submissionWarning = ""

    if (lead?.id) {
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
    console.error("Warehouse Builder API error:", error)
    return NextResponse.json(
      { error: error?.message || "Could not save the builder lead." },
      { status: 500 }
    )
  }
}
