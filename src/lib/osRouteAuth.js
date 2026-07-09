import { NextResponse } from "next/server"
import { supabaseServer } from "./supabase-server"

export async function requireOsAuth(request) {
  const authHeader = request.headers.get("authorization") || ""

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const token = authHeader.slice("Bearer ".length).trim()

  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  return null
}

