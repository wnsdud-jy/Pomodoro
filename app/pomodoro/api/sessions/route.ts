import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth/session";
import { DASHBOARD_PATH, HISTORY_PATH } from "@/lib/auth/constants";
import {
  createCompletedSession,
  deleteSessionById,
  updateSessionTagById,
} from "@/lib/supabase/queries";

export const runtime = "nodejs";

const createSessionSchema = z
  .object({
    mode: z.enum(["focus", "short_break", "long_break"]),
    tag: z.string().max(40).default(""),
    durationSeconds: z.number().int().positive(),
    startedAt: z.iso.datetime({ offset: true }),
    endedAt: z.iso.datetime({ offset: true }),
    completed: z.literal(true),
  })
  .superRefine((value, context) => {
    if (new Date(value.endedAt).getTime() <= new Date(value.startedAt).getTime()) {
      context.addIssue({
        code: "custom",
        message: "endedAt must be later than startedAt",
        path: ["endedAt"],
      });
    }
  });

const deleteSessionSchema = z.object({
  id: z.string().uuid(),
});

const updateSessionTagSchema = z.object({
  id: z.string().uuid(),
  tag: z.string().max(40),
});

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

  const parsed = createSessionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid session payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const createdSession = await createCompletedSession(
      session.supabase,
      session.user.id,
      parsed.data,
    );
    revalidatePath(DASHBOARD_PATH);
    revalidatePath(HISTORY_PATH);

    return NextResponse.json({ data: createdSession }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create session";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = deleteSessionSchema.safeParse({
    id: url.searchParams.get("id"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid delete payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const deletedId = await deleteSessionById(
      session.supabase,
      session.user.id,
      parsed.data.id,
    );
    revalidatePath(DASHBOARD_PATH);
    revalidatePath(HISTORY_PATH);

    return NextResponse.json({ data: { id: deletedId } }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete session";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

  const parsed = updateSessionTagSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid update payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const updatedSession = await updateSessionTagById(
      session.supabase,
      session.user.id,
      parsed.data.id,
      parsed.data.tag,
    );
    revalidatePath(DASHBOARD_PATH);
    revalidatePath(HISTORY_PATH);

    return NextResponse.json({ data: updatedSession }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update session tag";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
