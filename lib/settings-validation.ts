import { z } from "zod";

import { POMODORO_SETTINGS_LIMITS } from "@/lib/pomodoro-settings";
import type { PomodoroSettingsValues } from "@/types/settings";

export const pomodoroSettingsSchema = z.object({
  focus_minutes: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.focus_minutes.min)
    .max(POMODORO_SETTINGS_LIMITS.focus_minutes.max),
  short_break_minutes: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.short_break_minutes.min)
    .max(POMODORO_SETTINGS_LIMITS.short_break_minutes.max),
  long_break_minutes: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.long_break_minutes.min)
    .max(POMODORO_SETTINGS_LIMITS.long_break_minutes.max),
  long_break_every: z
    .number()
    .int()
    .min(POMODORO_SETTINGS_LIMITS.long_break_every.min)
    .max(POMODORO_SETTINGS_LIMITS.long_break_every.max),
  auto_advance: z.boolean(),
  auto_start_next: z.boolean(),
  sound_enabled: z.boolean(),
  notifications_enabled: z.boolean(),
});

export function parsePomodoroSettingsInput(input: unknown) {
  return pomodoroSettingsSchema.safeParse(input);
}

export type PomodoroSettingsInput = PomodoroSettingsValues;
