import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/pomodoro/login",
    "/pomodoro/dashboard",
    "/pomodoro/dashboard/:path*",
    "/pomodoro/history",
    "/pomodoro/history/:path*",
    "/pomodoro/settings",
    "/pomodoro/settings/:path*",
    "/pomodoro/api/:path*",
  ],
};
