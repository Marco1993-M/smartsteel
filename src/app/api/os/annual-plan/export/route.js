import { NextResponse } from "next/server"
import { getAnnualPlanContext } from "lib/annualPlanAuth"
import { supabaseServer } from "lib/supabase-server"
import { normalizeAnnualPlan } from "lib/annualPlan.mjs"
import { normalizeCommercialModel } from "lib/annualCommercialPlan.mjs"
import { buildAnnualPlanHtml } from "lib/annualPlanPdf.mjs"
import { launchEstimatePdfBrowser, renderHtmlPdf } from "lib/estimates/pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function orderMonths(rows, year) {
  const months = Array.from({ length: 12 }, () => ({ count: 0 }))
  for (const row of rows) {
    if (row.status === "cancelled") continue
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit" }).formatToParts(new Date(row.accepted_at))
    if (Number(parts.find((part) => part.type === "year")?.value) !== year) continue
    const month = Number(parts.find((part) => part.type === "month")?.value) - 1
    if (month >= 0 && month < 12) months[month].count++
  }
  return months
}

export async function POST(request) {
  const context = await getAnnualPlanContext(request)
  if (context.response) return context.response
  const year = Number(new URL(request.url).searchParams.get("year"))
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return NextResponse.json({ error: "Choose a valid year." }, { status: 400 })
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }) }
  if (!Array.isArray(body?.plan?.months) || body.plan.months.length !== 12 || !Array.isArray(body?.previousPlan?.months) || body.previousPlan.months.length !== 12 || JSON.stringify(body).length > 250000) return NextResponse.json({ error: "Invalid annual plan." }, { status: 400 })
  try {
    const plan = { ...normalizeAnnualPlan(body.plan, year), commercialModel: normalizeCommercialModel(body.plan.commercialModel) }
    const previousPlan = normalizeAnnualPlan(body.previousPlan, year - 1)
    const orders = []
    for (let from = 0; ; from += 1000) {
      const result = await supabaseServer.from("sales_orders").select("accepted_at,status")
        .gte("accepted_at", `${year - 2}-12-31T22:00:00Z`).lt("accepted_at", `${year}-12-31T22:00:00Z`)
        .order("accepted_at", { ascending: true }).range(from, from + 999)
      if (result.error) throw result.error
      orders.push(...(result.data || []))
      if ((result.data || []).length < 1000) break
    }
    const html = buildAnnualPlanHtml({ plan, previousPlan, orders: orderMonths(orders, year), previousOrders: orderMonths(orders, year - 1), unsaved: Boolean(body.unsaved) })
    const browser = await launchEstimatePdfBrowser()
    const pdf = await renderHtmlPdf({ browser, html, landscape: true })
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="smart-steel-${year}-annual-plan.pdf"`, "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Could not export annual plan:", error)
    return NextResponse.json({ error: "Could not export the annual plan." }, { status: 500 })
  }
}
