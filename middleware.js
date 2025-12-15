import { NextResponse } from "next/server";
import { supabaseAdmin } from "./src/lib/supabaseAuth";


export async function middleware(req) {
  const url = req.nextUrl.clone();

  // Only protect /kanban routes
  if (url.pathname.startsWith("/kanban")) {
    const token = req.cookies.get("sb-access-token");

    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Validate token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token.value);

    if (error || !data?.user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // ✅ user is guaranteed here as data.user
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kanban/:path*"],
};
