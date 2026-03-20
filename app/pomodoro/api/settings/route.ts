import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { DASHBOARD_PATH, HISTORY_PATH, SETTINGS_PATH } from "@/lib/auth/constants";
import { getAuthSession } from "@/lib/auth/session";
import { parsePomodoroSettingsInput } from "@/lib/settings-validation";
import {
  getPomodoroSettings,
  upsertPomodoroSettings,
} from "@/lib/supabase/queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getPomodoroSettings();
    return NextResponse.json({ data: settings }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load pomodoro settings";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = parsePomodoroSettingsInput(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid settings payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const settings = await upsertPomodoroSettings(parsed.data);
    revalidatePath(DASHBOARD_PATH);
    revalidatePath(HISTORY_PATH);
    revalidatePath(SETTINGS_PATH);

    return NextResponse.json({ data: settings }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save pomodoro settings";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
