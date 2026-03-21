import type { Metadata } from "next";
import { Bell, RotateCcw, Save, Sparkles } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestPreferences } from "@/lib/preferences/server";

export const metadata: Metadata = {
  title: "Demo Settings",
};

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
}

function StaticSwitchRow({
  checked,
  description,
  label,
}: {
  checked: boolean;
  description: string;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[24px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{label}</p>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
      <Switch checked={checked} disabled />
    </div>
  );
}

export default async function DemoSettingsPage() {
  const { locale, theme } = await getRequestPreferences();
  const dictionary = getDictionary(locale);
  const copy = dictionary.settingsPage.form;

  return (
    <main
      className="relative isolate min-h-screen overflow-x-hidden px-3 pb-5 sm:px-4 md:px-6 md:pb-6"
      id="main-content"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 md:px-6"
        style={{
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        <div className="mx-auto max-w-7xl rounded-[24px] border border-slate-200/80 bg-white/82 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:rounded-[28px] dark:border-white/10 dark:bg-[rgba(6,14,30,0.74)] dark:shadow-[0_20px_80px_-40px_rgba(37,99,235,0.42)]">
          <div className="flex min-h-14 items-center justify-between gap-2 px-3 sm:min-h-16 sm:gap-3 sm:px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-400/20 sm:size-10 dark:text-cyan-300 dark:ring-cyan-400/15">
                <Sparkles aria-hidden="true" className="size-4 sm:size-5" />
              </div>

              <p className="truncate text-sm font-semibold text-slate-900 sm:text-base md:text-lg dark:text-white">
                {dictionary.common.appName}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <PreferencesToolbar
                copy={dictionary.common}
                initialLocale={locale}
                initialTheme={theme}
                key={`${locale}-${theme}-demo-settings-toolbar`}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl pt-20 sm:pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-5 pb-32 sm:gap-6 sm:pb-28">
            <Card className="border-cyan-200/80 bg-cyan-50/85 dark:border-cyan-400/20 dark:bg-cyan-500/10">
              <CardContent className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit bg-cyan-600 text-white hover:bg-cyan-600">
                    Demo Preview
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {locale === "ko"
                        ? "설정 페이지 구조를 그대로 보여 주는 데모 화면입니다."
                        : "This is a static preview of the settings page layout."}
                    </p>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {locale === "ko"
                        ? "입력값, 스위치, 저장 버튼은 실제로 동작하지 않으며 화면만 확인할 수 있습니다."
                        : "Inputs, switches, and save actions are disabled so you can inspect the UI only."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button asChild className="w-full sm:w-auto" size="sm" variant="outline">
                    <Link href="/pomodoro/demo">{dictionary.common.dashboardNav}</Link>
                  </Button>
                  <Button asChild className="w-full sm:w-auto" size="sm" variant="outline">
                    <Link href="/pomodoro/demo/history">{dictionary.common.historyNav}</Link>
                  </Button>
                  <Button asChild className="w-full sm:w-auto" size="sm" variant="secondary">
                    <Link href="/pomodoro/demo/settings">{dictionary.common.settingsNav}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
                  <Sparkles aria-hidden="true" className="size-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle>{copy.summaryTitle}</CardTitle>
                  <CardDescription>{copy.summaryDescription}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryTile
                  label={copy.summaryDurationsLabel}
                  value={
                    locale === "ko"
                      ? "집중 25 / 짧은 휴식 5 / 긴 휴식 15"
                      : "Focus 25 / Short 5 / Long 15"
                  }
                />
                <SummaryTile
                  label={copy.summaryCadenceLabel}
                  value={
                    locale === "ko"
                      ? "집중 4회마다 긴 휴식"
                      : "Long break every 4 focus sessions"
                  }
                />
                <SummaryTile
                  label={copy.summaryAutomationLabel}
                  value={locale === "ko" ? "자동 전환만 사용" : "Auto switch only"}
                />
                <SummaryTile
                  label={copy.summaryAlertsLabel}
                  value={
                    locale === "ko"
                      ? "알림 또는 소리 사용 중"
                      : "Sound or browser alerts enabled"
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <CardTitle>{copy.durationsTitle}</CardTitle>
                <CardDescription>{copy.durationsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="demo-focus-minutes">{copy.focusMinutesLabel}</Label>
                  <Input
                    autoComplete="off"
                    id="demo-focus-minutes"
                    inputMode="numeric"
                    name="focus_minutes"
                    readOnly
                    type="number"
                    value="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-short-break-minutes">{copy.shortBreakMinutesLabel}</Label>
                  <Input
                    autoComplete="off"
                    id="demo-short-break-minutes"
                    inputMode="numeric"
                    name="short_break_minutes"
                    readOnly
                    type="number"
                    value="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-long-break-minutes">{copy.longBreakMinutesLabel}</Label>
                  <Input
                    autoComplete="off"
                    id="demo-long-break-minutes"
                    inputMode="numeric"
                    name="long_break_minutes"
                    readOnly
                    type="number"
                    value="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-long-break-every">{copy.longBreakEveryLabel}</Label>
                  <Input
                    autoComplete="off"
                    id="demo-long-break-every"
                    inputMode="numeric"
                    name="long_break_every"
                    readOnly
                    type="number"
                    value="4"
                  />
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {copy.longBreakEveryHelp}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <CardTitle>{copy.automationTitle}</CardTitle>
                <CardDescription>{copy.automationDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StaticSwitchRow
                  checked
                  description={copy.autoAdvanceHelp}
                  label={copy.autoAdvanceLabel}
                />
                <StaticSwitchRow
                  checked={false}
                  description={copy.autoStartNextHelp}
                  label={copy.autoStartNextLabel}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <CardTitle>{copy.alertsTitle}</CardTitle>
                <CardDescription>{copy.alertsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                  <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
                      <Bell aria-hidden="true" className="size-4" />
                      {copy.notificationPermissionLabel}
                    </div>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {copy.notificationPermissionStates.default}
                    </p>
                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {copy.permissionHintDefault}
                    </p>
                  </div>
                  <Button className="w-full md:w-auto" disabled type="button" variant="secondary">
                    {copy.requestPermission}
                  </Button>
                </div>

                <StaticSwitchRow
                  checked
                  description={copy.notificationsEnabledHelp}
                  label={copy.notificationsEnabledLabel}
                />
                <StaticSwitchRow
                  checked
                  description={copy.soundEnabledHelp}
                  label={copy.soundEnabledLabel}
                />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                {locale === "ko"
                  ? "데모 설정은 저장되지 않으며, 실제 저장 흐름은 로그인 후 설정 페이지에서만 동작합니다."
                  : "Demo settings are not saved. The real save flow only works on the authenticated settings page."}
              </p>
              <div className="flex justify-end">
                <Button className="w-full sm:w-auto" disabled type="button" variant="ghost">
                  <RotateCcw aria-hidden="true" className="size-4" />
                  {copy.restoreDefaults}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:inset-x-auto sm:bottom-6 sm:right-6">
        <Button
          className="pointer-events-auto h-12 w-full rounded-full px-5 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)] sm:w-auto"
          disabled
          size="lg"
          style={{
            marginLeft: "env(safe-area-inset-left)",
            marginRight: "env(safe-area-inset-right)",
          }}
          type="button"
        >
          <Save aria-hidden="true" className="size-4" />
          {copy.save}
        </Button>
      </div>
    </main>
  );
}
