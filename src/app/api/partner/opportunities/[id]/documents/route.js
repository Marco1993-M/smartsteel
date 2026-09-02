import { NextResponse } from "next/server"
import { getPartnerRequestContext } from "lib/partnerRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"])
const MAX_FILE_SIZE = 10 * 1024 * 1024

function safeFileName(value) {
  return String(value || "document")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
}

async function findOpportunity(id, context) {
  let query = supabaseServer
    .from("partner_opportunities")
    .select("id, partner_id, membership_id, reference, status")
    .eq("id", id)
    .eq("partner_id", context.membership.partner_id)
  if (context.membership.role === "salesperson") query = query.eq("membership_id", context.membership.id)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data
}

export async function POST(request, { params }) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  const { id } = await params
  const opportunity = await findOpportunity(id, context)
  if (!opportunity) return NextResponse.json({ error: "That opportunity could not be found." }, { status: 404 })
  if (opportunity.status !== "quoted") {
    return NextResponse.json({ error: "Documents can be attached after Smart Steel approves the supplier price." }, { status: 409 })
  }

  const form = await request.formData()
  const file = form.get("file")
  const documentType = String(form.get("documentType") || "purchase_order")
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose a document to upload." }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Upload a PDF, JPG or PNG document." }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "The document must be smaller than 10 MB." }, { status: 400 })
  if (!["purchase_order", "formal_instruction", "supporting_document"].includes(documentType)) {
    return NextResponse.json({ error: "Choose a valid document type." }, { status: 400 })
  }

  const storagePath = `${opportunity.partner_id}/${opportunity.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabaseServer.storage
    .from("partner-order-documents")
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await supabaseServer.from("partner_order_documents").insert([{
    partner_id: opportunity.partner_id,
    opportunity_id: opportunity.id,
    document_type: documentType,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
    uploaded_by: context.user.id,
  }]).select("id, document_type, file_name, mime_type, file_size, created_at").single()

  if (error) {
    await supabaseServer.storage.from("partner-order-documents").remove([storagePath])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabaseServer.from("partner_handoff_events").insert([{
    partner_id: opportunity.partner_id,
    opportunity_id: opportunity.id,
    event_type: "order_document_uploaded",
    actor_scope: "partner",
    actor_id: context.user.id,
    summary: `${documentType.replaceAll("_", " ")} uploaded by AFGRI.`,
    detail: { documentId: data.id, fileName: file.name, documentType },
  }])

  return NextResponse.json({ document: data })
}

export async function GET(request, { params }) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  const { id } = await params
  const opportunity = await findOpportunity(id, context)
  if (!opportunity) return NextResponse.json({ error: "That opportunity could not be found." }, { status: 404 })

  const documentId = new URL(request.url).searchParams.get("documentId")
  if (!documentId) return NextResponse.json({ error: "Choose a document to download." }, { status: 400 })
  const { data: document, error } = await supabaseServer
    .from("partner_order_documents")
    .select("file_name, storage_path, mime_type")
    .eq("id", documentId)
    .eq("opportunity_id", opportunity.id)
    .maybeSingle()
  if (error || !document) return NextResponse.json({ error: "That document could not be found." }, { status: 404 })

  const { data: file, error: downloadError } = await supabaseServer.storage.from("partner-order-documents").download(document.storage_path)
  if (downloadError) return NextResponse.json({ error: downloadError.message }, { status: 500 })
  return new NextResponse(await file.arrayBuffer(), {
    headers: {
      "Content-Type": document.mime_type,
      "Content-Disposition": `attachment; filename="${safeFileName(document.file_name)}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
