import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatDateKey, getTodayDateKey } from "@/lib/format";
import {
  DEFAULT_POMODORO_SETTINGS_VALUES,
  mergePomodoroSettings,
} from "@/lib/pomodoro-settings";
import type { PomodoroMode } from "@/lib/pomodoro";
import {
  DEFAULT_APP_LOCALE,
  DEFAULT_APP_THEME,
  type AppLocale,
  type AppTheme,
} from "@/lib/preferences";
import { DEFAULT_APP_TIME_ZONE } from "@/lib/timezones";
import type { PomodoroSettings, PomodoroSettingsValues } from "@/types/settings";
import type { CreateSessionPayload, SessionRow } from "@/types/session";

export type PersistedPreferences = {
  user_id: string;
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
  supabase: SupabaseClient,
  userId: string,
  options: GetCompletedSessionsOptions = {},
) {
  let query = supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
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

export async function getRecentSessions(
  supabase: SupabaseClient,
  userId: string,
  limit = 10,
) {
  return getCompletedSessions(supabase, userId, { limit });
}

export async function getTodayFocusSeconds(
  supabase: SupabaseClient,
  userId: string,
  timeZone = DEFAULT_APP_TIME_ZONE,
) {
  const lookbackStart = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select("duration_seconds, ended_at")
    .eq("user_id", userId)
    .eq("completed", true)
    .eq("mode", "focus")
    .gte("ended_at", lookbackStart);

  if (error) {
    throw new Error(`Failed to fetch focus summary: ${error.message}`);
  }

  const todayKey = getTodayDateKey(timeZone);

  return (data ?? []).reduce((total, session) => {
    if (formatDateKey(session.ended_at, timeZone) !== todayKey) {
      return total;
    }

    return total + session.duration_seconds;
  }, 0);
}

export async function createCompletedSession(
  supabase: SupabaseClient,
  userId: string,
  payload: CreateSessionPayload,
) {
  const normalizedTag = payload.tag.trim();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
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

export async function deleteSessionById(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("user_id", userId)
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

export async function updateSessionTagById(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  tag: string,
) {
  const normalizedTag = tag.trim();
  const { data, error } = await supabase
    .from("sessions")
    .update({
      tag: normalizedTag.length > 0 ? normalizedTag : null,
    })
    .eq("user_id", userId)
    .eq("id", id)
    .eq("completed", true)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update session tag: ${error.message}`);
  }

  if (!data) {
    throw new Error("Session not found");
  }

  return data as SessionRow;
}

export async function getPersistedPreferences(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("app_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch persisted preferences: ${error.message}`);
  }

  return (data ?? null) as PersistedPreferences | null;
}

export async function upsertPersistedPreferences(
  supabase: SupabaseClient,
  userId: string,
  payload: Partial<Pick<PersistedPreferences, "locale" | "theme">>,
) {
  const currentPreferences = await getPersistedPreferences(supabase, userId);
  const updatePayload = {
    user_id: userId,
    locale: payload.locale ?? currentPreferences?.locale ?? DEFAULT_APP_LOCALE,
    theme: payload.theme ?? currentPreferences?.theme ?? DEFAULT_APP_THEME,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("app_preferences")
    .upsert(updatePayload, {
      onConflict: "user_id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to persist preferences: ${error.message}`);
  }

  return data as PersistedPreferences;
}

export async function getPomodoroSettings(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch pomodoro settings: ${error.message}`);
  }

  if (data) {
    return mergePomodoroSettings(data as PomodoroSettings);
  }

  return ensurePomodoroSettings(supabase, userId);
}

export async function ensurePomodoroSettings(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("settings")
    .insert({
      user_id: userId,
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
    .eq("user_id", userId)
    .maybeSingle();

  if (existingSettingsError || !existingSettings) {
    throw new Error(
      `Failed to initialize pomodoro settings: ${existingSettingsError?.message ?? "Settings not found"}`,
    );
  }

  return mergePomodoroSettings(existingSettings as PomodoroSettings);
}

export async function upsertPomodoroSettings(
  supabase: SupabaseClient,
  userId: string,
  payload: Partial<PomodoroSettingsValues>,
) {
  const currentSettings = await getPomodoroSettings(supabase, userId);
  const updatePayload = {
    user_id: userId,
    focus_minutes: payload.focus_minutes ?? currentSettings.focus_minutes,
    short_break_minutes:
      payload.short_break_minutes ?? currentSettings.short_break_minutes,
    long_break_minutes:
      payload.long_break_minutes ?? currentSettings.long_break_minutes,
    long_break_every:
      payload.long_break_every ?? currentSettings.long_break_every,
    timezone: payload.timezone ?? currentSettings.timezone,
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
      onConflict: "user_id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to persist pomodoro settings: ${error.message}`);
  }

  return mergePomodoroSettings(data as PomodoroSettings);
}
