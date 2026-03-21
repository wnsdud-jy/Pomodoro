import {
  CalendarDays,
  CalendarRange,
  Clock3,
  Sparkles,
  Tags,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationLabel } from "@/lib/format";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale } from "@/lib/preferences";
import type { FocusStreakSummary, HistorySummaryStats } from "@/types/session";

function SummaryCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <Card className="border-white/60 bg-white/75 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader className="space-y-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
          {icon}
        </div>
        <div className="space-y-1">
          <CardDescription className="uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {label}
          </CardDescription>
          <CardTitle className="text-3xl tracking-tight">{value}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-slate-500 dark:text-slate-400">
        {caption}
      </CardContent>
    </Card>
  );
}

export function HistoryOverview({
  stats,
  streak,
  locale,
  copy,
}: {
  stats: HistorySummaryStats;
  streak: FocusStreakSummary;
  locale: AppLocale;
  copy: AppDictionary["history"]["overview"];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          {copy.title}
        </h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {copy.subtitle}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          caption={copy.focusCountTemplate.replace(
            "{count}",
            String(stats.today.focusCount),
          )}
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
          label={copy.todayLabel}
          value={formatDurationLabel(stats.today.focusSeconds, locale)}
        />
        <SummaryCard
          caption={copy.focusCountTemplate.replace(
            "{count}",
            String(stats.week.focusCount),
          )}
          icon={<CalendarRange aria-hidden="true" className="size-5" />}
          label={copy.weekLabel}
          value={formatDurationLabel(stats.week.focusSeconds, locale)}
        />
        <SummaryCard
          caption={copy.focusCountTemplate.replace(
            "{count}",
            String(stats.month.focusCount),
          )}
          icon={<Clock3 aria-hidden="true" className="size-5" />}
          label={copy.monthLabel}
          value={formatDurationLabel(stats.month.focusSeconds, locale)}
        />
        <SummaryCard
          caption={copy.averageCaption}
          icon={<Sparkles aria-hidden="true" className="size-5" />}
          label={copy.averageLabel}
          value={formatDurationLabel(stats.averageFocusSeconds, locale)}
        />
        <SummaryCard
          caption={
            stats.topTag
              ? formatDurationLabel(stats.topTag.totalSeconds, locale)
              : copy.topTagEmpty
          }
          icon={<Tags aria-hidden="true" className="size-5" />}
          label={copy.topTagLabel}
          value={stats.topTag?.tag ?? copy.topTagEmpty}
        />
        <SummaryCard
          caption={
            streak.todayCompleted ? copy.streakTodayDone : copy.streakTodayPending
          }
          icon={<Sparkles aria-hidden="true" className="size-5" />}
          label={copy.streakLabel}
          value={String(streak.currentStreak)}
        />
      </div>
    </section>
  );
}
