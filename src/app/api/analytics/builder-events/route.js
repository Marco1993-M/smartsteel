import { NextResponse } from "next/server"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

const BUILDERS = new Set(["warehouse", "solar_carport", "ground_mount"])
const EVENTS = new Set([
  "builder_entry_clicked",
  "builder_viewed",
  "configuration_started",
  "pricing_displayed",
  "lead_form_viewed",
  "lead_submit_started",
  "lead_submit_succeeded",
  "lead_submit_failed",
  "whatsapp_opened",
])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function safeText(value, length = 180) {
  return typeof value === "string" ? value.trim().slice(0, length) : ""
}

function cleanProperties(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).slice(0, 20).flatMap(([key, item]) => {
    if (!["string", "number", "boolean"].includes(typeof item)) return []
    return [[safeText(key, 60), typeof item === "string" ? safeText(item, 180) : item]]
  }))
}

export async function POST(request) {
  const origin = request.headers.get("origin")
  if (origin) {
    try {
      if (new URL(origin).hostname !== new URL(request.url).hostname) return NextResponse.json({ error: "Invalid origin." }, { status: 403 })
    } catch { return NextResponse.json({ error: "Invalid origin." }, { status: 403 }) }
  }

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: "Invalid event payload." }, { status: 400 }) }

  if (!BUILDERS.has(body?.builder) || !EVENTS.has(body?.eventName)) {
    return NextResponse.json({ error: "Unknown builder event." }, { status: 400 })
  }
  if (![body.eventId, body.sessionId, body.journeyId].every((value) => UUID_PATTERN.test(String(value || "")))) {
    return NextResponse.json({ error: "Invalid event identifiers." }, { status: 400 })
  }

  const { error } = await supabaseServer.from("builder_funnel_events").insert({
    event_id: body.eventId,
    session_id: body.sessionId,
    journey_id: body.journeyId,
    builder: body.builder,
    event_name: body.eventName,
    source_page: safeText(body.sourcePage) || null,
    entry_page: safeText(body.entryPage) || null,
    configuration_id: safeText(body.configurationId, 120) || null,
    device_category: ["desktop", "tablet", "mobile"].includes(body.deviceCategory) ? body.deviceCategory : "unknown",
    properties: cleanProperties(body.properties),
  })

  if (error?.code === "23505") return NextResponse.json({ accepted: true, duplicate: true })
  if (error) return NextResponse.json({ error: "Builder event could not be recorded." }, { status: 503 })
  return NextResponse.json({ accepted: true }, { status: 202 })
}
