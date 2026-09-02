import { NextResponse } from "next/server"
import { processDueEstimateFollowUps } from "lib/processEstimateFollowUps"
import { processOverdueReminderNotifications } from "lib/reminderNotifications"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(request) {
  const secret = process.env.CRON_SECRET
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`)
}

export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

  const [followUps, reminders] = await Promise.all([
    processDueEstimateFollowUps({ requestUrl: request.url }),
    processOverdueReminderNotifications({ requestUrl: request.url }),
  ])
  if (followUps.error) return NextResponse.json({ error: followUps.error, reminders }, { status: followUps.status || 500 })
  return NextResponse.json({ followUps, reminders })
}
