import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth/session";
import {
  APP_LOCALES,
  APP_THEMES,
  LOCALE_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from "@/lib/preferences";
import { upsertPersistedPreferences } from "@/lib/supabase/queries";

export const runtime = "nodejs";

const updatePreferencesSchema = z
  .object({
    locale: z.enum(APP_LOCALES).optional(),
    theme: z.enum(APP_THEMES).optional(),
  })
  .refine((value) => value.locale !== undefined || value.theme !== undefined, {
    message: "At least one preference must be provided",
  });

export async function POST(request: Request) {
  const session = await getAuthSession();
  const cookieStore = await cookies();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = updatePreferencesSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid preferences payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const preferences = await upsertPersistedPreferences(
      session.supabase,
      session.user.id,
      parsed.data,
    );

    if (parsed.data.locale) {
      cookieStore.set({
        name: LOCALE_COOKIE_NAME,
        value: parsed.data.locale,
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    if (parsed.data.theme) {
      cookieStore.set({
        name: THEME_COOKIE_NAME,
        value: parsed.data.theme,
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return NextResponse.json({ data: preferences }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to persist preferences";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
