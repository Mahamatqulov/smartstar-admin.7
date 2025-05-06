import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value || request.headers.get("Authorization")?.split(" ")[1]
  const isLoginPage = request.nextUrl.pathname === "/login"

  // If trying to access login page and already authenticated, redirect to dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If trying to access protected route and not authenticated, redirect to login
  if (!isLoginPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/settings/:path*"],
}
