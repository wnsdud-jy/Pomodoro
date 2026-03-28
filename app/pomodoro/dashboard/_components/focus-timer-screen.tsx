"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CompletionAlertModal } from "@/app/pomodoro/dashboard/_components/completion-alert-modal";
import { useDashboardTimer } from "@/app/pomodoro/dashboard/_components/dashboard-timer-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exitBrowserFullscreen, isBrowserFullscreenActive } from "@/lib/browser/fullscreen";
import { formatSeconds } from "@/lib/format";
import { MODE_ORDER } from "@/lib/pomodoro";
import { cn } from "@/lib/utils";

export function FocusTimerScreen() {
  const router = useRouter();
  const {
    completionDetail,
    completionAlertOpen,
    completionAlertDetail,
    completionAlertTone,
    completionNextMessage,
    completionPrimaryActionLabel,
    completionSecondaryActionLabel,
    completionState,
    completionStreakMessage,
    completionSummaryMessage,
    completionTitle,
    copy,
    dashboardHref,
    focusCycleText,
    handleModeChange,
    handlePause,
    handleStart,
    highlightComplete,
    isTagLocked,
    modeConfig,
    modeCopy,
    nextMode,
    pendingRecovery,
    remainingSeconds,
    resetTimer,
    dismissPendingRecovery,
    dismissCompletionAlert,
    resumePendingRecovery,
    saveStatusMessage,
    selectedMode,
    startNextSessionFromAlert,
    setTagValue,
    settings,
    status,
    statusLabel,
    tag,
  } = useDashboardTimer();
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const currentTimeText = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(currentTime);
  }, [currentTime]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (completionAlertOpen) {
        return;
      }

      event.preventDefault();
      router.push(dashboardHref);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("keydown", handleKeyDown);

      if (isBrowserFullscreenActive()) {
        void exitBrowserFullscreen();
      }
    };
  }, [completionAlertOpen, dashboardHref, router]);

  return (
    <section
      aria-labelledby="focus-mode-title"
      className="fixed inset-0 z-[80] overflow-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:px-6"
    >
      <div className="absolute inset-0 bg-[rgba(3,8,21,0.94)]" />
      <CompletionAlertModal
        detail={completionNextMessage ?? completionAlertDetail}
        onPrimaryAction={startNextSessionFromAlert}
        onSecondaryAction={dismissCompletionAlert}
        open={completionAlertOpen && Boolean(completionState && completionSummaryMessage)}
        primaryLabel={completionPrimaryActionLabel}
        saveStatusMessage={null}
        summary={completionSummaryMessage ?? ""}
        secondaryLabel={completionSecondaryActionLabel}
        streakMessage={completionStreakMessage}
        title={completionTitle}
        tone={completionAlertTone}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_34%),radial-gradient(circle_at_bottom,rgba(45,212,191,0.12),transparent_38%)]" />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-30 blur-3xl transition-opacity duration-500",
          modeConfig.accentClassName,
          highlightComplete && "opacity-45",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          completionState ? "opacity-100" : "opacity-0",
          highlightComplete && "animate-focus-completion",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_45%)]" />
      </div>

      <div className="relative mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_1fr_auto] gap-4 md:gap-6">
        <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <Button asChild size="sm" variant="secondary">
            <Link href={dashboardHref}>
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
          </div>
        </header>

        <div className="flex min-h-0 flex-col items-center justify-center gap-4 text-center md:gap-5">
          <h1 className="sr-only" id="focus-mode-title">
            {copy.focusScreenTitle}
          </h1>
          <p className="sr-only">{copy.focusScreenDescription}</p>
          <p className="sr-only">{copy.focusScreenHint}</p>

          <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur">
            {statusLabel}
          </div>

          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 font-mono text-sm text-slate-200 tabular-nums backdrop-blur">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              {copy.currentTimeLabel}
            </span>
            <span>{currentTimeText}</span>
          </div>

          <p className="max-w-3xl text-balance text-lg leading-7 text-slate-300 md:text-xl">
            {modeCopy[selectedMode].description}
          </p>

          {pendingRecovery ? (
            <div className="max-w-2xl rounded-[24px] border border-amber-300/25 bg-amber-400/10 px-4 py-4 text-left text-sm leading-6 text-amber-50">
              <p className="font-semibold">{copy.recoveryTitle}</p>
              <p className="mt-1">
                {copy.recoveryDescriptionTemplate
                  .replace("{mode}", modeCopy[pendingRecovery.mode].label)
                  .replace("{status}", copy.status[pendingRecovery.status])
                  .replace("{remaining}", formatSeconds(pendingRecovery.remainingSeconds))}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={resumePendingRecovery} size="sm" type="button">
                  {copy.recoveryResume}
                </Button>
                <Button onClick={dismissPendingRecovery} size="sm" type="button" variant="secondary">
                  {copy.recoveryDismiss}
                </Button>
              </div>
            </div>
          ) : null}

          <p className="font-mono text-[clamp(5rem,18vw,9rem)] font-semibold tracking-[-0.08em] text-white tabular-nums">
            {formatSeconds(remainingSeconds)}
          </p>
        </div>

        <div className="mx-auto w-full max-w-5xl rounded-[30px] border border-white/10 bg-white/6 p-4 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.95)] backdrop-blur-xl md:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] xl:items-center">
            <div className="min-w-0 space-y-3">
              <Tabs onValueChange={handleModeChange} value={selectedMode}>
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
                  {settings.auto_advance ? copy.autoAdvanceOn : copy.autoAdvanceOff}
                </Badge>
                <Badge className="bg-white/10 text-white hover:bg-white/10" variant="outline">
                  {settings.auto_start_next ? copy.autoStartOn : copy.autoStartOff}
                </Badge>
              </div>
            </div>

            <div className="min-w-0 space-y-2">
              <Label className="text-sm text-slate-200" htmlFor="focus-session-tag">
                {copy.tagLabel}
              </Label>
              <Input
                autoComplete="off"
                className="border-white/10 bg-slate-950/55 text-white placeholder:text-slate-500"
                disabled={isTagLocked}
                id="focus-session-tag"
                maxLength={40}
                name="tag"
                onChange={(event) => setTagValue(event.target.value)}
                placeholder={copy.tagPlaceholder}
                value={tag}
              />
            </div>

            <div className="flex flex-col gap-3 xl:items-center">
              <div className="flex flex-col gap-3 sm:flex-row">
                {status === "running" ? (
                  <Button className="w-full sm:w-auto" onClick={handlePause} size="lg" type="button">
                    <Pause aria-hidden="true" className="size-4" />
                    {copy.pause}
                  </Button>
                ) : (
                  <Button className="w-full sm:w-auto" onClick={handleStart} size="lg" type="button">
                    <Play aria-hidden="true" className="size-4" />
                    {copy.start}
                  </Button>
                )}
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => resetTimer()}
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
              className={cn(
                "rounded-[24px] border px-4 py-3 text-left text-sm leading-6 transition-colors xl:col-span-3",
                completionState
                  ? "border-emerald-300/30 bg-emerald-500/12 text-emerald-50 shadow-[0_24px_80px_-48px_rgba(16,185,129,0.8)]"
                  : "border-white/10 bg-white/4 text-slate-300",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 pt-0.5">
                  {completionState ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                      <Sparkles aria-hidden="true" className="size-3.5" />
                      {copy.completionBadge}
                    </div>
                  ) : null}
                </div>
                <div className="min-w-0 space-y-1">
                  {completionState ? (
                    <>
                      <p>{completionSummaryMessage}</p>
                      <p>{completionDetail}</p>
                      {saveStatusMessage ? <p>{saveStatusMessage}</p> : null}
                    </>
                  ) : (
                    <p>{copy.idleMessage}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
