import "server-only";

import { formatDateKey, getTodayDateKey } from "@/lib/format";
import { serverEnv } from "@/lib/env";
import {
  DEFAULT_POMODORO_SETTINGS_VALUES,
  POMODORO_SETTINGS_ID,
  mergePomodoroSettings,
} from "@/lib/pomodoro-settings";
import type { PomodoroMode } from "@/lib/pomodoro";
import {
  DEFAULT_APP_LOCALE,
  DEFAULT_APP_THEME,
  type AppLocale,
  type AppTheme,
} from "@/lib/preferences";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { PomodoroSettings, PomodoroSettingsValues } from "@/types/settings";
import type { CreateSessionPayload, SessionRow } from "@/types/session";

export type PersistedPreferences = {
  id: "singleton";
  locale: AppLocale;
  theme: AppTheme;
  created_at: string;
  updated_at: string;
};

type GetCompletedSessionsOptions = {
  endedAfter?: string;
  limit?: number;
  mode?: PomodoroMode;
};

export async function getCompletedSessions(
  options: GetCompletedSessionsOptions = {},
) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("sessions")
    .select("*")
    .eq("completed", true)
    .order("ended_at", { ascending: false });

  if (options.endedAfter) {
    query = query.gte("ended_at", options.endedAfter);
  }

  if (options.mode) {
    query = query.eq("mode", options.mode);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  return (data ?? []) as SessionRow[];
}

export async function getRecentSessions(limit = 10) {
  return getCompletedSessions({ limit });
}

export async function getTodayFocusSeconds() {
  const supabase = getSupabaseAdminClient();
  const lookbackStart = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select("duration_seconds, ended_at")
    .eq("completed", true)
    .eq("mode", "focus")
    .gte("ended_at", lookbackStart);

  if (error) {
    throw new Error(`Failed to fetch focus summary: ${error.message}`);
  }

  const todayKey = getTodayDateKey(serverEnv.APP_TIMEZONE);

  return (data ?? []).reduce((total, session) => {
    if (formatDateKey(session.ended_at, serverEnv.APP_TIMEZONE) !== todayKey) {
      return total;
    }

    return total + session.duration_seconds;
  }, 0);
}

export async function createCompletedSession(payload: CreateSessionPayload) {
  const supabase = getSupabaseAdminClient();
  const normalizedTag = payload.tag.trim();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      mode: payload.mode,
      tag: normalizedTag.length > 0 ? normalizedTag : null,
      duration_seconds: payload.durationSeconds,
      started_at: payload.startedAt,
      ended_at: payload.endedAt,
      completed: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data as SessionRow;
}

export async function deleteSessionById(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id)
    .eq("completed", true)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete session: ${error.message}`);
  }

  if (!data) {
    throw new Error("Session not found");
  }

  return data.id as string;
}

export async function getPersistedPreferences() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_preferences")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch persisted preferences: ${error.message}`);
  }

  return (data ?? null) as PersistedPreferences | null;
}

export async function upsertPersistedPreferences(
  payload: Partial<Pick<PersistedPreferences, "locale" | "theme">>,
) {
  const supabase = getSupabaseAdminClient();
  const currentPreferences = await getPersistedPreferences();
  const updatePayload = {
    id: "singleton" as const,
    locale: payload.locale ?? currentPreferences?.locale ?? DEFAULT_APP_LOCALE,
    theme: payload.theme ?? currentPreferences?.theme ?? DEFAULT_APP_THEME,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("app_preferences")
    .upsert(updatePayload, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to persist preferences: ${error.message}`);
  }

  return data as PersistedPreferences;
}

export async function getPomodoroSettings() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", POMODORO_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch pomodoro settings: ${error.message}`);
  }

  if (data) {
    return mergePomodoroSettings(data as PomodoroSettings);
  }

  return ensurePomodoroSettings();
}

export async function ensurePomodoroSettings() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .insert({
      id: POMODORO_SETTINGS_ID,
      ...DEFAULT_POMODORO_SETTINGS_VALUES,
    })
    .select("*")
    .single();

  if (!error) {
    return mergePomodoroSettings(data as PomodoroSettings);
  }

  const { data: existingSettings, error: existingSettingsError } = await supabase
    .from("settings")
    .select("*")
    .eq("id", POMODORO_SETTINGS_ID)
    .single();

  if (existingSettingsError) {
    throw new Error(
      `Failed to initialize pomodoro settings: ${existingSettingsError.message}`,
    );
  }

  return mergePomodoroSettings(existingSettings as PomodoroSettings);
}

export async function upsertPomodoroSettings(
  payload: Partial<PomodoroSettingsValues>,
) {
  const supabase = getSupabaseAdminClient();
  const currentSettings = await getPomodoroSettings();
  const updatePayload = {
    id: POMODORO_SETTINGS_ID,
    focus_minutes:
      payload.focus_minutes ?? currentSettings.focus_minutes,
    short_break_minutes:
      payload.short_break_minutes ?? currentSettings.short_break_minutes,
    long_break_minutes:
      payload.long_break_minutes ?? currentSettings.long_break_minutes,
    long_break_every:
      payload.long_break_every ?? currentSettings.long_break_every,
    auto_advance: payload.auto_advance ?? currentSettings.auto_advance,
    auto_start_next: payload.auto_start_next ?? currentSettings.auto_start_next,
    sound_enabled: payload.sound_enabled ?? currentSettings.sound_enabled,
    notifications_enabled:
      payload.notifications_enabled ?? currentSettings.notifications_enabled,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("settings")
    .upsert(updatePayload, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to persist pomodoro settings: ${error.message}`);
  }

  return mergePomodoroSettings(data as PomodoroSettings);
}
