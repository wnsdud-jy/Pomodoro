import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth/session";
import { serverEnv } from "@/lib/env";
import { getCompletedSessions } from "@/lib/supabase/queries";
import {
  buildSessionExportFilename,
  buildSessionsCsv,
  filterSessionsForExport,
  normalizeSessionExportDate,
  normalizeSessionExportModeFilter,
  normalizeSessionExportPeriodFilter,
} from "@/lib/session-export";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const nowIso = new Date().toISOString();
  const periodFilter = normalizeSessionExportPeriodFilter(url.searchParams.get("period"));
  const modeFilter = normalizeSessionExportModeFilter(url.searchParams.get("mode"));
  const tagQuery = url.searchParams.get("tag") ?? "";
  const selectedDate = normalizeSessionExportDate(url.searchParams.get("date"));

  try {
    const sessions = await getCompletedSessions();
    const filteredSessions = filterSessionsForExport(sessions, {
      periodFilter,
      modeFilter,
      tagQuery,
      selectedDate,
      nowIso,
      timeZone: serverEnv.APP_TIMEZONE,
    });
    const csv = buildSessionsCsv(filteredSessions);
    const filename = buildSessionExportFilename({
      nowIso,
      periodFilter,
      selectedDate,
      timeZone: serverEnv.APP_TIMEZONE,
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to export sessions";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
