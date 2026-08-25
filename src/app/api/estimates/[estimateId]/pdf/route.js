import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import {
  launchEstimatePdfBrowser,
  renderDocumentPdf,
} from "../../../../../lib/estimates/pdf"
import { supabaseServer } from "../../../../../lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const ESTIMATE_PDF_BUCKET =
  process.env.SUPABASE_ESTIMATE_PDF_BUCKET || "estimate-pdfs"
const ESTIMATE_PDF_RENDER_REVISION = "atlas-brand-v1"

function buildFilename(estimate) {
  const base = String(estimate?.title || `smart-steel-quote-${estimate?.version_no || "1"}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${base || "smart-steel-quote"}.pdf`
}

function buildEstimateFingerprint(estimate) {
  const documentContent = {
    title: estimate?.title,
    versionNo: estimate?.version_no,
    productType: estimate?.product_type,
    productTypeDisplay: estimate?.product_type_display,
    inputData: estimate?.input_data,
    lineItems: estimate?.line_items,
    subtotal: estimate?.subtotal,
    total: estimate?.total,
    notes: estimate?.notes,
    status: estimate?.status,
  }

  return createHash("sha256")
    .update(JSON.stringify(documentContent))
    .digest("hex")
    .slice(0, 16)
}

function buildStoragePath(estimate, fingerprint) {
  return `quotes/${estimate.id}/${ESTIMATE_PDF_RENDER_REVISION}-v${estimate.version_no || 1}-${fingerprint}.pdf`
}

async function getCachedPdfBuffer(storagePath) {
  const { data, error } = await supabaseServer.storage
    .from(ESTIMATE_PDF_BUCKET)
    .download(storagePath)

  if (error || !data) {
    return null
  }

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function storePdfBuffer(storagePath, pdfBuffer) {
  const { error } = await supabaseServer.storage
    .from(ESTIMATE_PDF_BUCKET)
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "31536000",
    })

  if (error) {
    console.warn("Could not cache estimate PDF in storage:", error.message)
  }
}

export async function GET(request, { params }) {
  const { estimateId } = await params

  const { data: estimate, error } = await supabaseServer
    .from("estimates")
    .select("*")
    .eq("id", estimateId)
    .maybeSingle()

  if (error) {
    console.error("Could not load estimate for PDF:", error.message)
    return NextResponse.json(
      { error: "The estimate could not be loaded for PDF generation." },
      { status: 500 }
    )
  }

  if (!estimate) {
    return NextResponse.json(
      { error: "Estimate not found." },
      { status: 404 }
    )
  }

  if (!estimate.share_token) {
    return NextResponse.json(
      { error: "This estimate does not have a share token yet." },
      { status: 400 }
    )
  }

  const fingerprint = buildEstimateFingerprint(estimate)
  const storagePath = buildStoragePath(estimate, fingerprint)
  const cachedPdfBuffer = await getCachedPdfBuffer(storagePath)

  if (cachedPdfBuffer) {
    return new NextResponse(cachedPdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${buildFilename(estimate)}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-SmartSteel-PDF-Cache": "hit",
        "X-SmartSteel-PDF-Revision": fingerprint,
      },
    })
  }

  const pdfUrl = new URL(`/quotes/${estimate.share_token}?pdf=1&revision=${fingerprint}`, request.url).toString()

  try {
    const browser = await launchEstimatePdfBrowser()
    const pdfBuffer = await renderDocumentPdf({
      browser,
      url: pdfUrl,
      readySelector: ".estimate-sheet",
    })

    await storePdfBuffer(storagePath, pdfBuffer)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${buildFilename(estimate)}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-SmartSteel-PDF-Cache": "miss",
        "X-SmartSteel-PDF-Revision": fingerprint,
      },
    })
  } catch (pdfError) {
    console.error("Error generating estimate PDF:", pdfError)
    return NextResponse.json(
      { error: pdfError?.message || "Could not generate the quote PDF." },
      { status: 500 }
    )
  }
}
