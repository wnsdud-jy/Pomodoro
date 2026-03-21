export type PomodoroSettings = {
  focus_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  long_break_every: number;
  auto_advance: boolean;
  auto_start_next: boolean;
  sound_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type PomodoroSettingsValues = Omit<
  PomodoroSettings,
  "created_at" | "updated_at"
>;
