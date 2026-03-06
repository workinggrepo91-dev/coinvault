import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Use the edge-compatible config to initialize NextAuth for the middleware
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const isTryingToAccessAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isTryingToAccessDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isTryingToAccessAdmin) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (userRole !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isTryingToAccessDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};