import type { PomodoroMode } from "@/lib/pomodoro";
import { formatSeconds } from "@/lib/format";
import { DEFAULT_APP_TIME_ZONE, normalizeTimeZone } from "@/lib/timezones";
import type { PomodoroSettings, PomodoroSettingsValues } from "@/types/settings";

const SECONDS_PER_MINUTE = 60;

export const POMODORO_SETTINGS_LIMITS = {
  focus_duration_seconds: { min: 1, max: 180 * SECONDS_PER_MINUTE },
  short_break_duration_seconds: { min: 1, max: 60 * SECONDS_PER_MINUTE },
  long_break_duration_seconds: { min: 1, max: 120 * SECONDS_PER_MINUTE },
  long_break_every: { min: 1, max: 12 },
} as const;

export const DEFAULT_POMODORO_SETTINGS_VALUES: PomodoroSettingsValues = {
  focus_duration_seconds: 25 * SECONDS_PER_MINUTE,
  short_break_duration_seconds: 5 * SECONDS_PER_MINUTE,
  long_break_duration_seconds: 15 * SECONDS_PER_MINUTE,
  long_break_every: 4,
  timezone: DEFAULT_APP_TIME_ZONE,
  auto_advance: true,
  auto_start_next: false,
  sound_enabled: true,
  notifications_enabled: false,
};

type LegacyPomodoroSettings = Partial<PomodoroSettings> & {
  focus_minutes?: number | null;
  short_break_minutes?: number | null;
  long_break_minutes?: number | null;
};

export function createDefaultPomodoroSettings(
  nowIso = new Date().toISOString(),
): PomodoroSettings {
  return {
    ...DEFAULT_POMODORO_SETTINGS_VALUES,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export function mergePomodoroSettings(
  settings: LegacyPomodoroSettings | null | undefined,
): PomodoroSettings {
  const defaults = createDefaultPomodoroSettings();

  if (!settings) {
    return defaults;
  }

  return {
    ...defaults,
    ...settings,
    focus_duration_seconds:
      settings.focus_duration_seconds ??
      (settings.focus_minutes != null
        ? settings.focus_minutes * SECONDS_PER_MINUTE
        : defaults.focus_duration_seconds),
    short_break_duration_seconds:
      settings.short_break_duration_seconds ??
      (settings.short_break_minutes != null
        ? settings.short_break_minutes * SECONDS_PER_MINUTE
        : defaults.short_break_duration_seconds),
    long_break_duration_seconds:
      settings.long_break_duration_seconds ??
      (settings.long_break_minutes != null
        ? settings.long_break_minutes * SECONDS_PER_MINUTE
        : defaults.long_break_duration_seconds),
    timezone: normalizeTimeZone(settings.timezone),
    created_at: settings.created_at ?? defaults.created_at,
    updated_at: settings.updated_at ?? defaults.updated_at,
  };
}

type DurationFieldKey =
  | "focus_duration_seconds"
  | "short_break_duration_seconds"
  | "long_break_duration_seconds";

type DurationParseSuccess = {
  success: true;
  seconds: number;
};

type DurationParseFailure = {
  success: false;
};

export function formatDurationInput(totalSeconds: number) {
  if (totalSeconds % SECONDS_PER_MINUTE === 0) {
    return String(totalSeconds / SECONDS_PER_MINUTE);
  }

  return formatSeconds(totalSeconds);
}

export function parseDurationInput(
  value: string,
  key: DurationFieldKey,
): DurationParseSuccess | DurationParseFailure {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return { success: false };
  }

  const limits = POMODORO_SETTINGS_LIMITS[key];

  if (/^\d+$/.test(trimmedValue)) {
    const minutes = Number(trimmedValue);

    if (!Number.isInteger(minutes)) {
      return { success: false };
    }

    const seconds = minutes * SECONDS_PER_MINUTE;

    if (seconds < limits.min || seconds > limits.max) {
      return { success: false };
    }

    return {
      success: true,
      seconds,
    };
  }

  const match = /^(\d+):(\d{2})$/.exec(trimmedValue);

  if (!match) {
    return { success: false };
  }

  const minutes = Number(match[1]);
  const secondsPart = Number(match[2]);

  if (secondsPart >= SECONDS_PER_MINUTE) {
    return { success: false };
  }

  const seconds = minutes * SECONDS_PER_MINUTE + secondsPart;

  if (seconds < limits.min || seconds > limits.max) {
    return { success: false };
  }

  return {
    success: true,
    seconds,
  };
}

export function getModeDurationSeconds(
  mode: PomodoroMode,
  settings: Pick<
    PomodoroSettings,
    | "focus_duration_seconds"
    | "short_break_duration_seconds"
    | "long_break_duration_seconds"
  >,
) {
  if (mode === "focus") {
    return settings.focus_duration_seconds;
  }

  if (mode === "short_break") {
    return settings.short_break_duration_seconds;
  }

  return settings.long_break_duration_seconds;
}
