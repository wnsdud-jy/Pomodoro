import { DashboardTimerProvider } from "@/app/pomodoro/dashboard/_components/dashboard-timer-provider";
import { requireAuthSession } from "@/lib/auth/session";
import { formatDateKey, getTodayDateKey } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/messages";
import { getFocusStreakSinceLongBreak } from "@/lib/pomodoro-flow";
import { createDefaultPomodoroSettings } from "@/lib/pomodoro-settings";
import { getRequestPreferences } from "@/lib/preferences/server";
import { buildFocusStreakSummary } from "@/lib/session-stats";
import { getCompletedSessions, getPomodoroSettings, getRecentSessions } from "@/lib/supabase/queries";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuthSession();
  const { locale } = await getRequestPreferences();
  const dictionary = getDictionary(locale);

  const [recentSessionsResult, settingsResult, completedSessionsResult] = await Promise.allSettled([
    getRecentSessions(session.supabase, session.user.id, 24),
    getPomodoroSettings(session.supabase, session.user.id),
    getCompletedSessions(session.supabase, session.user.id),
  ]);

  if (recentSessionsResult.status === "rejected") {
    console.error(
      "Failed to load recent sessions for dashboard timer provider",
      recentSessionsResult.reason,
    );
  }

  if (settingsResult.status === "rejected") {
    console.error(
      "Failed to load pomodoro settings for dashboard timer provider",
      settingsResult.reason,
    );
  }

  if (completedSessionsResult.status === "rejected") {
    console.error(
      "Failed to load completed sessions for dashboard timer provider",
      completedSessionsResult.reason,
    );
  }

  const recentSessions =
    recentSessionsResult.status === "fulfilled" ? recentSessionsResult.value : [];
  const completedSessions =
    completedSessionsResult.status === "fulfilled" ? completedSessionsResult.value : [];
  const settings =
    settingsResult.status === "fulfilled"
      ? settingsResult.value
      : createDefaultPomodoroSettings();
  const recentTags = Array.from(
    new Set(
      recentSessions
        .map((session) => session.tag?.trim() ?? "")
        .filter((tag) => tag.length > 0),
    ),
  ).slice(0, 5);
  const nowIso = new Date().toISOString();
  const todayKey =
    settingsResult.status === "fulfilled" ? getTodayDateKey(settings.timezone) : null;
  const initialTodayFocusCount = todayKey
    ? completedSessions.filter(
        (session) =>
          session.mode === "focus" &&
          formatDateKey(session.ended_at, settings.timezone) === todayKey,
      ).length
    : 0;
  const initialDailyFocusStreak =
    settingsResult.status === "fulfilled"
      ? buildFocusStreakSummary(completedSessions, {
          nowIso,
          timeZone: settings.timezone,
        }).currentStreak
      : 0;

  return (
    <DashboardTimerProvider
      appName={dictionary.common.appName}
      copy={dictionary.dashboard.timer}
      initialDailyFocusStreak={initialDailyFocusStreak}
      initialFocusStreak={getFocusStreakSinceLongBreak(recentSessions)}
      initialTodayFocusCount={initialTodayFocusCount}
      modeCopy={dictionary.modes}
      recentTags={recentTags}
      settings={settings}
    >
      {children}
    </DashboardTimerProvider>
  );
}
