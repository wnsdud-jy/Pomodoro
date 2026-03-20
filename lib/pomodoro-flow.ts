import type { PomodoroMode } from "@/lib/pomodoro";
import type { SessionRow } from "@/types/session";

export function getFocusStreakSinceLongBreak(sessions: SessionRow[]) {
  let focusCount = 0;

  for (const session of sessions) {
    if (session.mode === "long_break") {
      break;
    }

    if (session.mode === "focus") {
      focusCount += 1;
    }
  }

  return focusCount;
}

export function getFocusStreakAfterCompletion(
  mode: PomodoroMode,
  currentFocusStreak: number,
) {
  if (mode === "focus") {
    return currentFocusStreak + 1;
  }

  if (mode === "long_break") {
    return 0;
  }

  return currentFocusStreak;
}

export function getCompletedFocusesInCycle(
  focusStreak: number,
  longBreakEvery: number,
) {
  if (focusStreak === 0) {
    return 0;
  }

  const remainder = focusStreak % longBreakEvery;

  return remainder === 0 ? longBreakEvery : remainder;
}

export function getCurrentFocusIndex(
  mode: PomodoroMode,
  focusStreak: number,
  longBreakEvery: number,
) {
  if (mode === "focus") {
    return getCompletedFocusesInCycle(focusStreak, longBreakEvery) + 1;
  }

  const completedFocuses = getCompletedFocusesInCycle(focusStreak, longBreakEvery);
  return completedFocuses === 0 ? 1 : completedFocuses;
}

export function getNextMode(
  mode: PomodoroMode,
  focusStreak: number,
  longBreakEvery: number,
): PomodoroMode {
  if (mode !== "focus") {
    return "focus";
  }

  const completedFocuses = focusStreak + 1;
  return completedFocuses % longBreakEvery === 0 ? "long_break" : "short_break";
}
