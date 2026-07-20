import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { syncGoogleAds } from "lib/googleMarketingSync"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse
  try {
    const result = await syncGoogleAds()
    return NextResponse.json({ ok: true, source: "google_ads", ...result })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Google Ads sync failed." }, { status: 500 })
  }
}
