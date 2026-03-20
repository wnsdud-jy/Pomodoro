"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/use-toast";
import { DASHBOARD_FOCUS_PATH, DASHBOARD_PATH } from "@/lib/auth/constants";
import { playCompletionSound } from "@/lib/browser/audio";
import { sendBrowserNotification } from "@/lib/browser/notifications";
import { buildTimerDocumentTitle, restoreDocumentTitle } from "@/lib/browser/title";
import type { AppDictionary } from "@/lib/i18n/messages";
import {
  getCurrentFocusIndex,
  getFocusStreakAfterCompletion,
  getNextMode,
} from "@/lib/pomodoro-flow";
import { getModeDurationSeconds } from "@/lib/pomodoro-settings";
import { getModeConfig, MODE_ORDER, type PomodoroMode } from "@/lib/pomodoro";
import type { PomodoroSettings } from "@/types/settings";
import type { CreateSessionPayload } from "@/types/session";

const LAST_TAG_STORAGE_KEY = "pomodoro:last-tag";

export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type CompletionBehavior = "manual" | "auto_advance" | "auto_start";

export type CompletionState = {
  mode: PomodoroMode;
  nextMode: PomodoroMode;
  behavior: CompletionBehavior;
};

type DashboardTimerContextValue = {
  appName: string;
  copy: AppDictionary["dashboard"]["timer"];
  modeCopy: AppDictionary["modes"];
  settings: PomodoroSettings;
  selectedMode: PomodoroMode;
  remainingSeconds: number;
  status: TimerStatus;
  tag: string;
  saveStatus: SaveStatus;
  focusStreak: number;
  completionState: CompletionState | null;
  highlightComplete: boolean;
  nextMode: PomodoroMode;
  currentFocusIndex: number;
  isActive: boolean;
  isTagLocked: boolean;
  modeConfig: ReturnType<typeof getModeConfig>;
  focusCycleText: string;
  completionDetail: string;
  completionSummaryMessage: string | null;
  saveStatusMessage: string | null;
  statusLabel: string;
  dashboardHref: string;
  focusHref: string;
  setTagValue: (value: string) => void;
  handleModeChange: (nextModeValue: string) => void;
  handleStart: () => void;
  handlePause: () => void;
  resetTimer: (nextModeValue?: PomodoroMode) => void;
};

const DashboardTimerContext = createContext<DashboardTimerContextValue | null>(null);

function formatTemplate(
  template: string,
  replacements: Record<string, string | number>,
) {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function buildModeHref(pathname: string, mode: PomodoroMode) {
  return `${pathname}?mode=${mode}`;
}

export function DashboardTimerProvider({
  appName,
  children,
  copy,
  initialFocusStreak,
  modeCopy,
  settings,
}: {
  appName: string;
  children: ReactNode;
  copy: AppDictionary["dashboard"]["timer"];
  initialFocusStreak: number;
  modeCopy: AppDictionary["modes"];
  settings: PomodoroSettings;
}) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<PomodoroMode>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(
    getModeDurationSeconds("focus", settings),
  );
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [targetEndAt, setTargetEndAt] = useState<number | null>(null);
  const [tag, setTag] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [focusStreak, setFocusStreak] = useState(initialFocusStreak);
  const [completionState, setCompletionState] = useState<CompletionState | null>(null);
  const [highlightComplete, setHighlightComplete] = useState(false);
  const completionHandledRef = useRef(false);
  const hasLoadedStoredTagRef = useRef(false);
  const initialSettingsRef = useRef(settings);
  const originalTitleRef = useRef<string | null>(null);
  const autoTransitionTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  const modeConfig = getModeConfig(selectedMode);
  const isActive = status === "running" || status === "paused";
  const isTagLocked = isActive;
  const nextMode =
    completionState?.nextMode ??
    getNextMode(selectedMode, focusStreak, settings.long_break_every);
  const currentFocusIndex = getCurrentFocusIndex(
    selectedMode,
    focusStreak,
    settings.long_break_every,
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const modeParam = searchParams.get("mode");
    const resolvedMode =
      modeParam && MODE_ORDER.includes(modeParam as PomodoroMode)
        ? (modeParam as PomodoroMode)
        : "focus";

    setSelectedMode(resolvedMode);
    setRemainingSeconds(getModeDurationSeconds(resolvedMode, initialSettingsRef.current));

    if (!modeParam) {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", resolvedMode);
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const storedTag = window.localStorage.getItem(LAST_TAG_STORAGE_KEY);

    if (storedTag) {
      setTag(storedTag);
    }

    hasLoadedStoredTagRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredTagRef.current) {
      return;
    }

    window.localStorage.setItem(LAST_TAG_STORAGE_KEY, tag);
  }, [tag]);

  useEffect(() => {
    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }

    if (status === "running" || status === "paused") {
      document.title = buildTimerDocumentTitle({
        appName,
        modeLabel: modeCopy[selectedMode].shortLabel,
        remainingSeconds,
      });
      return;
    }

    restoreDocumentTitle(originalTitleRef.current);
  }, [appName, modeCopy, remainingSeconds, selectedMode, status]);

  useEffect(() => {
    return () => {
      if (originalTitleRef.current) {
        restoreDocumentTitle(originalTitleRef.current);
      }

      if (autoTransitionTimeoutRef.current) {
        window.clearTimeout(autoTransitionTimeoutRef.current);
      }

      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const persistCompletedSession = useEffectEvent(async (payload: CreateSessionPayload) => {
    setSaveStatus("saving");

    try {
      const response = await fetch("/pomodoro/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save session");
      }

      setSaveStatus("saved");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setSaveStatus("error");
    }
  });

  const handleCompletionSideEffects = useEffectEvent(
    async (completedMode: PomodoroMode, upcomingMode: PomodoroMode) => {
      const modeLabel = modeCopy[completedMode].label;
      const nextModeLabel = modeCopy[upcomingMode].label;

      toast({
        title: copy.toastTitle,
        description: formatTemplate(copy.toastDescriptionTemplate, {
          mode: modeLabel,
          nextMode: nextModeLabel,
        }),
        variant: "success",
      });

      sendBrowserNotification({
        title: copy.notificationTitle,
        body: formatTemplate(copy.notificationBodyTemplate, {
          mode: modeLabel,
          nextMode: nextModeLabel,
        }),
        enabled: settings.notifications_enabled,
      });

      await playCompletionSound(settings.sound_enabled);
    },
  );

  function clearAutoTransitionTimeout() {
    if (autoTransitionTimeoutRef.current !== null) {
      window.clearTimeout(autoTransitionTimeoutRef.current);
      autoTransitionTimeoutRef.current = null;
    }
  }

  function triggerCompletionHighlight() {
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    setHighlightComplete(true);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightComplete(false);
    }, 1600);
  }

  function syncModeInUrl(nextModeValue: PomodoroMode) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextModeValue);
    window.history.replaceState({}, "", url.toString());
  }

  function moveToMode(nextModeValue: PomodoroMode, autoStart = false) {
    clearAutoTransitionTimeout();
    completionHandledRef.current = false;
    syncModeInUrl(nextModeValue);
    setSelectedMode(nextModeValue);
    setRemainingSeconds(getModeDurationSeconds(nextModeValue, settings));
    setSaveStatus("idle");

    if (autoStart) {
      const now = Date.now();
      const durationSeconds = getModeDurationSeconds(nextModeValue, settings);

      setStatus("running");
      setStartedAt(new Date(now).toISOString());
      setTargetEndAt(now + durationSeconds * 1000);
      setRemainingSeconds(durationSeconds);
      return;
    }

    setStatus("idle");
    setStartedAt(null);
    setTargetEndAt(null);
  }

  function resetTimer(nextModeValue: PomodoroMode = selectedMode) {
    clearAutoTransitionTimeout();
    completionHandledRef.current = false;
    setCompletionState(null);
    setSelectedMode(nextModeValue);
    setRemainingSeconds(getModeDurationSeconds(nextModeValue, settings));
    setStatus("idle");
    setStartedAt(null);
    setTargetEndAt(null);
    setSaveStatus("idle");
    syncModeInUrl(nextModeValue);
  }

  const scheduleModeTransition = useEffectEvent(
    (nextModeValue: PomodoroMode, autoStart: boolean) => {
      moveToMode(nextModeValue, autoStart);
    },
  );

  useEffect(() => {
    if (status !== "running" || targetEndAt === null) {
      return;
    }

    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((targetEndAt - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft > 0 || completionHandledRef.current) {
        return;
      }

      completionHandledRef.current = true;
      setTargetEndAt(null);
      setRemainingSeconds(0);
      setStatus("completed");

      const completedMode = selectedMode;
      const durationSeconds = getModeDurationSeconds(completedMode, settings);
      const endedAt = new Date().toISOString();
      const fallbackStartedAt = new Date(Date.now() - durationSeconds * 1000).toISOString();
      const nextFocusStreak = getFocusStreakAfterCompletion(completedMode, focusStreak);
      const upcomingMode = getNextMode(
        completedMode,
        focusStreak,
        settings.long_break_every,
      );
      const completionBehavior: CompletionBehavior = settings.auto_advance
        ? settings.auto_start_next
          ? "auto_start"
          : "auto_advance"
        : "manual";

      setFocusStreak(nextFocusStreak);
      setCompletionState({
        mode: completedMode,
        nextMode: upcomingMode,
        behavior: completionBehavior,
      });
      triggerCompletionHighlight();

      void handleCompletionSideEffects(completedMode, upcomingMode);
      void persistCompletedSession({
        mode: completedMode,
        tag,
        durationSeconds,
        startedAt: startedAt ?? fallbackStartedAt,
        endedAt,
        completed: true,
      });

      if (settings.auto_advance) {
        autoTransitionTimeoutRef.current = window.setTimeout(() => {
          scheduleModeTransition(upcomingMode, settings.auto_start_next);
        }, settings.auto_start_next ? 1400 : 1000);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    focusStreak,
    selectedMode,
    settings,
    startedAt,
    status,
    tag,
    targetEndAt,
  ]);

  function handleModeChange(nextModeValue: string) {
    resetTimer(nextModeValue as PomodoroMode);
  }

  function handleStart() {
    clearAutoTransitionTimeout();
    const now = Date.now();
    const isResuming = status === "paused" && remainingSeconds > 0;
    const nextDuration = isResuming
      ? remainingSeconds
      : getModeDurationSeconds(selectedMode, settings);

    if (!isResuming) {
      setStartedAt(new Date(now).toISOString());
      completionHandledRef.current = false;
      setSaveStatus("idle");
      setCompletionState(null);
      setRemainingSeconds(nextDuration);
    }

    setStatus("running");
    setTargetEndAt(now + nextDuration * 1000);
  }

  function handlePause() {
    if (targetEndAt === null) {
      return;
    }

    const secondsLeft = Math.max(0, Math.ceil((targetEndAt - Date.now()) / 1000));
    setRemainingSeconds(secondsLeft);
    setTargetEndAt(null);
    setStatus("paused");
  }

  const completionDetail =
    completionState?.behavior === "auto_start"
      ? copy.autoStartDetail
      : completionState?.behavior === "auto_advance"
        ? copy.autoAdvanceDetail
        : copy.manualAdvanceDetail;
  const completionSummaryMessage = completionState
    ? formatTemplate(copy.completionDetailTemplate, {
        mode: modeCopy[completionState.mode].label,
        nextMode: modeCopy[completionState.nextMode].label,
      })
    : null;
  const saveStatusMessage =
    saveStatus === "saving"
      ? copy.savingMessage
      : saveStatus === "saved"
        ? copy.savedMessage
        : saveStatus === "error"
          ? copy.errorMessage
          : null;
  const statusLabel = copy.status[status];
  const focusCycleText = formatTemplate(copy.focusCycleTemplate, {
    current: currentFocusIndex,
    total: settings.long_break_every,
  });

  const value: DashboardTimerContextValue = {
    appName,
    completionDetail,
    completionState,
    completionSummaryMessage,
    copy,
    currentFocusIndex,
    dashboardHref: buildModeHref(DASHBOARD_PATH, selectedMode),
    focusCycleText,
    focusHref: buildModeHref(DASHBOARD_FOCUS_PATH, selectedMode),
    focusStreak,
    handleModeChange,
    handlePause,
    handleStart,
    highlightComplete,
    isActive,
    isTagLocked,
    modeConfig,
    modeCopy,
    nextMode,
    remainingSeconds,
    resetTimer,
    saveStatus,
    saveStatusMessage,
    selectedMode,
    setTagValue: setTag,
    settings,
    status,
    statusLabel,
    tag,
  };

  return (
    <DashboardTimerContext.Provider value={value}>
      {children}
    </DashboardTimerContext.Provider>
  );
}

export function useDashboardTimer() {
  const context = useContext(DashboardTimerContext);

  if (!context) {
    throw new Error("useDashboardTimer must be used within DashboardTimerProvider");
  }

  return context;
}
