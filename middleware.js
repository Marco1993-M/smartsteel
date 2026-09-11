import { NextResponse } from "next/server"

const AFGRI_PORTAL_HOST = process.env.AFGRI_PORTAL_HOST || "afgri.smartsteel.co.za"
const AFGRI_PORTAL_ROUTES = new Map([
  ["/", "/partner"],
  ["/login", "/partner/login"],
  ["/opportunities", "/partner/opportunities"],
])

export function middleware(request) {
  const hostname = (request.headers.get("host") || "").split(":")[0].toLowerCase()
  const pathname = request.nextUrl.pathname

  const partnerPath = AFGRI_PORTAL_ROUTES.get(pathname)
  if (hostname === AFGRI_PORTAL_HOST && partnerPath) {
    return NextResponse.rewrite(new URL(partnerPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
