import type { Metadata } from "next";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Clock3,
  History,
  Layers3,
  Lightbulb,
  Orbit,
  Search,
  Sparkles,
  Tags,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { PreferencesToolbar } from "@/app/pomodoro/_components/preferences-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, formatDurationLabel } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";

export const metadata: Metadata = {
  title: "Demo History",
};

const MODE_BADGE_CLASS_NAMES = {
  focus: "bg-teal-700 text-white",
  short_break:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  long_break:
    "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200",
} as const;

const DEMO_HISTORY_SESSIONS = [
  {
    id: "demo-history-1",
    dateKey: "2026-03-19",
    mode: "focus",
    tagKo: "수학",
    tagEn: "Math",
    durationSeconds: 1500,
    startedAt: "2026-03-19T08:00:00+09:00",
    endedAt: "2026-03-19T08:25:00+09:00",
  },
  {
    id: "demo-history-2",
    dateKey: "2026-03-19",
    mode: "focus",
    tagKo: "코딩",
    tagEn: "Coding",
    durationSeconds: 1500,
    startedAt: "2026-03-19T09:00:00+09:00",
    endedAt: "2026-03-19T09:25:00+09:00",
  },
  {
    id: "demo-history-3",
    dateKey: "2026-03-18",
    mode: "short_break",
    tagKo: "",
    tagEn: "",
    durationSeconds: 300,
    startedAt: "2026-03-18T21:25:00+09:00",
    endedAt: "2026-03-18T21:30:00+09:00",
  },
  {
    id: "demo-history-4",
    dateKey: "2026-03-18",
    mode: "long_break",
    tagKo: "",
    tagEn: "",
    durationSeconds: 900,
    startedAt: "2026-03-18T22:40:00+09:00",
    endedAt: "2026-03-18T22:55:00+09:00",
  },
] as const;

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

function SessionField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <div>{value}</div>
    </div>
  );
}

function TrendBars({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const maxValue = Math.max(...values);

  return (
    <div className="space-y-3">
      {labels.map((label, index) => (
        <div className="space-y-1.5" key={label}>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span>{label}</span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {values[index]}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
              style={{ width: `${(values[index] / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DemoHistoryPage() {
  const { locale, theme } = await getRequestPreferences();
  const dictionary = getDictionary(locale);
  const historyCopy = dictionary.history;
  const labels7 =
    locale === "ko"
      ? ["3/13", "3/14", "3/15", "3/16", "3/17", "3/18", "3/19"]
      : ["Mar 13", "Mar 14", "Mar 15", "Mar 16", "Mar 17", "Mar 18", "Mar 19"];
  const labels30 =
    locale === "ko"
      ? ["1주차", "2주차", "3주차", "4주차"]
      : ["Week 1", "Week 2", "Week 3", "Week 4"];
  const weekdayLabels =
    locale === "ko"
      ? ["월", "화", "수", "목", "금", "토", "일"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const tagRows = [
    {
      tag: locale === "ko" ? "수학" : "Math",
      totalSeconds: 45000,
      sessionCount: 18,
    },
    {
      tag: locale === "ko" ? "코딩" : "Coding",
      totalSeconds: 33600,
      sessionCount: 12,
    },
    {
      tag: locale === "ko" ? "영어" : "English",
      totalSeconds: 22200,
      sessionCount: 8,
    },
  ];
  const groupedSessions = [
    {
      dateLabel: locale === "ko" ? "3월 19일 수요일" : "Wednesday, March 19",
      focusSeconds: 3000,
      sessionCount: 2,
      sessions: DEMO_HISTORY_SESSIONS.filter((session) => session.dateKey === "2026-03-19"),
    },
    {
      dateLabel: locale === "ko" ? "3월 18일 화요일" : "Tuesday, March 18",
      focusSeconds: 0,
      sessionCount: 2,
      sessions: DEMO_HISTORY_SESSIONS.filter((session) => session.dateKey === "2026-03-18"),
    },
  ];

  return (
    <main
      className="relative isolate min-h-screen overflow-x-hidden px-4 pb-4 md:px-6 md:pb-6"
      id="main-content"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-6">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200/80 bg-white/82 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(6,14,30,0.74)] dark:shadow-[0_20px_80px_-40px_rgba(37,99,235,0.42)]">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-400/20 dark:text-cyan-300 dark:ring-cyan-400/15">
                <History aria-hidden="true" className="size-5" />
              </div>

              <p className="truncate text-base font-semibold text-slate-900 md:text-lg dark:text-white">
                {dictionary.common.appName}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <PreferencesToolbar
                copy={dictionary.common}
                initialLocale={locale}
                initialTheme={theme}
                key={`${locale}-${theme}-demo-history-toolbar`}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-6">
            <Card className="border-cyan-200/80 bg-cyan-50/85 dark:border-cyan-400/20 dark:bg-cyan-500/10">
              <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit bg-cyan-600 text-white hover:bg-cyan-600">
                    Demo Preview
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {locale === "ko"
                        ? "기록 페이지 구조와 분석 UI를 데모 데이터로 보여 주는 화면입니다."
                        : "This screen previews the history layout and analytics UI with demo data."}
                    </p>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {locale === "ko"
                        ? "필터, CSV 내보내기, 삭제 버튼은 실제로 동작하지 않습니다."
                        : "Filters, CSV export, and delete buttons are visual only."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/pomodoro/demo">{dictionary.common.dashboardNav}</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/pomodoro/demo/history">{dictionary.common.historyNav}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/pomodoro/demo/settings">{dictionary.common.settingsNav}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                  {historyCopy.overview.title}
                </h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {historyCopy.overview.subtitle}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SummaryCard
                  caption={historyCopy.overview.focusCountTemplate.replace("{count}", "6")}
                  icon={<CalendarDays aria-hidden="true" className="size-5" />}
                  label={historyCopy.overview.todayLabel}
                  value={locale === "ko" ? "2시간 30분" : "2h 30m"}
                />
                <SummaryCard
                  caption={historyCopy.overview.focusCountTemplate.replace("{count}", "28")}
                  icon={<CalendarRange aria-hidden="true" className="size-5" />}
                  label={historyCopy.overview.weekLabel}
                  value={locale === "ko" ? "11시간 40분" : "11h 40m"}
                />
                <SummaryCard
                  caption={historyCopy.overview.focusCountTemplate.replace("{count}", "81")}
                  icon={<Clock3 aria-hidden="true" className="size-5" />}
                  label={historyCopy.overview.monthLabel}
                  value={locale === "ko" ? "34시간 20분" : "34h 20m"}
                />
                <SummaryCard
                  caption={historyCopy.overview.averageCaption}
                  icon={<Sparkles aria-hidden="true" className="size-5" />}
                  label={historyCopy.overview.averageLabel}
                  value={locale === "ko" ? "25분" : "25m"}
                />
                <SummaryCard
                  caption={locale === "ko" ? "12시간 30분" : "12h 30m"}
                  icon={<Tags aria-hidden="true" className="size-5" />}
                  label={historyCopy.overview.topTagLabel}
                  value={locale === "ko" ? "수학" : "Math"}
                />
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <AnalyticsCard
                description={historyCopy.analytics.last7Description}
                icon={<BarChart3 aria-hidden="true" className="size-5" />}
                title={historyCopy.analytics.last7Title}
              >
                <TrendBars labels={labels7} values={[1, 3, 0, 2, 4, 3, 5]} />
              </AnalyticsCard>

              <AnalyticsCard
                description={historyCopy.analytics.last30Description}
                icon={<CalendarRange aria-hidden="true" className="size-5" />}
                title={historyCopy.analytics.last30Title}
              >
                <TrendBars labels={labels30} values={[12, 18, 15, 21]} />
              </AnalyticsCard>

              <AnalyticsCard
                description={historyCopy.analytics.weekdayDescription}
                icon={<Orbit aria-hidden="true" className="size-5" />}
                title={historyCopy.analytics.weekdayTitle}
              >
                <TrendBars labels={weekdayLabels} values={[2, 4, 3, 5, 4, 1, 0]} />
              </AnalyticsCard>

              <AnalyticsCard
                description={historyCopy.analytics.insightDescription}
                icon={<Lightbulb aria-hidden="true" className="size-5" />}
                title={historyCopy.analytics.insightTitle}
              >
                <div className="space-y-3">
                  <div className="rounded-[20px] border border-slate-200/70 bg-white/60 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                    {locale === "ko"
                      ? "최근 7일 중 가장 많이 집중한 날은 3월 19일이고, 총 2시간 30분입니다."
                      : "Your strongest focus day in the last 7 days was March 19 with 2h 30m."}
                  </div>
                  <div className="rounded-[20px] border border-slate-200/70 bg-white/60 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                    {locale === "ko"
                      ? "최근 30일 중 가장 많이 집중한 날은 3월 19일이고, 총 3시간 10분입니다."
                      : "Your strongest focus day in the last 30 days was March 19 with 3h 10m."}
                  </div>
                  <div className="rounded-[20px] border border-slate-200/70 bg-white/60 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                    {locale === "ko"
                      ? "가장 집중이 잘 되는 요일은 목요일입니다."
                      : "Thursday is your strongest focus weekday."}
                  </div>
                  <div className="rounded-[20px] border border-slate-200/70 bg-white/60 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                    {locale === "ko"
                      ? "최근 30일 기준 가장 많이 기록한 태그는 수학입니다."
                      : "Math is the most frequent tag across the last 30 days."}
                  </div>
                </div>
              </AnalyticsCard>
            </section>

            <Card className="border-white/60 bg-white/75 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader className="space-y-3">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
                  <Tags aria-hidden="true" className="size-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle>{historyCopy.tagSummary.title}</CardTitle>
                  <CardDescription>{historyCopy.tagSummary.subtitle}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tagRows.map((row, index, rows) => {
                  const highestDuration = rows[0].totalSeconds;
                  const barWidth = `${Math.max(12, (row.totalSeconds / highestDuration) * 100)}%`;

                  return (
                    <div
                      className="space-y-2 rounded-[22px] border border-white/60 bg-white/65 p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-950/45"
                      key={row.tag}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                            {historyCopy.tagSummary.rankTemplate.replace(
                              "{rank}",
                              String(index + 1),
                            )}
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {row.tag}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {historyCopy.tagSummary.sessionsTemplate.replace(
                              "{count}",
                              String(row.sessionCount),
                            )}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {formatDurationLabel(row.totalSeconds, locale)}
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                          style={{ width: barWidth }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-white/60 bg-white/75 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader className="space-y-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle>{historyCopy.filters.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="gap-2" variant="secondary">
                      <Layers3 aria-hidden="true" className="size-4" />
                      {historyCopy.filters.resultsTemplate.replace(
                        "{count}",
                        String(DEMO_HISTORY_SESSIONS.length),
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>{historyCopy.filters.all}</Label>
                  <Tabs value="all">
                    <TabsList className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <TabsTrigger value="all">{historyCopy.filters.all}</TabsTrigger>
                      <TabsTrigger value="focus">{dictionary.modes.focus.label}</TabsTrigger>
                      <TabsTrigger value="short_break">
                        {dictionary.modes.short_break.label}
                      </TabsTrigger>
                      <TabsTrigger value="long_break">
                        {dictionary.modes.long_break.label}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label>{historyCopy.filters.periodLabel}</Label>
                  <Tabs value="last_7_days">
                    <TabsList className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <TabsTrigger value="all">{historyCopy.filters.periodAll}</TabsTrigger>
                      <TabsTrigger value="today">{historyCopy.filters.periodToday}</TabsTrigger>
                      <TabsTrigger value="last_7_days">
                        {historyCopy.filters.periodLast7Days}
                      </TabsTrigger>
                      <TabsTrigger value="last_30_days">
                        {historyCopy.filters.periodLast30Days}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="demo-history-tag">{historyCopy.filters.tagLabel}</Label>
                    <div className="relative">
                      <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        autoComplete="off"
                        className="pl-10"
                        id="demo-history-tag"
                        name="tag"
                        readOnly
                        value={locale === "ko" ? "수" : "ma"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo-history-date">{historyCopy.filters.dateLabel}</Label>
                    <div className="relative">
                      <CalendarDays
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        className="pl-10"
                        id="demo-history-date"
                        name="date"
                        readOnly
                        value="2026-03-19"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {historyCopy.filters.dateDescription}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button disabled size="sm" type="button" variant="secondary">
                    <CalendarRange aria-hidden="true" className="size-4" />
                    {historyCopy.filters.clear}
                  </Button>
                  <Button disabled size="sm" type="button" variant="outline">
                    {historyCopy.filters.export}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>{historyCopy.list.title}</CardTitle>
                <CardDescription>{historyCopy.list.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {groupedSessions.map((group) => (
                  <section className="space-y-4" key={group.dateLabel}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                          {group.dateLabel}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {historyCopy.list.daySummaryTemplate
                            .replace(
                              "{focus}",
                              formatDurationLabel(group.focusSeconds, locale),
                            )
                            .replace("{count}", String(group.sessionCount))}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.sessions.map((session) => (
                        <div
                          className="rounded-[24px] border border-slate-200/80 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/45"
                          key={session.id}
                        >
                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[140px_minmax(0,1fr)_120px_160px_160px_auto] xl:items-start">
                            <SessionField
                              label={historyCopy.list.modeLabel}
                              value={
                                <Badge className={MODE_BADGE_CLASS_NAMES[session.mode]}>
                                  {dictionary.modes[session.mode].label}
                                </Badge>
                              }
                            />
                            <SessionField
                              label={historyCopy.list.tagLabel}
                              value={
                                <p className="break-words text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {(locale === "ko" ? session.tagKo : session.tagEn) ||
                                    dictionary.common.unlabeledTag}
                                </p>
                              }
                            />
                            <SessionField
                              label={historyCopy.list.durationLabel}
                              value={
                                <p className="text-sm text-slate-700 dark:text-slate-200">
                                  {formatDurationLabel(session.durationSeconds, locale)}
                                </p>
                              }
                            />
                            <SessionField
                              label={historyCopy.list.startedAtLabel}
                              value={
                                <p className="text-sm text-slate-700 dark:text-slate-200">
                                  {formatDateTime(session.startedAt, "Asia/Seoul", locale)}
                                </p>
                              }
                            />
                            <SessionField
                              label={historyCopy.list.endedAtLabel}
                              value={
                                <p className="text-sm text-slate-700 dark:text-slate-200">
                                  {formatDateTime(session.endedAt, "Asia/Seoul", locale)}
                                </p>
                              }
                            />
                            <div className="flex justify-end xl:justify-start">
                              <Button
                                className="w-full text-rose-600 hover:text-rose-700 sm:w-auto dark:text-rose-200 dark:hover:text-rose-100"
                                disabled
                                type="button"
                                variant="ghost"
                              >
                                <Trash2 aria-hidden="true" className="size-4" />
                                {historyCopy.list.delete}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
