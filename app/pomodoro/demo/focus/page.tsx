import type { Metadata } from "next";
import { ArrowLeft, BellRing, Play, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatSeconds } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/messages";
import { MODE_ORDER } from "@/lib/pomodoro";
import { getRequestPreferences } from "@/lib/preferences/server";

export const metadata: Metadata = {
  title: "Demo Focus Mode",
};

export default async function DemoFocusPage() {
  const { locale } = await getRequestPreferences();
  const dictionary = getDictionary(locale);
  const copy = dictionary.dashboard.timer;
  const modeCopy = dictionary.modes;
  const selectedMode = "focus";
  const nextMode = "short_break";
  const focusCycleText =
    locale === "ko" ? "1/4번째 집중" : "Focus cycle 1/4";
  const demoTag = locale === "ko" ? "수학" : "Math";

  return (
    <section
      aria-labelledby="demo-focus-mode-title"
      className="fixed inset-0 z-[80] overflow-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:px-6"
    >
      <div className="absolute inset-0 bg-[rgba(3,8,21,0.94)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_34%),radial-gradient(circle_at_bottom,rgba(45,212,191,0.12),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 opacity-30 blur-3xl transition-opacity duration-500" />

      <div className="relative mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_1fr_auto] gap-4 md:gap-6">
        <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <Button asChild size="sm" variant="secondary">
            <Link href="/pomodoro/demo">
              <ArrowLeft aria-hidden="true" className="size-4" />
              {copy.backToDashboard}
            </Link>
          </Button>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <Badge className="bg-white/10 text-white hover:bg-white/10">
              {modeCopy[selectedMode].shortLabel}
            </Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10" variant="outline">
              {focusCycleText}
            </Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10" variant="outline">
              {copy.nextSessionLabel}: {modeCopy[nextMode].label}
            </Badge>
            <Badge className="border-cyan-300/25 bg-cyan-400/12 text-cyan-50 hover:bg-cyan-400/12" variant="outline">
              Demo Preview
            </Badge>
          </div>
        </header>

        <div className="flex min-h-0 flex-col items-center justify-center gap-4 text-center md:gap-5">
          <h1 className="sr-only" id="demo-focus-mode-title">
            {copy.focusScreenTitle}
          </h1>
          <p className="sr-only">{copy.focusScreenDescription}</p>
          <p className="sr-only">{copy.focusScreenHint}</p>

          <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur">
            {copy.status.idle}
          </div>

          <p className="max-w-3xl text-balance text-lg leading-7 text-slate-300 md:text-xl">
            {locale === "ko"
              ? "실제 저장이나 자동 전환 없이, 전체보기 집중 화면 UI만 체험하는 데모입니다."
              : "A static preview of the focus full-view screen without real saving or automatic transitions."}
          </p>

          <p className="font-mono text-[clamp(5rem,18vw,9rem)] font-semibold tracking-[-0.08em] text-white tabular-nums">
            {formatSeconds(1500)}
          </p>
        </div>

        <div className="mx-auto w-full max-w-5xl rounded-[30px] border border-white/10 bg-white/6 p-4 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.95)] backdrop-blur-xl md:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] xl:items-center">
            <div className="min-w-0 space-y-3">
              <Tabs value={selectedMode}>
                <TabsList className="grid grid-cols-1 gap-2 bg-white/8 p-1.5 sm:grid-cols-3">
                  {MODE_ORDER.map((mode) => (
                    <TabsTrigger
                      className="min-h-11 border-0 data-[state=active]:bg-white/14 data-[state=active]:text-white"
                      key={mode}
                      value={mode}
                    >
                      {modeCopy[mode].label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/10 text-white hover:bg-white/10" variant="outline">
                  {copy.autoAdvanceOn}
                </Badge>
                <Badge className="bg-white/10 text-white hover:bg-white/10" variant="outline">
                  {copy.autoStartOff}
                </Badge>
              </div>
            </div>

            <div className="min-w-0 space-y-2">
              <Label className="text-sm text-slate-200" htmlFor="demo-focus-session-tag">
                {copy.tagLabel}
              </Label>
              <Input
                autoComplete="off"
                className="border-white/10 bg-slate-950/55 text-white placeholder:text-slate-500"
                id="demo-focus-session-tag"
                name="tag"
                readOnly
                value={demoTag}
              />
            </div>

            <div className="flex flex-col gap-3 xl:items-center">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="w-full sm:w-auto" size="lg" type="button">
                  <Play aria-hidden="true" className="size-4" />
                  {copy.start}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  size="lg"
                  type="button"
                  variant="secondary"
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  {copy.reset}
                </Button>
              </div>
            </div>

            <div
              aria-live="polite"
              className="rounded-[24px] border border-white/10 bg-white/4 px-4 py-3 text-left text-sm leading-6 text-slate-300 transition-colors xl:col-span-3"
            >
              <div className="flex items-start gap-3">
                <BellRing aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0 space-y-1">
                  <p>{copy.idleMessage}</p>
                  <p>
                    {locale === "ko"
                      ? "데모 전체보기는 UI만 보여 주며, 복귀 시 데모 대시보드로 돌아갑니다."
                      : "Demo full view is UI-only and returns to the demo dashboard."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
