import { BarChart3, CalendarRange, Lightbulb, Orbit } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationLabel } from "@/lib/format";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale } from "@/lib/preferences";
import type {
  FocusTrendPoint,
  HistoryInsightSummary,
  TagFocusSummaryRow,
  WeekdayFocusRow,
} from "@/types/session";
import { HistoryEmptyState } from "@/app/pomodoro/history/_components/history-empty-state";
import { HistoryTrendChart } from "@/app/pomodoro/history/_components/history-trend-chart";
import { HistoryWeekdaySummary } from "@/app/pomodoro/history/_components/history-weekday-summary";

function AnalyticsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
          {icon}
        </div>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function buildInsightRows({
  copy,
  insights,
}: {
  copy: AppDictionary["history"]["analytics"];
  insights: HistoryInsightSummary;
}) {
  return [
    insights.bestDayLast7
      ? copy.bestDayLast7Template
          .replace("{label}", insights.bestDayLast7.label)
          .replace("{duration}", "{duration_7}")
      : copy.bestDayLast7Empty,
    insights.bestDayLast30
      ? copy.bestDayLast30Template
          .replace("{label}", insights.bestDayLast30.label)
          .replace("{duration}", "{duration_30}")
      : copy.bestDayLast30Empty,
    insights.busiestWeekday
      ? copy.bestWeekdayTemplate.replace("{label}", insights.busiestWeekday.label)
      : copy.bestWeekdayEmpty,
    insights.topTagLast30
      ? copy.topTagTemplate.replace("{tag}", insights.topTagLast30.tag)
      : copy.topTagEmpty,
  ];
}

export function HistoryAnalytics({
  copy,
  insightSummary,
  last30Days,
  last30DayTags,
  last7Days,
  locale,
  weekdaySummary,
}: {
  copy: AppDictionary["history"]["analytics"];
  insightSummary: HistoryInsightSummary;
  last30Days: FocusTrendPoint[];
  last30DayTags: TagFocusSummaryRow[];
  last7Days: FocusTrendPoint[];
  locale: AppLocale;
  weekdaySummary: WeekdayFocusRow[];
}) {
  const hasTrendData =
    last7Days.some((row) => row.totalSeconds > 0) ||
    last30Days.some((row) => row.totalSeconds > 0);
  const insightRows = buildInsightRows({
    copy,
    insights: insightSummary,
  }).map((row) =>
    row
      .replace(
        "{duration_7}",
        insightSummary.bestDayLast7
          ? formatDurationLabel(insightSummary.bestDayLast7.totalSeconds, locale)
          : "",
      )
      .replace(
        "{duration_30}",
        insightSummary.bestDayLast30
          ? formatDurationLabel(insightSummary.bestDayLast30.totalSeconds, locale)
          : "",
      ),
  );

  return (
    <section className="grid gap-5 sm:gap-6 xl:grid-cols-2">
      <AnalyticsCard
        description={copy.last7Description}
        icon={<BarChart3 aria-hidden="true" className="size-5" />}
        title={copy.last7Title}
      >
        {hasTrendData ? (
          <HistoryTrendChart locale={locale} points={last7Days} />
        ) : (
          <HistoryEmptyState
            description={copy.emptyDescription}
            title={copy.emptyTitle}
          />
        )}
      </AnalyticsCard>

      <AnalyticsCard
        description={copy.last30Description}
        icon={<CalendarRange aria-hidden="true" className="size-5" />}
        title={copy.last30Title}
      >
        {hasTrendData ? (
          <HistoryTrendChart locale={locale} points={last30Days} />
        ) : (
          <HistoryEmptyState
            description={copy.emptyDescription}
            title={copy.emptyTitle}
          />
        )}
      </AnalyticsCard>

      <AnalyticsCard
        description={copy.weekdayDescription}
        icon={<Orbit aria-hidden="true" className="size-5" />}
        title={copy.weekdayTitle}
      >
        <HistoryWeekdaySummary locale={locale} rows={weekdaySummary} />
      </AnalyticsCard>

      <AnalyticsCard
        description={copy.insightDescription}
        icon={<Lightbulb aria-hidden="true" className="size-5" />}
        title={copy.insightTitle}
      >
        <div className="space-y-3">
          {insightRows.map((row) => (
            <div
              className="rounded-[20px] border border-slate-200/70 bg-white/60 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200"
              key={row}
            >
              {row}
            </div>
          ))}
          {last30DayTags.length === 0 ? (
            <HistoryEmptyState
              className="p-4"
              description={copy.tagFallbackDescription}
              title={copy.tagFallbackTitle}
            />
          ) : null}
        </div>
      </AnalyticsCard>
    </section>
  );
}
