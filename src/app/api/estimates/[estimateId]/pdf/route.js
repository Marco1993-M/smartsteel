import { NextResponse } from "next/server"
import { launchEstimatePdfBrowser } from "../../../../../lib/estimates/pdf"
import { supabaseServer } from "../../../../../lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const ESTIMATE_PDF_BUCKET =
  process.env.SUPABASE_ESTIMATE_PDF_BUCKET || "estimate-pdfs"

function buildFilename(estimate) {
  const base = String(estimate?.title || `smart-steel-quote-${estimate?.version_no || "1"}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${base || "smart-steel-quote"}.pdf`
}

function buildStoragePath(estimate) {
  const updatedAt = estimate?.updated_at || estimate?.created_at || new Date().toISOString()
  const safeUpdatedAt = String(updatedAt).replace(/[^0-9T]/g, "").replace(/:/g, "")
  return `quotes/${estimate.id}/v${estimate.version_no || 1}-${safeUpdatedAt}.pdf`
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
    .select("id, title, version_no, share_token, created_at, updated_at")
    .eq("id", estimateId)
    .single()

  if (error || !estimate) {
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

  const storagePath = buildStoragePath(estimate)
  const cachedPdfBuffer = await getCachedPdfBuffer(storagePath)

  if (cachedPdfBuffer) {
    return new NextResponse(cachedPdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${buildFilename(estimate)}"`,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-SmartSteel-PDF-Cache": "hit",
      },
    })
  }

  const pdfUrl = new URL(`/quotes/${estimate.share_token}?pdf=1`, request.url).toString()
  let browser = null

  try {
    browser = await launchEstimatePdfBrowser()
    const page = await browser.newPage()

    await page.goto(pdfUrl, {
      waitUntil: "networkidle0",
      timeout: 45000,
    })

    await page.emulateMediaType("print")
    await page.waitForSelector(".estimate-sheet", { timeout: 15000 })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    })

    await storePdfBuffer(storagePath, pdfBuffer)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${buildFilename(estimate)}"`,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-SmartSteel-PDF-Cache": "miss",
      },
    })
  } catch (pdfError) {
    console.error("Error generating estimate PDF:", pdfError)
    return NextResponse.json(
      { error: pdfError?.message || "Could not generate the quote PDF." },
      { status: 500 }
    )
  } finally {
    await browser?.close()
  }
}
