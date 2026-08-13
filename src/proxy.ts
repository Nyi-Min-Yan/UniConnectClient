import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_PATH_MAP: Record<string, string> = {
  STUDENT: "students",
  STAFF: "teachers",
  SYSTEM_ADMIN: "admin",
};

const PATH_ROLE_MAP: Record<string, string[]> = {
  admin: ["SYSTEM_ADMIN"],
  teachers: ["STAFF", "SYSTEM_ADMIN"],
  students: ["STUDENT", "SYSTEM_ADMIN"],
  manage: ["STAFF", "SYSTEM_ADMIN"],
  "student-affire": ["STAFF", "SYSTEM_ADMIN"],
  finance: ["STAFF", "SYSTEM_ADMIN"],
};

const PUBLIC_PATHS = ["/login", "/_next", "/api", "/favicon", "/"];

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const pathSegment = pathname.split("/")[1];

  if (!pathSegment || !PATH_ROLE_MAP[pathSegment]) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const role = payload.role as string;
  if (!role) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const allowedRoles = PATH_ROLE_MAP[pathSegment];
  if (!allowedRoles.includes(role)) {
    const rolePath = ROLE_PATH_MAP[role];
    if (rolePath) {
      return NextResponse.redirect(new URL(`/${rolePath}/feed`, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};