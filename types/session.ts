import type { PomodoroMode } from "@/lib/pomodoro";

export type SessionRow = {
  id: string;
  mode: PomodoroMode;
  tag: string | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  completed: boolean;
  created_at: string;
};

export type SessionModeFilter = "all" | PomodoroMode;

export type TagFocusSummaryRow = {
  tag: string;
  totalSeconds: number;
  sessionCount: number;
};

export type TodaySessionSummary = {
  focusSeconds: number;
  focusCount: number;
  shortBreakCount: number;
  longBreakCount: number;
  topTags: TagFocusSummaryRow[];
};

export type FocusStreakSummary = {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
};

export type HistoryOverviewStats = {
  todayFocusSeconds: number;
  last7DaysFocusSeconds: number;
  todayFocusCount: number;
  topTag: TagFocusSummaryRow | null;
};

export type HistoryRangeSummary = {
  focusSeconds: number;
  focusCount: number;
};

export type HistorySummaryStats = {
  today: HistoryRangeSummary;
  week: HistoryRangeSummary;
  month: HistoryRangeSummary;
  averageFocusSeconds: number;
  topTag: TagFocusSummaryRow | null;
};

export type FocusTrendPoint = {
  dateKey: string;
  label: string;
  totalSeconds: number;
  focusCount: number;
};

export type WeekdayFocusRow = {
  weekday: number;
  label: string;
  totalSeconds: number;
  focusCount: number;
};

export type GroupedSessionDay = {
  dateKey: string;
  label: string;
  focusSeconds: number;
  focusCount: number;
  sessionCount: number;
  sessions: SessionRow[];
};

export type HistoryInsightSummary = {
  bestDayLast7: FocusTrendPoint | null;
  bestDayLast30: FocusTrendPoint | null;
  busiestWeekday: WeekdayFocusRow | null;
  topTagLast30: TagFocusSummaryRow | null;
};

export type CreateSessionPayload = {
  mode: PomodoroMode;
  tag: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  completed: true;
};

export type UpdateSessionTagPayload = {
  id: string;
  tag: string;
};
