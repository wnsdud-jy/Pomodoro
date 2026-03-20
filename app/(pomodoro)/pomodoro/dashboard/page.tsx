import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { PomodoroTimer } from "@/app/pomodoro/dashboard/_components/pomodoro-timer";
import { RecentSessions } from "@/app/pomodoro/dashboard/_components/recent-sessions";
import { TodayFocusCard } from "@/app/pomodoro/dashboard/_components/today-focus-card";
import { HISTORY_PATH } from "@/lib/auth/constants";
import { serverEnv } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";
import { buildTodaySessionSummary } from "@/lib/session-stats";
import { getCompletedSessions, getRecentSessions } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { locale } = await getRequestPreferences();
  const dictionary = getDictionary(locale);
  const nowIso = new Date().toISOString();
  const summaryLookbackStart = new Date(
    new Date(nowIso).getTime() - 1000 * 60 * 60 * 48,
  ).toISOString();

  const [recentSessionsResult, todaySummarySourceResult] = await Promise.allSettled([
    getRecentSessions(24),
    getCompletedSessions({ endedAfter: summaryLookbackStart }),
  ]);
  const dashboardWarnings: string[] = [];

  if (recentSessionsResult.status === "rejected") {
    console.error("Failed to load recent sessions", recentSessionsResult.reason);
    dashboardWarnings.push(dictionary.dashboard.warnings.recent);
  }

  if (todaySummarySourceResult.status === "rejected") {
    console.error("Failed to load today summary", todaySummarySourceResult.reason);
    dashboardWarnings.push(dictionary.dashboard.warnings.summary);
  }

  const recentSessions =
    recentSessionsResult.status === "fulfilled" ? recentSessionsResult.value : [];
  const todaySummary =
    todaySummarySourceResult.status === "fulfilled"
      ? buildTodaySessionSummary(todaySummarySourceResult.value, {
          nowIso,
          timeZone: serverEnv.APP_TIMEZONE,
          unlabeledTag: dictionary.common.unlabeledTag,
        })
      : {
          focusSeconds: 0,
          focusCount: 0,
          shortBreakCount: 0,
          longBreakCount: 0,
          topTags: [],
        };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {dashboardWarnings.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50/90 dark:border-amber-400/30 dark:bg-amber-500/10">
          <CardContent className="space-y-2 p-5 text-sm leading-6 text-amber-900 dark:text-amber-100">
            {dashboardWarnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid flex-1 gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <PomodoroTimer />
        <div className="grid gap-6">
          <TodayFocusCard
            copy={dictionary.dashboard.todaySummary}
            locale={locale}
            summary={todaySummary}
          />
          <RecentSessions
            copy={dictionary.dashboard.recentSessions}
            historyHref={HISTORY_PATH}
            locale={locale}
            modeCopy={dictionary.modes}
            sessions={recentSessions.slice(0, 5)}
            unlabeledTag={dictionary.common.unlabeledTag}
          />
        </div>
      </div>
    </div>
  );
}
