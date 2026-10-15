import { NextResponse } from "next/server"
import { getOsRequestContext } from "./osRouteAuth"
import { supabaseServer } from "./supabase-server"

export async function getAnnualPlanContext(request, requireEdit = false) {
  const context = await getOsRequestContext(request)
  if (context.response) return context
  const email = String(context.user.email || "").trim().toLowerCase()
  const access = await supabaseServer.from("os_annual_plan_access").select("email,access_level").in("email", [email, "*"])
  if (access.error) return { response: NextResponse.json({ error: "Annual planning access is not configured. Run the SQL migration and add an approved OS email." }, { status: 503 }) }
  const matching = (access.data || []).find((row) => row.email === email) || (access.data || []).find((row) => row.email === "*")
  if (!matching || requireEdit && matching.access_level !== "edit") return { response: NextResponse.json({ error: "Your OS account does not have access to the financial plan." }, { status: 403 }) }
  return { user: context.user, accessLevel: matching.access_level }
}
