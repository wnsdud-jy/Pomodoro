import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  DASHBOARD_PATH,
  DEMO_PATH,
  HISTORY_PATH,
  LOGIN_PATH,
  SETTINGS_PATH,
} from "@/lib/auth/constants";
import { serverEnv } from "@/lib/env";

function withSessionCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  target.headers.set("Cache-Control", "private, no-store");
  return target;
}

function isProtectedPath(pathname: string) {
  if (pathname.startsWith(DEMO_PATH)) {
    return false;
  }

  if (pathname.startsWith("/pomodoro/api/")) {
    return true;
  }

  return (
    pathname === DASHBOARD_PATH ||
    pathname.startsWith(`${DASHBOARD_PATH}/`) ||
    pathname === HISTORY_PATH ||
    pathname.startsWith(`${HISTORY_PATH}/`) ||
    pathname === SETTINGS_PATH ||
    pathname.startsWith(`${SETTINGS_PATH}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
      global: {
        headers: {
          "X-Client-Info": "pomodoro-mvp",
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    if (request.nextUrl.pathname.startsWith("/pomodoro/api/")) {
      return withSessionCookies(
        response,
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      );
    }

    return withSessionCookies(
      response,
      NextResponse.redirect(new URL(LOGIN_PATH, request.url)),
    );
  }

  if (user && request.nextUrl.pathname === LOGIN_PATH) {
    return withSessionCookies(
      response,
      NextResponse.redirect(new URL(DASHBOARD_PATH, request.url)),
    );
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
