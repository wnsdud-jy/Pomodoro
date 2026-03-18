import { NextResponse, type NextRequest } from "next/server";

import {
  DASHBOARD_PATH,
  HISTORY_PATH,
  LOGIN_PATH,
  SETTINGS_PATH,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (pathname === LOGIN_PATH && session) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (
    ((pathname === DASHBOARD_PATH || pathname.startsWith(`${DASHBOARD_PATH}/`)) ||
      pathname === HISTORY_PATH ||
      pathname.startsWith(`${HISTORY_PATH}/`) ||
      pathname === SETTINGS_PATH ||
      pathname.startsWith(`${SETTINGS_PATH}/`)) &&
    !session
  ) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (pathname.startsWith("/poromoro/api/") && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/poromoro/login",
    "/poromoro/dashboard",
    "/poromoro/dashboard/:path*",
    "/poromoro/history",
    "/poromoro/history/:path*",
    "/poromoro/settings",
    "/poromoro/settings/:path*",
    "/poromoro/api/:path*",
  ],
};
