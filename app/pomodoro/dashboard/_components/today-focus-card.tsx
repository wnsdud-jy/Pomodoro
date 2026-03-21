import { Clock3, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationLabel } from "@/lib/format";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale } from "@/lib/preferences";
import type { FocusStreakSummary, TodaySessionSummary } from "@/types/session";

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-white/55 p-4 dark:border-transparent dark:bg-slate-950/45">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
}

export function TodayFocusCard({
  summary,
  streak,
  locale,
  copy,
}: {
  summary: TodaySessionSummary;
  streak: FocusStreakSummary;
  locale: AppLocale;
  copy: AppDictionary["dashboard"]["todaySummary"];
}) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Clock3 aria-hidden="true" className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricTile
            label={copy.totalFocusLabel}
            value={formatDurationLabel(summary.focusSeconds, locale)}
          />
          <MetricTile label={copy.focusCountLabel} value={String(summary.focusCount)} />
          <MetricTile
            label={copy.shortBreakCountLabel}
            value={String(summary.shortBreakCount)}
          />
          <MetricTile
            label={copy.longBreakCountLabel}
            value={String(summary.longBreakCount)}
          />
          <MetricTile label={copy.currentStreakLabel} value={String(streak.currentStreak)} />
          <MetricTile label={copy.bestStreakLabel} value={String(streak.longestStreak)} />
          <MetricTile
            label={copy.todayGoalLabel}
            value={streak.todayCompleted ? copy.todayGoalDone : copy.todayGoalPending}
          />
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 dark:border-transparent dark:bg-slate-950/45">
          <div className="flex items-center gap-2">
            <Tags aria-hidden="true" className="size-4 text-slate-500 dark:text-slate-400" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {copy.topTagsTitle}
            </p>
          </div>
          {summary.topTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.topTags.map((tag) => (
                <Badge
                  key={tag.tag}
                  className="gap-2 rounded-full px-3 py-1.5"
                  variant="outline"
                >
                  <span>{tag.tag}</span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-300">
                    {formatDurationLabel(tag.totalSeconds, locale)}
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {copy.topTagsEmpty}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
