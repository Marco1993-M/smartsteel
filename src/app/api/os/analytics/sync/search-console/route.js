import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { syncSearchConsole } from "lib/googleMarketingSync"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse
  try {
    const result = await syncSearchConsole()
    return NextResponse.json({ ok: true, source: "search_console", ...result })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Search Console sync failed." }, { status: 500 })
  }
}
