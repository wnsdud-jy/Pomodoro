import type { PomodoroMode } from "@/lib/pomodoro";
import type { PomodoroSettings, PomodoroSettingsValues } from "@/types/settings";

export const POMODORO_SETTINGS_ID = "singleton";

export const POMODORO_SETTINGS_LIMITS = {
  focus_minutes: { min: 1, max: 180 },
  short_break_minutes: { min: 1, max: 60 },
  long_break_minutes: { min: 1, max: 120 },
  long_break_every: { min: 1, max: 12 },
} as const;

export const DEFAULT_POMODORO_SETTINGS_VALUES: PomodoroSettingsValues = {
  focus_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
  long_break_every: 4,
  auto_advance: true,
  auto_start_next: false,
  sound_enabled: true,
  notifications_enabled: false,
};

export function createDefaultPomodoroSettings(
  nowIso = new Date().toISOString(),
): PomodoroSettings {
  return {
    id: POMODORO_SETTINGS_ID,
    ...DEFAULT_POMODORO_SETTINGS_VALUES,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export function mergePomodoroSettings(
  settings: Partial<PomodoroSettings> | null | undefined,
): PomodoroSettings {
  const defaults = createDefaultPomodoroSettings();

  if (!settings) {
    return defaults;
  }

  return {
    ...defaults,
    ...settings,
    id: POMODORO_SETTINGS_ID,
    created_at: settings.created_at ?? defaults.created_at,
    updated_at: settings.updated_at ?? defaults.updated_at,
  };
}

export function getModeDurationSeconds(
  mode: PomodoroMode,
  settings: Pick<
    PomodoroSettings,
    "focus_minutes" | "short_break_minutes" | "long_break_minutes"
  >,
) {
  if (mode === "focus") {
    return settings.focus_minutes * 60;
  }

  if (mode === "short_break") {
    return settings.short_break_minutes * 60;
  }

  return settings.long_break_minutes * 60;
}
