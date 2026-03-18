import { DashboardTimerProvider } from "@/app/poromoro/dashboard/_components/dashboard-timer-provider";
import { getDictionary } from "@/lib/i18n/messages";
import { getFocusStreakSinceLongBreak } from "@/lib/pomodoro-flow";
import { createDefaultPomodoroSettings } from "@/lib/pomodoro-settings";
import { getRequestPreferences } from "@/lib/preferences/server";
import { getPomodoroSettings, getRecentSessions } from "@/lib/supabase/queries";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getRequestPreferences();
  const dictionary = getDictionary(locale);

  const [recentSessionsResult, settingsResult] = await Promise.allSettled([
    getRecentSessions(24),
    getPomodoroSettings(),
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

  const recentSessions =
    recentSessionsResult.status === "fulfilled" ? recentSessionsResult.value : [];
  const settings =
    settingsResult.status === "fulfilled"
      ? settingsResult.value
      : createDefaultPomodoroSettings();

  return (
    <DashboardTimerProvider
      appName={dictionary.common.appName}
      copy={dictionary.dashboard.timer}
      initialFocusStreak={getFocusStreakSinceLongBreak(recentSessions)}
      modeCopy={dictionary.modes}
      settings={settings}
    >
      {children}
    </DashboardTimerProvider>
  );
}
