import { NextResponse } from "next/server"

const AFGRI_PORTAL_HOST = process.env.AFGRI_PORTAL_HOST || "afgri.smartsteel.co.za"
const SMART_STEEL_HOSTS = new Set(["smartsteel.co.za", "www.smartsteel.co.za"])
const AFGRI_PORTAL_ROUTES = new Map([
  ["/", "/partner"],
  ["/login", "/partner/login"],
  ["/opportunities", "/partner/opportunities"],
])

export function middleware(request) {
  const hostname = (request.headers.get("host") || "").split(":")[0].toLowerCase()
  const pathname = request.nextUrl.pathname

  if (hostname === AFGRI_PORTAL_HOST) {
    if (pathname.startsWith("/api/os")) {
      return NextResponse.json({ error: "Not found." }, { status: 404 })
    }

    if (pathname === "/os" || pathname.startsWith("/os/")) {
      return NextResponse.redirect(new URL("/partner", request.url))
    }

    const partnerPath = AFGRI_PORTAL_ROUTES.get(pathname)
    if (partnerPath) return NextResponse.rewrite(new URL(partnerPath, request.url))
  }

  if (SMART_STEEL_HOSTS.has(hostname)) {
    if (pathname.startsWith("/api/partner")) {
      return NextResponse.json({ error: "Not found." }, { status: 404 })
    }

    if (pathname === "/partner" || pathname.startsWith("/partner/")) {
      const destination = new URL(pathname, `https://${AFGRI_PORTAL_HOST}`)
      destination.search = request.nextUrl.search
      return NextResponse.redirect(destination)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
