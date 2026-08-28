import { NextResponse } from "next/server"
import { processDueEstimateFollowUps } from "lib/processEstimateFollowUps"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(request) {
  const secret = process.env.CRON_SECRET
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`)
}

export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  const result = await processDueEstimateFollowUps({ requestUrl: request.url })
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 500 })
  return NextResponse.json(result)
}
