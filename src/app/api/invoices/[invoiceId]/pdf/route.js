import { NextResponse } from "next/server"
import { launchEstimatePdfBrowser } from "../../../../../lib/estimates/pdf"
import { supabaseServer } from "../../../../../lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const INVOICE_PDF_BUCKET =
  process.env.SUPABASE_INVOICE_PDF_BUCKET || "invoice-pdfs"

function buildFilename(invoice) {
  const base = String(invoice?.title || invoice?.invoice_number || "smart-steel-invoice")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${base || "smart-steel-invoice"}.pdf`
}

function buildStoragePath(invoice) {
  const updatedAt = invoice?.updated_at || invoice?.created_at || new Date().toISOString()
  const safeUpdatedAt = String(updatedAt).replace(/[^0-9T]/g, "").replace(/:/g, "")
  return `invoices/${invoice.id}/${invoice.invoice_number || `seq-${invoice.sequence_no || 1}`}-${safeUpdatedAt}.pdf`
}

async function getCachedPdfBuffer(storagePath) {
  const { data, error } = await supabaseServer.storage
    .from(INVOICE_PDF_BUCKET)
    .download(storagePath)

  if (error || !data) return null

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function storePdfBuffer(storagePath, pdfBuffer) {
  const { error } = await supabaseServer.storage
    .from(INVOICE_PDF_BUCKET)
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "31536000",
    })

  if (error) {
    console.warn("Could not cache invoice PDF in storage:", error.message)
  }
}

export async function GET(request, { params }) {
  const { invoiceId } = await params

  const { data: invoice, error } = await supabaseServer
    .from("invoices")
    .select("id, title, invoice_number, sequence_no, share_token, created_at, updated_at")
    .eq("id", invoiceId)
    .single()

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
  }

  if (!invoice.share_token) {
    return NextResponse.json(
      { error: "This invoice does not have a share token yet." },
      { status: 400 }
    )
  }

  const storagePath = buildStoragePath(invoice)
  const cachedPdfBuffer = await getCachedPdfBuffer(storagePath)

  if (cachedPdfBuffer) {
    return new NextResponse(cachedPdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${buildFilename(invoice)}"`,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-SmartSteel-PDF-Cache": "hit",
      },
    })
  }

  const pdfUrl = new URL(`/invoices/${invoice.share_token}?pdf=1`, request.url).toString()
  let browser = null

  try {
    browser = await launchEstimatePdfBrowser()
    const page = await browser.newPage()

    await page.goto(pdfUrl, {
      waitUntil: "networkidle0",
      timeout: 45000,
    })

    await page.emulateMediaType("print")
    await page.waitForSelector(".invoice-sheet", { timeout: 15000 })

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
        "Content-Disposition": `inline; filename="${buildFilename(invoice)}"`,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-SmartSteel-PDF-Cache": "miss",
      },
    })
  } catch (pdfError) {
    console.error("Error generating invoice PDF:", pdfError)
    return NextResponse.json(
      { error: pdfError?.message || "Could not generate the invoice PDF." },
      { status: 500 }
    )
  } finally {
    await browser?.close()
  }
}
