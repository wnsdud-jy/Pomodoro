"use client";

import { ArrowRight, BellRing, Expand, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { CompletionAlertModal } from "@/app/pomodoro/dashboard/_components/completion-alert-modal";
import { useDashboardTimer } from "@/app/pomodoro/dashboard/_components/dashboard-timer-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatSeconds } from "@/lib/format";
import { requestBrowserFullscreen } from "@/lib/browser/fullscreen";
import { MODE_ORDER } from "@/lib/pomodoro";
import { cn } from "@/lib/utils";

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
      className={cn(
        "rounded-[22px] border p-4 shadow-sm transition-[transform,background-color,border-color] sm:rounded-[24px]",
        tone === "accent"
          ? "border-teal-200/80 bg-teal-50/85 dark:border-teal-400/20 dark:bg-teal-500/10"
          : "border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-950/45",
      )}
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

export function PomodoroTimer() {
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
    currentFocusIndex,
    focusCycleText,
    focusHref,
    handleModeChange,
    handlePause,
    handleStart,
    highlightComplete,
    isTagLocked,
    modeConfig,
    modeCopy,
    nextMode,
    pendingRecovery,
    recentTags,
    remainingSeconds,
    resetTimer,
    resumePendingRecovery,
    dismissPendingRecovery,
    dismissCompletionAlert,
    saveStatusMessage,
    selectedMode,
    startNextSessionFromAlert,
    applySuggestedTag,
    setTagValue,
    settings,
    status,
    statusLabel,
    tag,
  } = useDashboardTimer();

  const handleOpenFullView = async () => {
    await requestBrowserFullscreen(document.documentElement);
    router.push(focusHref);
  };

  return (
    <Card
      className={cn(
        "relative isolate overflow-hidden rounded-[28px] border-slate-200/70 transition-[transform,box-shadow,border-color] dark:border-white/10",
        highlightComplete &&
          "scale-[1.01] border-emerald-300 shadow-[0_28px_100px_-42px_rgba(16,185,129,0.5)] dark:border-emerald-400/30",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-16 h-40 rounded-b-full bg-gradient-to-r opacity-80 blur-3xl",
          modeConfig.accentClassName,
        )}
        aria-hidden="true"
      />
      <CardHeader className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Badge>{modeCopy[selectedMode].shortLabel}</Badge>
            <CardTitle className="text-2xl text-balance sm:text-3xl md:text-4xl">
              {copy.title}
            </CardTitle>
            <CardDescription>{modeCopy[selectedMode].description}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {completionState ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
                <Sparkles aria-hidden="true" className="size-4" />
                {copy.completionBadge}
              </div>
            ) : null}
            <Button aria-label={copy.fullViewAria} onClick={() => void handleOpenFullView()} size="sm" type="button" variant="secondary">
                <Expand aria-hidden="true" className="size-4" />
                {copy.fullView}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <FlowStat
            label={copy.currentModeLabel}
            tone="accent"
            value={modeCopy[selectedMode].label}
          />
          <FlowStat
            label={copy.focusCycleLabel}
            value={formatTemplate(copy.focusCycleTemplate, {
              current: currentFocusIndex,
              total: settings.long_break_every,
            })}
          />
          <FlowStat
            label={copy.nextSessionLabel}
            value={
              <div className="flex items-center gap-2">
                <span>{modeCopy[nextMode].label}</span>
                <ArrowRight aria-hidden="true" className="size-4 text-slate-400" />
              </div>
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {settings.auto_advance ? copy.autoAdvanceOn : copy.autoAdvanceOff}
          </Badge>
          <Badge variant="outline">
            {settings.auto_start_next ? copy.autoStartOn : copy.autoStartOff}
          </Badge>
          <Badge variant="outline">{focusCycleText}</Badge>
        </div>

        {pendingRecovery ? (
          <div className="rounded-[22px] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 sm:rounded-[24px] dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
            <p className="font-semibold">{copy.recoveryTitle}</p>
            <p className="mt-1 leading-6">
              {formatTemplate(copy.recoveryDescriptionTemplate, {
                mode: modeCopy[pendingRecovery.mode].label,
                status: copy.status[pendingRecovery.status],
                remaining: formatSeconds(pendingRecovery.remainingSeconds),
              })}
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

        <Tabs onValueChange={handleModeChange} value={selectedMode}>
          <div className="overflow-x-auto pb-1">
            <TabsList className="flex min-w-max gap-2 rounded-[20px] p-1.5 sm:grid sm:min-w-0 sm:grid-cols-3 sm:gap-2">
            {MODE_ORDER.map((mode) => (
              <TabsTrigger
                className="min-h-11 min-w-[132px] px-4 sm:min-w-0"
                key={mode}
                value={mode}
              >
                {modeCopy[mode].label}
              </TabsTrigger>
            ))}
            </TabsList>
          </div>
        </Tabs>
      </CardHeader>

      <CardContent className="relative space-y-6">
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
        <div className="overflow-hidden rounded-[28px] border border-slate-200/50 bg-slate-100/70 p-5 sm:rounded-[32px] sm:p-6 dark:border-white/10 dark:bg-slate-950/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {copy.remainingTime}
            </p>
            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
              {statusLabel}
            </p>
          </div>
          <p className="mt-5 text-center font-mono text-[clamp(3.5rem,18vw,6.5rem)] font-semibold tracking-[-0.06em] text-slate-950 tabular-nums sm:mt-6 dark:text-slate-50">
            {formatSeconds(remainingSeconds)}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            {status === "running" ? (
              <Button
                className="w-full sm:w-auto"
                onClick={handlePause}
                size="lg"
                type="button"
              >
                <Pause aria-hidden="true" className="size-4" />
                {copy.pause}
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto"
                onClick={handleStart}
                size="lg"
                type="button"
              >
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

        <div className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 sm:rounded-[28px] sm:p-5 dark:border-transparent dark:bg-slate-950/45">
          <Label htmlFor="session-tag">{copy.tagLabel}</Label>
          <Input
            autoComplete="off"
            disabled={isTagLocked}
            id="session-tag"
            maxLength={40}
            name="tag"
            onChange={(event) => setTagValue(event.target.value)}
            placeholder={copy.tagPlaceholder}
            value={tag}
          />
          {recentTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentTags.map((recentTag) => (
                <Button
                  className="h-8 rounded-full px-3"
                  disabled={isTagLocked}
                  key={recentTag}
                  onClick={() => applySuggestedTag(recentTag)}
                  size="sm"
                  type="button"
                  variant={tag === recentTag ? "default" : "secondary"}
                >
                  {recentTag}
                </Button>
              ))}
            </div>
          ) : null}
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            {copy.tagHelp}
          </p>
        </div>

        <div
          aria-live="polite"
          className={cn(
            "flex items-start gap-3 rounded-[28px] border px-5 py-4 text-sm leading-6 transition-colors",
            completionState
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-transparent dark:bg-emerald-500/10 dark:text-emerald-100"
              : "border-slate-200 bg-white/70 text-slate-600 dark:border-transparent dark:bg-slate-950/45 dark:text-slate-300",
          )}
        >
          <BellRing
            aria-hidden="true"
            className={cn(
              "mt-0.5 size-4 shrink-0",
              completionState ? "animate-pulse text-emerald-600" : "text-slate-400",
            )}
          />
          <div className="space-y-1">
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
      </CardContent>
    </Card>
  );
}
