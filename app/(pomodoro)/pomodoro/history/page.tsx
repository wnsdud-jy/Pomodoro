import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { HistoryView } from "@/app/pomodoro/history/_components/history-view";
import { requireAuthSession } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/messages";
import { createDefaultPomodoroSettings } from "@/lib/pomodoro-settings";
import { getRequestPreferences } from "@/lib/preferences/server";
import {
  normalizeSelectedDate,
  normalizeSessionModeFilter,
  normalizeSessionPeriodFilter,
} from "@/lib/session-stats";
import { getCompletedSessions, getPomodoroSettings } from "@/lib/supabase/queries";
import type { SessionRow } from "@/types/session";

export const metadata: Metadata = {
  title: "History",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    period?: string;
    tag?: string;
    date?: string;
  }>;
}) {
  const session = await requireAuthSession();
  const { locale } = await getRequestPreferences();
  const dictionary = getDictionary(locale);
  const resolvedSearchParams = await searchParams;
  const initialModeFilter = normalizeSessionModeFilter(resolvedSearchParams.mode);
  const initialPeriodFilter = normalizeSessionPeriodFilter(resolvedSearchParams.period);
  const initialTagQuery =
    typeof resolvedSearchParams.tag === "string"
      ? resolvedSearchParams.tag.slice(0, 40)
      : "";
  const initialSelectedDate = normalizeSelectedDate(resolvedSearchParams.date);
  const nowIso = new Date().toISOString();

  let sessions: SessionRow[] = [];
  let historyWarning: string | null = null;
  let settings = createDefaultPomodoroSettings();

  const [sessionsResult, settingsResult] = await Promise.allSettled([
    getCompletedSessions(session.supabase, session.user.id),
    getPomodoroSettings(session.supabase, session.user.id),
  ]);

  if (sessionsResult.status === "fulfilled") {
    sessions = sessionsResult.value;
  } else {
    console.error("Failed to load history sessions", sessionsResult.reason);
    historyWarning = dictionary.history.warnings.sessions;
  }

  if (settingsResult.status === "fulfilled") {
    settings = settingsResult.value;
  } else {
    console.error("Failed to load timezone setting for history", settingsResult.reason);
    historyWarning = historyWarning ?? dictionary.history.warnings.settings;
  }

  return (
    <div className="flex flex-1 flex-col gap-5 sm:gap-6">
      {historyWarning ? (
        <Card className="border-amber-200 bg-amber-50/90 dark:border-amber-400/30 dark:bg-amber-500/10">
          <CardContent className="space-y-2 p-5 text-sm leading-6 text-amber-900 dark:text-amber-100">
            <p>{historyWarning}</p>
          </CardContent>
        </Card>
      ) : null}

      <HistoryView
        copy={dictionary.history}
        initialModeFilter={initialModeFilter}
        initialPeriodFilter={initialPeriodFilter}
        initialSelectedDate={initialSelectedDate}
        initialSessions={sessions}
        initialTagQuery={initialTagQuery}
        locale={locale}
        modeCopy={dictionary.modes}
        nowIso={nowIso}
        timeZone={settings.timezone}
        unlabeledTag={dictionary.common.unlabeledTag}
      />
    </div>
  );
}
