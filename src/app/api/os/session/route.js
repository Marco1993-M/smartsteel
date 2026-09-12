import { NextResponse } from "next/server"
import { getOsRequestContext } from "lib/osRouteAuth"

export const runtime = "nodejs"

export async function GET(request) {
  const context = await getOsRequestContext(request)
  if (context.response) return context.response

  return NextResponse.json({
    user: {
      id: context.user.id,
      email: context.user.email,
    },
  })
}
