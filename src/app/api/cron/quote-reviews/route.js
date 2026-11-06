import { NextResponse } from "next/server"
import { processQuoteReviewMail } from "lib/quoteReviewServer"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60
export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const result = await processQuoteReviewMail()
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}
