import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export function middleware(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some(
    (name) => Boolean(request.cookies.get(name)?.value),
  );

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    const callbackPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("callbackURL", callbackPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
