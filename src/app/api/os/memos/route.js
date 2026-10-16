import { NextResponse } from "next/server"
import { getOsRequestContext } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { validateMemoContent } from "lib/osMemos.mjs"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const missing = (error) => ["42P01", "PGRST205", "PGRST202"].includes(error?.code)
const json = (data, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } })
async function context(request) {
  const auth = await getOsRequestContext(request)
  if (auth.response) return auth
  const email = String(auth.user.email || "").toLowerCase()
  const result = await supabaseServer.from("os_memo_members").select("email,display_name").eq("active", true).order("display_name")
  if (result.error) return { response: json({ error: missing(result.error) ? "Memos need database setup. Apply supabase/os_memos.sql." : "Memo access could not be verified.", setupRequired: missing(result.error) }, 503) }
  if (!result.data.some((row) => row.email === email)) return { response: json({ error: "Your account does not have memo access." }, 403) }
  return { ...auth, email, members: result.data }
}
export async function GET(request) {
  try {
    const ctx = await context(request)
    if (ctx.response) return ctx.response
    const id = new URL(request.url).searchParams.get("id")
    if (!id) {
      const result = await supabaseServer.from("os_memos").select("id,title,author_email,status,revision,decision,decision_owner_email,implementation_owner_email,review_date,updated_at").order("updated_at", { ascending: false }).limit(200)
      if (result.error) throw result.error
      return json({ records: result.data, members: ctx.members, email: ctx.email })
    }
    if (!uuid.test(id)) return json({ error: "Invalid memo." }, 400)
    const results = await Promise.all([
      supabaseServer.from("os_memos").select("*").eq("id", id).maybeSingle(),
      supabaseServer.from("os_memo_comments").select("*").eq("memo_id", id).order("created_at").limit(500),
      supabaseServer.from("os_memo_revisions").select("revision,snapshot,actor_email,created_at").eq("memo_id", id).order("revision", { ascending: false }).limit(100),
    ])
    for (const result of results) if (result.error) throw result.error
    if (!results[0].data) return json({ error: "Memo not found." }, 404)
    return json({ memo: results[0].data, comments: results[1].data, revisions: results[2].data, members: ctx.members, email: ctx.email })
  } catch { return json({ error: "Memos could not be loaded. Please try again." }, 503) }
}
export async function POST(request) {
  try {
    const ctx = await context(request)
    if (ctx.response) return ctx.response
    const raw = await request.text()
    if (raw.length > 100000) return json({ error: "This memo is too long." }, 413)
    let body
    try { body = JSON.parse(raw) } catch { return json({ error: "Invalid request." }, 400) }
    if (!body || typeof body !== "object" || Array.isArray(body) || (body.data != null && (typeof body.data !== "object" || Array.isArray(body.data)))) return json({ error: "Invalid request." }, 400)
    const { action, id, revision } = body
    const data = body.data || {}
    if (!["create", "save", "comment", "resolve", "decide", "transition"].includes(action) || (action !== "create" && (!uuid.test(id) || !Number.isInteger(revision)))) return json({ error: "Invalid memo action." }, 400)
    if (["create", "save"].includes(action) && (typeof data.title !== "string" || data.title.trim().length < 3 || data.title.length > 180 || !validateMemoContent(data.content))) return json({ error: "Add a title (3–180 characters) and valid memo sections." }, 400)
    if (action === "save" && (!Array.isArray(data.editor_emails) || data.editor_emails.some((value) => typeof value !== "string"))) return json({ error: "Choose valid editors." }, 400)
    if (action === "comment" && (typeof data.body !== "string" || !data.body.trim() || data.body.length > 4000)) return json({ error: "Comments must contain 1–4,000 characters." }, 400)
    if ([data.parent_id, data.comment_id, data.source_memo_id].some((value) => value != null && !uuid.test(value))) return json({ error: "Invalid linked record." }, 400)
    if (action === "decide" && (typeof data.reason !== "string" || data.reason.length > 12000 || (data.review_date && (!/^\d{4}-\d{2}-\d{2}$/.test(data.review_date) || data.review_date < new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" }))))) return json({ error: "Add decision reasoning and a review date today or later." }, 400)
    if (action === "transition" && data.result && (typeof data.result !== "string" || data.result.length > 12000)) return json({ error: "Keep the result under 12,000 characters." }, 400)
    const result = await supabaseServer.rpc("os_mutate_memo", { p_actor_id: ctx.user.id, p_actor_email: ctx.email, p_action: action, p_id: id || null, p_revision: revision || null, p_data: data })
    if (result.error) return json({ error: result.error.code === "P0001" ? result.error.message : "The memo could not be saved. Reload and check your input." }, result.error.code === "P0001" ? 409 : 400)
    return json({ record: result.data })
  } catch { return json({ error: "The memo could not be saved. Please try again." }, 503) }
}
