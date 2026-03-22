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
import { playCompletionSound, stopCompletionSound } from "@/lib/browser/audio";
import { sendBrowserNotification } from "@/lib/browser/notifications";
import { buildTimerDocumentTitle, restoreDocumentTitle } from "@/lib/browser/title";
import { formatDurationLabel } from "@/lib/format";
import type { AppDictionary } from "@/lib/i18n/messages";
import {
  getCurrentFocusIndex,
  getFocusStreakAfterCompletion,
  getNextMode,
} from "@/lib/pomodoro-flow";
import { getModeDurationSeconds } from "@/lib/pomodoro-settings";
import { getModeConfig, MODE_ORDER, type PomodoroMode } from "@/lib/pomodoro";
import type { AppLocale } from "@/lib/preferences";
import type { PomodoroSettings } from "@/types/settings";
import type { CreateSessionPayload } from "@/types/session";

const LAST_TAG_STORAGE_KEY = "pomodoro:last-tag";
const ACTIVE_TIMER_STORAGE_KEY = "pomodoro:active-session:v1";

export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type CompletionBehavior = "manual" | "auto_advance" | "auto_start";

export type CompletionState = {
  mode: PomodoroMode;
  nextMode: PomodoroMode;
  behavior: CompletionBehavior;
};

type ActiveTimerSnapshot = {
  version: 1;
  selectedMode: PomodoroMode;
  plannedDurationSeconds: number;
  remainingSeconds: number;
  status: Extract<TimerStatus, "running" | "paused">;
  startedAt: string;
  targetEndAt: number | null;
  tag: string;
  focusStreak: number;
};

type PendingRecovery = {
  mode: PomodoroMode;
  plannedDurationSeconds: number;
  remainingSeconds: number;
  status: Extract<TimerStatus, "running" | "paused">;
  startedAt: string;
  targetEndAt: number | null;
  tag: string;
  focusStreak: number;
};

type CompletionAlertTone = "focus" | "break";

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
  completionAlertDetail: string;
  completionTitle: string;
  completionSummaryMessage: string | null;
  completionNextMessage: string | null;
  completionStreakMessage: string | null;
  completionPrimaryActionLabel: string;
  completionSecondaryActionLabel: string;
  completionAlertTone: CompletionAlertTone;
  saveStatusMessage: string | null;
  statusLabel: string;
  dashboardHref: string;
  focusHref: string;
  recentTags: string[];
  pendingRecovery: PendingRecovery | null;
  completionAlertOpen: boolean;
  setTagValue: (value: string) => void;
  applySuggestedTag: (value: string) => void;
  handleModeChange: (nextModeValue: string) => void;
  handleStart: () => void;
  handlePause: () => void;
  resetTimer: (nextModeValue?: PomodoroMode) => void;
  resumePendingRecovery: () => void;
  dismissPendingRecovery: () => void;
  startNextSessionFromAlert: () => void;
  dismissCompletionAlert: () => void;
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

function getCompletionAlertTone(mode: PomodoroMode): CompletionAlertTone {
  return mode === "focus" ? "focus" : "break";
}

export function DashboardTimerProvider({
  appName,
  children,
  copy,
  initialDailyFocusStreak,
  initialFocusStreak,
  initialTodayFocusCount,
  locale,
  modeCopy,
  recentTags,
  settings,
}: {
  appName: string;
  children: ReactNode;
  copy: AppDictionary["dashboard"]["timer"];
  initialDailyFocusStreak: number;
  initialFocusStreak: number;
  initialTodayFocusCount: number;
  locale: AppLocale;
  modeCopy: AppDictionary["modes"];
  recentTags: string[];
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
  const [plannedDurationSeconds, setPlannedDurationSeconds] = useState(
    getModeDurationSeconds("focus", settings),
  );
  const [tag, setTag] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [focusStreak, setFocusStreak] = useState(initialFocusStreak);
  const [dailyFocusStreak, setDailyFocusStreak] = useState(initialDailyFocusStreak);
  const [todayFocusCount, setTodayFocusCount] = useState(initialTodayFocusCount);
  const [completionState, setCompletionState] = useState<CompletionState | null>(null);
  const [completionStreakMessage, setCompletionStreakMessage] = useState<string | null>(null);
  const [highlightComplete, setHighlightComplete] = useState(false);
  const completionHandledRef = useRef(false);
  const hasLoadedStoredTagRef = useRef(false);
  const hasHydratedRecoveryRef = useRef(false);
  const initialSettingsRef = useRef(settings);
  const completionStreakTemplateRef = useRef(copy.completionStreakTemplate);
  const originalTitleRef = useRef<string | null>(null);
  const todayFocusCountRef = useRef(initialTodayFocusCount);
  const dailyFocusStreakRef = useRef(initialDailyFocusStreak);
  const autoTransitionTimeoutRef = useRef<number | null>(null);
  const repeatingAlertTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const [pendingRecovery, setPendingRecovery] = useState<PendingRecovery | null>(null);
  const [completionAlertOpen, setCompletionAlertOpen] = useState(false);

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
    todayFocusCountRef.current = todayFocusCount;
    dailyFocusStreakRef.current = dailyFocusStreak;
    completionStreakTemplateRef.current = copy.completionStreakTemplate;
  }, [copy.completionStreakTemplate, dailyFocusStreak, todayFocusCount]);

  function clearRecoverySnapshot() {
    window.localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
  }

  function buildPendingRecovery(snapshot: ActiveTimerSnapshot) {
    if (snapshot.status === "running") {
      if (snapshot.targetEndAt === null) {
        return null;
      }

      const remaining = Math.max(0, Math.ceil((snapshot.targetEndAt - Date.now()) / 1000));

      if (remaining === 0) {
        return null;
      }

      return {
        mode: snapshot.selectedMode,
        plannedDurationSeconds: snapshot.plannedDurationSeconds,
        remainingSeconds: remaining,
        status: snapshot.status,
        startedAt: snapshot.startedAt,
        targetEndAt: snapshot.targetEndAt,
        tag: snapshot.tag,
        focusStreak: snapshot.focusStreak,
      } satisfies PendingRecovery;
    }

    if (snapshot.remainingSeconds <= 0) {
      return null;
    }

    return {
      mode: snapshot.selectedMode,
      plannedDurationSeconds: snapshot.plannedDurationSeconds,
      remainingSeconds: snapshot.remainingSeconds,
      status: snapshot.status,
      startedAt: snapshot.startedAt,
      targetEndAt: null,
      tag: snapshot.tag,
      focusStreak: snapshot.focusStreak,
    } satisfies PendingRecovery;
  }

  function parseRecoverySnapshot(rawValue: string | null) {
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<ActiveTimerSnapshot>;

      if (
        parsed.version !== 1 ||
        !parsed.startedAt ||
        !MODE_ORDER.includes(parsed.selectedMode as PomodoroMode) ||
        (parsed.status !== "running" && parsed.status !== "paused") ||
        typeof parsed.remainingSeconds !== "number" ||
        typeof parsed.plannedDurationSeconds !== "number" ||
        typeof parsed.focusStreak !== "number" ||
        typeof parsed.tag !== "string"
      ) {
        return null;
      }

      if (parsed.status === "running" && typeof parsed.targetEndAt !== "number") {
        return null;
      }

      return parsed as ActiveTimerSnapshot;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const modeParam = searchParams.get("mode");
    const resolvedMode =
      modeParam && MODE_ORDER.includes(modeParam as PomodoroMode)
        ? (modeParam as PomodoroMode)
        : "focus";

    setSelectedMode(resolvedMode);
    setRemainingSeconds(getModeDurationSeconds(resolvedMode, initialSettingsRef.current));
    setPlannedDurationSeconds(getModeDurationSeconds(resolvedMode, initialSettingsRef.current));

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
    const snapshot = parseRecoverySnapshot(
      window.localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY),
    );

    if (snapshot) {
      const recoveryState = buildPendingRecovery(snapshot);

      if (recoveryState) {
        setPendingRecovery(recoveryState);
      } else if (snapshot.status === "running" && snapshot.targetEndAt !== null) {
        const endedAt = new Date(snapshot.targetEndAt).toISOString();
        const upcomingMode = getNextMode(
          snapshot.selectedMode,
          snapshot.focusStreak,
          initialSettingsRef.current.long_break_every,
        );
        const nextTodayFocusCount =
          snapshot.selectedMode === "focus"
            ? todayFocusCountRef.current + 1
            : todayFocusCountRef.current;
        const nextDailyStreak =
          snapshot.selectedMode === "focus" && todayFocusCountRef.current === 0
            ? dailyFocusStreakRef.current + 1
            : dailyFocusStreakRef.current;

        setSelectedMode(snapshot.selectedMode);
        setPlannedDurationSeconds(snapshot.plannedDurationSeconds);
        setRemainingSeconds(0);
        setStatus("completed");
        setStartedAt(snapshot.startedAt);
        setTargetEndAt(null);
        setTag(snapshot.tag);
        setTodayFocusCount(nextTodayFocusCount);
        setDailyFocusStreak(nextDailyStreak);
        setFocusStreak(getFocusStreakAfterCompletion(snapshot.selectedMode, snapshot.focusStreak));
        setCompletionStreakMessage(
          snapshot.selectedMode === "focus" && todayFocusCountRef.current === 0
            ? formatTemplate(completionStreakTemplateRef.current, {
                days: nextDailyStreak,
              })
            : null,
        );
        setCompletionState({
          mode: snapshot.selectedMode,
          nextMode: upcomingMode,
          behavior: initialSettingsRef.current.auto_advance
            ? initialSettingsRef.current.auto_start_next
              ? "auto_start"
              : "auto_advance"
            : "manual",
        });
        setCompletionAlertOpen(true);
        setSaveStatus("idle");
        triggerCompletionHighlight();
        scheduleRepeatingCompletionAlert();
        void persistCompletedSession({
          mode: snapshot.selectedMode,
          tag: snapshot.tag,
          durationSeconds: snapshot.plannedDurationSeconds,
          startedAt: snapshot.startedAt,
          endedAt,
          completed: true,
        });
        clearRecoverySnapshot();
      } else {
        clearRecoverySnapshot();
      }
    }

    hasHydratedRecoveryRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredTagRef.current) {
      return;
    }

    window.localStorage.setItem(LAST_TAG_STORAGE_KEY, tag);
  }, [tag]);

  useEffect(() => {
    if (!hasHydratedRecoveryRef.current) {
      return;
    }

    if (pendingRecovery) {
      return;
    }

    if (status !== "running" && status !== "paused") {
      clearRecoverySnapshot();
      return;
    }

    if (!startedAt) {
      return;
    }

    const snapshot: ActiveTimerSnapshot = {
      version: 1,
      selectedMode,
      plannedDurationSeconds,
      remainingSeconds,
      status,
      startedAt,
      targetEndAt,
      tag,
      focusStreak,
    };

    window.localStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    focusStreak,
    pendingRecovery,
    plannedDurationSeconds,
    remainingSeconds,
    selectedMode,
    startedAt,
    status,
    tag,
    targetEndAt,
  ]);

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

      stopRepeatingCompletionAlert();
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
    },
  );

  function clearAutoTransitionTimeout() {
    if (autoTransitionTimeoutRef.current !== null) {
      window.clearTimeout(autoTransitionTimeoutRef.current);
      autoTransitionTimeoutRef.current = null;
    }
  }

  function stopRepeatingCompletionAlert() {
    if (repeatingAlertTimeoutRef.current !== null) {
      window.clearTimeout(repeatingAlertTimeoutRef.current);
      repeatingAlertTimeoutRef.current = null;
    }

    stopCompletionSound();
  }

  const scheduleRepeatingCompletionAlert = useEffectEvent(() => {
    stopRepeatingCompletionAlert();

    if (!settings.sound_enabled) {
      return;
    }

    const loop = async () => {
      await playCompletionSound(settings.sound_enabled);

      repeatingAlertTimeoutRef.current = window.setTimeout(() => {
        void loop();
      }, 1800);
    };

    void loop();
  });

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
    stopRepeatingCompletionAlert();
    completionHandledRef.current = false;
    setCompletionAlertOpen(false);
    setCompletionStreakMessage(null);
    setPendingRecovery(null);
    clearRecoverySnapshot();
    syncModeInUrl(nextModeValue);
    setSelectedMode(nextModeValue);
    const nextDuration = getModeDurationSeconds(nextModeValue, settings);
    setPlannedDurationSeconds(nextDuration);
    setRemainingSeconds(nextDuration);
    setSaveStatus("idle");

    if (autoStart) {
      const now = Date.now();
      const durationSeconds = getModeDurationSeconds(nextModeValue, settings);

      setStatus("running");
      setStartedAt(new Date(now).toISOString());
      setPlannedDurationSeconds(durationSeconds);
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
    stopRepeatingCompletionAlert();
    completionHandledRef.current = false;
    setCompletionAlertOpen(false);
    setCompletionStreakMessage(null);
    setPendingRecovery(null);
    clearRecoverySnapshot();
    setCompletionState(null);
    setSelectedMode(nextModeValue);
    const nextDuration = getModeDurationSeconds(nextModeValue, settings);
    setPlannedDurationSeconds(nextDuration);
    setRemainingSeconds(nextDuration);
    setStatus("idle");
    setStartedAt(null);
    setTargetEndAt(null);
    setSaveStatus("idle");
    syncModeInUrl(nextModeValue);
  }

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
      clearRecoverySnapshot();
      setPendingRecovery(null);
      setCompletionAlertOpen(true);
      setTargetEndAt(null);
      setRemainingSeconds(0);
      setStatus("completed");

      const completedMode = selectedMode;
      const durationSeconds = plannedDurationSeconds;
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
      const nextTodayFocusCount =
        completedMode === "focus" ? todayFocusCountRef.current + 1 : todayFocusCountRef.current;
      const nextDailyStreak =
        completedMode === "focus" && todayFocusCountRef.current === 0
          ? dailyFocusStreakRef.current + 1
          : dailyFocusStreakRef.current;

      setTodayFocusCount(nextTodayFocusCount);
      setDailyFocusStreak(nextDailyStreak);
      setFocusStreak(nextFocusStreak);
      setCompletionStreakMessage(
        completedMode === "focus" && todayFocusCountRef.current === 0
          ? formatTemplate(completionStreakTemplateRef.current, {
              days: nextDailyStreak,
            })
          : null,
      );
      setCompletionState({
        mode: completedMode,
        nextMode: upcomingMode,
        behavior: completionBehavior,
      });
      triggerCompletionHighlight();
      scheduleRepeatingCompletionAlert();

      void handleCompletionSideEffects(completedMode, upcomingMode);
      void persistCompletedSession({
        mode: completedMode,
        tag,
        durationSeconds,
        startedAt: startedAt ?? fallbackStartedAt,
        endedAt,
        completed: true,
      });
    };

    tick();
    const intervalId = window.setInterval(tick, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [focusStreak, plannedDurationSeconds, selectedMode, settings, startedAt, status, tag, targetEndAt]);

  function handleModeChange(nextModeValue: string) {
    resetTimer(nextModeValue as PomodoroMode);
  }

  function handleStart() {
    clearAutoTransitionTimeout();
    stopRepeatingCompletionAlert();
    setCompletionAlertOpen(false);
    setCompletionStreakMessage(null);
    setPendingRecovery(null);
    const now = Date.now();
    const isResuming = status === "paused" && remainingSeconds > 0;
    const nextDuration = isResuming
      ? remainingSeconds
      : getModeDurationSeconds(selectedMode, settings);

    if (!isResuming) {
      const nextPlannedDuration = getModeDurationSeconds(selectedMode, settings);
      setStartedAt(new Date(now).toISOString());
      setPlannedDurationSeconds(nextPlannedDuration);
      completionHandledRef.current = false;
      setSaveStatus("idle");
      setCompletionState(null);
      setRemainingSeconds(nextPlannedDuration);
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

  function applySuggestedTag(value: string) {
    if (isTagLocked) {
      return;
    }

    setTag(value);
  }

  function resumePendingRecovery() {
    if (!pendingRecovery) {
      return;
    }

    const remainingSeconds =
      pendingRecovery.status === "running" && pendingRecovery.targetEndAt !== null
        ? Math.max(0, Math.ceil((pendingRecovery.targetEndAt - Date.now()) / 1000))
        : pendingRecovery.remainingSeconds;

    if (remainingSeconds <= 0) {
      setPendingRecovery(null);
      clearRecoverySnapshot();
      return;
    }

    syncModeInUrl(pendingRecovery.mode);
    setSelectedMode(pendingRecovery.mode);
    setPlannedDurationSeconds(pendingRecovery.plannedDurationSeconds);
    setRemainingSeconds(remainingSeconds);
    setStatus(pendingRecovery.status);
    setStartedAt(pendingRecovery.startedAt);
    setTargetEndAt(
      pendingRecovery.status === "running" ? pendingRecovery.targetEndAt : null,
    );
    setTag(pendingRecovery.tag);
    setFocusStreak(pendingRecovery.focusStreak);
    setCompletionState(null);
    setSaveStatus("idle");
    setPendingRecovery(null);
  }

  function dismissPendingRecovery() {
    setPendingRecovery(null);
    clearRecoverySnapshot();
  }

  function startNextSessionFromAlert() {
    stopRepeatingCompletionAlert();
    setCompletionAlertOpen(false);
    setCompletionStreakMessage(null);

    if (!completionState) {
      return;
    }

    moveToMode(completionState.nextMode, true);
  }

  function dismissCompletionAlert() {
    stopRepeatingCompletionAlert();
    setCompletionAlertOpen(false);
    setCompletionStreakMessage(null);
    moveToMode("focus", false);
  }

  const completionDetail =
    completionState?.behavior === "auto_start"
      ? copy.autoStartDetail
      : completionState?.behavior === "auto_advance"
        ? copy.autoAdvanceDetail
        : copy.manualAdvanceDetail;
  const completionAlertDetail =
    completionState?.behavior === "auto_start"
      ? copy.autoStartAlertDetail
      : completionState?.behavior === "auto_advance"
        ? copy.autoAdvanceAlertDetail
        : copy.manualAlertDetail;
  const completionDurationLabel = formatDurationLabel(plannedDurationSeconds, locale);
  const completionNextDurationLabel = completionState
    ? formatDurationLabel(getModeDurationSeconds(completionState.nextMode, settings), locale)
    : null;
  const completionTitle = completionState
    ? completionState.mode === "focus"
      ? copy.completionFocusTitle
      : copy.completionBreakTitle
    : copy.completionModalTitle;
  const completionNextMessage =
    completionState && completionNextDurationLabel
      ? formatTemplate(copy.completionNextTemplate, {
          nextMode: modeCopy[completionState.nextMode].label,
          duration: completionNextDurationLabel,
        })
      : null;
  const completionPrimaryActionLabel = completionState
    ? formatTemplate(copy.completionStartTemplate, {
        mode: modeCopy[completionState.nextMode].label,
      })
    : copy.start;
  const completionSecondaryActionLabel = completionState
    ? completionState.nextMode === "focus"
      ? copy.completionLater
      : copy.completionSkip
    : copy.reset;
  const completionAlertTone = completionState
    ? getCompletionAlertTone(completionState.mode)
    : "focus";
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
  const completionMessage = completionState
    ? completionState.mode === "focus"
      ? formatTemplate(copy.completionFocusMessageTemplate, {
          duration: completionDurationLabel,
        })
      : formatTemplate(copy.completionBreakMessageTemplate, {
          duration: completionDurationLabel,
        })
    : null;

  const value: DashboardTimerContextValue = {
    appName,
    completionAlertDetail,
    completionAlertTone,
    completionDetail,
    completionAlertOpen,
    completionNextMessage,
    completionPrimaryActionLabel,
    completionSecondaryActionLabel,
    completionState,
    completionStreakMessage,
    completionSummaryMessage: completionMessage,
    completionTitle,
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
    pendingRecovery,
    recentTags,
    remainingSeconds,
    resetTimer,
    resumePendingRecovery,
    dismissPendingRecovery,
    dismissCompletionAlert,
    saveStatus,
    saveStatusMessage,
    selectedMode,
    startNextSessionFromAlert,
    applySuggestedTag,
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
