import { z } from "zod";

import { POMODORO_SETTINGS_LIMITS } from "@/lib/pomodoro-settings";
import { isSupportedTimeZone } from "@/lib/timezones";
import type { PomodoroSettingsValues } from "@/types/settings";

export const pomodoroSettingsSchema = z.object({
  focus_duration_seconds: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.focus_duration_seconds.min)
    .max(POMODORO_SETTINGS_LIMITS.focus_duration_seconds.max),
  short_break_duration_seconds: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.short_break_duration_seconds.min)
    .max(POMODORO_SETTINGS_LIMITS.short_break_duration_seconds.max),
  long_break_duration_seconds: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.long_break_duration_seconds.min)
    .max(POMODORO_SETTINGS_LIMITS.long_break_duration_seconds.max),
  long_break_every: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.long_break_every.min)
    .max(POMODORO_SETTINGS_LIMITS.long_break_every.max),
  timezone: z.string().refine((value) => isSupportedTimeZone(value), {
    message: "Invalid timezone",
  }),
  auto_advance: z.boolean(),
  auto_start_next: z.boolean(),
  sound_enabled: z.boolean(),
  notifications_enabled: z.boolean(),
});

export function parsePomodoroSettingsInput(input: unknown) {
  return pomodoroSettingsSchema.safeParse(input);
}

export type PomodoroSettingsInput = PomodoroSettingsValues;
