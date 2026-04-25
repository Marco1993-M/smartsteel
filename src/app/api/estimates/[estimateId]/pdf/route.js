import { NextResponse } from "next/server"
import { launchEstimatePdfBrowser } from "../../../../../lib/estimates/pdf"
import { supabaseServer } from "../../../../../lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function buildFilename(estimate) {
  const base = String(estimate?.title || `smart-steel-quote-${estimate?.version_no || "1"}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${base || "smart-steel-quote"}.pdf`
}

export async function GET(request, { params }) {
  const { estimateId } = await params

  const { data: estimate, error } = await supabaseServer
    .from("estimates")
    .select("id, title, version_no, share_token")
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

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${buildFilename(estimate)}"`,
        "Cache-Control": "no-store",
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
