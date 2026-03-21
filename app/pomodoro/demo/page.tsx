import type { Metadata } from "next";
import {
  ArrowRight,
  BellRing,
  Expand,
  History,
  Hourglass,
  Play,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

import { PreferencesToolbar } from "@/app/pomodoro/_components/preferences-toolbar";
import { TodayFocusCard } from "@/app/pomodoro/dashboard/_components/today-focus-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, formatDurationLabel } from "@/lib/format";
import { MODE_ORDER } from "@/lib/pomodoro";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";
import type { FocusStreakSummary, SessionRow, TodaySessionSummary } from "@/types/session";

export const metadata: Metadata = {
  title: "Demo",
};

const DEMO_SUMMARY: TodaySessionSummary = {
  focusSeconds: 9000,
  focusCount: 6,
  shortBreakCount: 5,
  longBreakCount: 1,
  topTags: [
    {
      tag: "수학",
      totalSeconds: 4500,
      sessionCount: 3,
    },
    {
      tag: "코딩",
      totalSeconds: 2700,
      sessionCount: 2,
    },
    {
      tag: "영어",
      totalSeconds: 1800,
      sessionCount: 1,
    },
  ],
};

const DEMO_STREAK: FocusStreakSummary = {
  currentStreak: 4,
  longestStreak: 9,
  todayCompleted: true,
};

const DEMO_SESSIONS: SessionRow[] = [
  {
    id: "demo-focus-1",
    mode: "focus",
    tag: "수학",
    duration_seconds: 1500,
    started_at: "2026-03-19T08:00:00+09:00",
    ended_at: "2026-03-19T08:25:00+09:00",
    completed: true,
    created_at: "2026-03-19T08:25:00+09:00",
  },
  {
    id: "demo-short-break-1",
    mode: "short_break",
    tag: null,
    duration_seconds: 300,
    started_at: "2026-03-19T08:25:00+09:00",
    ended_at: "2026-03-19T08:30:00+09:00",
    completed: true,
    created_at: "2026-03-19T08:30:00+09:00",
  },
  {
    id: "demo-focus-2",
    mode: "focus",
    tag: "코딩",
    duration_seconds: 1500,
    started_at: "2026-03-19T09:00:00+09:00",
    ended_at: "2026-03-19T09:25:00+09:00",
    completed: true,
    created_at: "2026-03-19T09:25:00+09:00",
  },
  {
    id: "demo-focus-3",
    mode: "focus",
    tag: "영어",
    duration_seconds: 1500,
    started_at: "2026-03-19T10:00:00+09:00",
    ended_at: "2026-03-19T10:25:00+09:00",
    completed: true,
    created_at: "2026-03-19T10:25:00+09:00",
  },
  {
    id: "demo-long-break-1",
    mode: "long_break",
    tag: null,
    duration_seconds: 900,
    started_at: "2026-03-19T10:25:00+09:00",
    ended_at: "2026-03-19T10:40:00+09:00",
    completed: true,
    created_at: "2026-03-19T10:40:00+09:00",
  },
];

function formatTemplate(
  template: string,
  replacements: Record<string, string | number>,
) {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function FlowStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={
        tone === "accent"
          ? "rounded-[24px] border border-teal-200/80 bg-teal-50/85 p-4 shadow-sm transition-[transform,background-color,border-color] dark:border-teal-400/20 dark:bg-teal-500/10"
          : "rounded-[24px] border border-slate-200/80 bg-white/70 p-4 shadow-sm transition-[transform,background-color,border-color] dark:border-white/10 dark:bg-slate-950/45"
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
        {value}
      </div>
    </div>
  );
}

function DemoPomodoroTimer({
  locale,
}: {
  locale: "ko" | "en";
}) {
  const dictionary = getDictionary(locale);
  const timerCopy = dictionary.dashboard.timer;
  const modeCopy = dictionary.modes;
  const selectedMode = "focus";
  const nextMode = "short_break";
  const currentFocusIndex = 1;
  const totalFocusCycles = 4;
  const tagValue = locale === "ko" ? "수학" : "Math";

  return (
    <Card className="relative isolate overflow-hidden rounded-[28px] border-slate-200/70 transition-[transform,box-shadow,border-color] dark:border-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 h-40 rounded-b-full bg-gradient-to-r from-teal-500 to-cyan-500 opacity-80 blur-3xl"
      />
      <CardHeader className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Badge>{modeCopy[selectedMode].shortLabel}</Badge>
            <CardTitle className="text-3xl text-balance md:text-4xl">
              {timerCopy.title}
            </CardTitle>
            <CardDescription>{modeCopy[selectedMode].description}</CardDescription>
          </div>
          <Button
            asChild
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
            size="sm"
            variant="secondary"
          >
            <Link aria-label={timerCopy.fullViewAria} href="/pomodoro/demo/focus">
              <Expand aria-hidden="true" className="size-4" />
              {timerCopy.fullView}
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <FlowStat
            label={timerCopy.currentModeLabel}
            tone="accent"
            value={modeCopy[selectedMode].label}
          />
          <FlowStat
            label={timerCopy.focusCycleLabel}
            value={formatTemplate(timerCopy.focusCycleTemplate, {
              current: currentFocusIndex,
              total: totalFocusCycles,
            })}
          />
          <FlowStat
            label={timerCopy.nextSessionLabel}
            value={
              <div className="flex items-center gap-2">
                <span>{modeCopy[nextMode].label}</span>
                <ArrowRight aria-hidden="true" className="size-4 text-slate-400" />
              </div>
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{timerCopy.autoAdvanceOn}</Badge>
          <Badge variant="outline">{timerCopy.autoStartOff}</Badge>
          <Badge variant="outline">
            {formatTemplate(timerCopy.focusCycleTemplate, {
              current: currentFocusIndex,
              total: totalFocusCycles,
            })}
          </Badge>
        </div>

        <Tabs value={selectedMode}>
          <TabsList className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MODE_ORDER.map((mode) => (
              <TabsTrigger
                className="min-h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                key={mode}
                value={mode}
              >
                {modeCopy[mode].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-slate-200/50 bg-slate-100/70 p-6 dark:border-white/10 dark:bg-slate-950/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {timerCopy.remainingTime}
            </p>
            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
              {timerCopy.status.idle}
            </p>
          </div>
          <p className="mt-6 text-center font-mono text-[clamp(4rem,16vw,6.5rem)] font-semibold tracking-[-0.06em] text-slate-950 tabular-nums dark:text-slate-50">
            25:00
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Button
              className="w-full sm:w-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              size="lg"
              type="button"
            >
              <Play aria-hidden="true" className="size-4" />
              {timerCopy.start}
            </Button>
            <Button
              className="w-full sm:w-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              size="lg"
              type="button"
              variant="secondary"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {timerCopy.reset}
            </Button>
          </div>
        </div>

        <div className="space-y-3 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-transparent dark:bg-slate-950/45">
          <Label htmlFor="demo-session-tag">{timerCopy.tagLabel}</Label>
          <Input
            autoComplete="off"
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
            id="demo-session-tag"
            name="tag"
            readOnly
            value={tagValue}
          />
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            {timerCopy.tagHelp}
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-[28px] border border-slate-200 bg-white/70 px-5 py-4 text-sm leading-6 text-slate-600 transition-colors dark:border-transparent dark:bg-slate-950/45 dark:text-slate-300">
          <BellRing
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-slate-400"
          />
          <div className="space-y-1">
            <p>{timerCopy.idleMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DemoRecentSessions({
  locale,
}: {
  locale: "ko" | "en";
}) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.dashboard.recentSessions;
  const modeCopy = dictionary.modes;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <History aria-hidden="true" className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {DEMO_SESSIONS.map((session, index) => (
          <div key={session.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{modeCopy[session.mode].shortLabel}</Badge>
                  <p className="break-words text-sm font-medium text-slate-800 dark:text-slate-100">
                    {session.tag || dictionary.common.unlabeledTag}
                  </p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDurationLabel(session.duration_seconds, locale)}
                </p>
              </div>
              <p className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                {formatDateTime(session.ended_at, "Asia/Seoul", locale)}
              </p>
            </div>
            {index < DEMO_SESSIONS.length - 1 ? <Separator className="mt-4" /> : null}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10">
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.viewAllHint}</p>
      </CardFooter>
    </Card>
  );
}

export default async function DemoPage() {
  const { locale, theme } = await getRequestPreferences();
  const dictionary = getDictionary(locale);

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
                <Hourglass aria-hidden="true" className="size-5" />
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
                key={`${locale}-${theme}-demo-toolbar`}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-1 flex-col gap-6">
            <Card className="border-cyan-200/80 bg-cyan-50/85 dark:border-cyan-400/20 dark:bg-cyan-500/10">
              <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit bg-cyan-600 text-white hover:bg-cyan-600">
                    Demo Preview
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {locale === "ko"
                        ? "로그인 후 보이는 화면을 정적으로 체험하는 데모입니다."
                        : "This is a static preview of the post-login experience."}
                    </p>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {locale === "ko"
                        ? "타이머, 태그, 기록 UI는 실제처럼 보이지만 저장되거나 실행되지는 않습니다. 전체보기도 데모 전용 화면으로만 이동합니다."
                        : "The timer, tag, and history UI look real, but nothing runs or saves. Full view opens a demo-only screen."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/pomodoro/demo">
                      {dictionary.common.dashboardNav}
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/pomodoro/demo/history">
                      {dictionary.common.historyNav}
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/pomodoro/demo/settings">
                      {dictionary.common.settingsNav}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="grid flex-1 gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <DemoPomodoroTimer locale={locale} />
              <div className="grid gap-6">
                <TodayFocusCard
                  copy={dictionary.dashboard.todaySummary}
                  locale={locale}
                  summary={DEMO_SUMMARY}
                  streak={DEMO_STREAK}
                />
                <DemoRecentSessions locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
