"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  CalendarRange,
  Layers3,
  Search,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { HISTORY_PATH } from "@/lib/auth/constants";
import type { AppDictionary } from "@/lib/i18n/messages";
import type { AppLocale } from "@/lib/preferences";
import {
  buildFocusTrendPoints,
  buildHistoryInsightSummary,
  buildHistorySummaryStats,
  buildTagFocusSummary,
  buildWeekdayFocusSummary,
  filterSessions,
  filterSessionsByPeriod,
  filterSessionsBySelectedDate,
  groupSessionsByDate,
  normalizeSelectedDate,
  normalizeSessionModeFilter,
  normalizeSessionPeriodFilter,
  type SessionPeriodFilter,
} from "@/lib/session-stats";
import type { SessionModeFilter, SessionRow } from "@/types/session";
import { HistoryAnalytics } from "@/app/poromoro/history/_components/history-analytics";
import { HistoryDateBrowser } from "@/app/poromoro/history/_components/history-date-browser";
import { HistoryExportButton } from "@/app/poromoro/history/_components/history-export-button";
import { HistoryOverview } from "@/app/poromoro/history/_components/history-overview";
import { HistorySessionList } from "@/app/poromoro/history/_components/history-session-list";
import { HistoryTagSummary } from "@/app/poromoro/history/_components/history-tag-summary";

export function HistoryView({
  initialSessions,
  initialModeFilter,
  initialPeriodFilter,
  initialSelectedDate,
  initialTagQuery,
  locale,
  timeZone,
  nowIso,
  copy,
  modeCopy,
  unlabeledTag,
}: {
  initialSessions: SessionRow[];
  initialModeFilter: SessionModeFilter;
  initialPeriodFilter: SessionPeriodFilter;
  initialSelectedDate: string | null;
  initialTagQuery: string;
  locale: AppLocale;
  timeZone: string;
  nowIso: string;
  copy: AppDictionary["history"];
  modeCopy: AppDictionary["modes"];
  unlabeledTag: string;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [modeFilter, setModeFilter] = useState<SessionModeFilter>(initialModeFilter);
  const [periodFilter, setPeriodFilter] =
    useState<SessionPeriodFilter>(initialPeriodFilter);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate ?? "");
  const [tagQuery, setTagQuery] = useState(initialTagQuery);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deferredTagQuery = useDeferredValue(tagQuery);
  const hasHydratedFromUrlRef = useRef(false);

  useEffect(() => {
    const applyUrlState = () => {
      const searchParams = new URLSearchParams(window.location.search);

      setModeFilter(
        searchParams.has("mode")
          ? normalizeSessionModeFilter(searchParams.get("mode"))
          : initialModeFilter,
      );
      setTagQuery(
        searchParams.has("tag")
          ? searchParams.get("tag")?.slice(0, 40) ?? ""
          : initialTagQuery,
      );
      setPeriodFilter(
        searchParams.has("period")
          ? normalizeSessionPeriodFilter(searchParams.get("period"))
          : initialPeriodFilter,
      );
      setSelectedDate(
        searchParams.has("date")
          ? normalizeSelectedDate(searchParams.get("date")) ?? ""
          : initialSelectedDate ?? "",
      );
      hasHydratedFromUrlRef.current = true;
    };

    applyUrlState();

    const handlePopState = () => {
      applyUrlState();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [initialModeFilter, initialPeriodFilter, initialSelectedDate, initialTagQuery]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) {
      return;
    }

    const searchParams = new URLSearchParams();

    if (periodFilter !== "all") {
      searchParams.set("period", periodFilter);
    }

    if (modeFilter !== "all") {
      searchParams.set("mode", modeFilter);
    }

    const normalizedTagQuery = deferredTagQuery.trim();

    if (normalizedTagQuery.length > 0) {
      searchParams.set("tag", normalizedTagQuery);
    }

    if (selectedDate.length > 0) {
      searchParams.set("date", selectedDate);
    }

    const nextHref = searchParams.toString()
      ? `${HISTORY_PATH}?${searchParams.toString()}`
      : HISTORY_PATH;

    startTransition(() => {
      window.history.replaceState({}, "", nextHref);
    });
  }, [deferredTagQuery, modeFilter, periodFilter, selectedDate]);

  const summaryStats = buildHistorySummaryStats(sessions, {
    nowIso,
    timeZone,
    unlabeledTag,
    locale,
  });
  const recent7Days = buildFocusTrendPoints(sessions, {
    days: 7,
    nowIso,
    timeZone,
    locale,
  });
  const recent30Days = buildFocusTrendPoints(sessions, {
    days: 30,
    nowIso,
    timeZone,
    locale,
  });
  const recent30FocusSessions = filterSessionsByPeriod(
    sessions.filter((session) => session.mode === "focus"),
    {
      periodFilter: "last_30_days",
      nowIso,
      timeZone,
    },
  );
  const weekdaySummary = buildWeekdayFocusSummary(recent30FocusSessions, {
    locale,
    timeZone,
  });
  const tagRanking = buildTagFocusSummary(recent30FocusSessions, unlabeledTag, 8);
  const insightSummary = buildHistoryInsightSummary({
    recent7Days,
    recent30Days,
    weekdaySummary,
    last30DayTags: tagRanking,
  });

  const periodSessions = filterSessionsByPeriod(sessions, {
    periodFilter,
    nowIso,
    timeZone,
  });
  const dateScopedSessions = filterSessionsBySelectedDate(periodSessions, {
    selectedDate: selectedDate || null,
    timeZone,
  });
  const filteredSessions = filterSessions(dateScopedSessions, {
    modeFilter,
    tagQuery: deferredTagQuery,
    unlabeledTag,
  });
  const groupedSessions = groupSessionsByDate(filteredSessions, {
    locale,
    timeZone,
  });

  const currentPeriodLabel =
    periodFilter === "today"
      ? copy.filters.periodToday
      : periodFilter === "last_7_days"
        ? copy.filters.periodLast7Days
        : periodFilter === "last_30_days"
          ? copy.filters.periodLast30Days
          : copy.filters.periodAll;

  const exportHref = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (periodFilter !== "all") {
      searchParams.set("period", periodFilter);
    }

    if (modeFilter !== "all") {
      searchParams.set("mode", modeFilter);
    }

    const normalizedTagQuery = deferredTagQuery.trim();

    if (normalizedTagQuery.length > 0) {
      searchParams.set("tag", normalizedTagQuery);
    }

    if (selectedDate.length > 0) {
      searchParams.set("date", selectedDate);
    }

    const queryString = searchParams.toString();

    return queryString.length > 0
      ? `/poromoro/api/history/export?${queryString}`
      : "/poromoro/api/history/export";
  }, [deferredTagQuery, modeFilter, periodFilter, selectedDate]);

  async function handleDelete(sessionId: string) {
    setPendingDeleteId(sessionId);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/poromoro/api/sessions?id=${encodeURIComponent(sessionId)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      startTransition(() => {
        setSessions((currentSessions) =>
          currentSessions.filter((session) => session.id !== sessionId),
        );
        setConfirmingId(null);
      });

      toast({
        title: copy.list.deleteSuccessTitle,
        description: copy.list.deleteSuccessDescription,
        variant: "success",
      });
    } catch {
      setDeleteError(copy.list.deleteError);
    } finally {
      setPendingDeleteId(null);
    }
  }

  function resetFilters() {
    setModeFilter("all");
    setPeriodFilter("all");
    setSelectedDate("");
    setTagQuery("");
  }

  return (
    <div className="space-y-6">
      <HistoryOverview copy={copy.overview} locale={locale} stats={summaryStats} />

      <HistoryAnalytics
        copy={copy.analytics}
        insightSummary={insightSummary}
        last30Days={recent30Days}
        last30DayTags={tagRanking}
        last7Days={recent7Days}
        locale={locale}
        weekdaySummary={weekdaySummary}
      />

      <HistoryTagSummary copy={copy.tagSummary} locale={locale} rows={tagRanking} />

      <Card className="overflow-hidden border-white/60 bg-white/75 dark:border-white/10 dark:bg-slate-950/75">
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>{copy.filters.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <Sparkles aria-hidden="true" className="size-3.5" />
                {copy.filters.resultsTemplate.replace(
                  "{count}",
                  String(filteredSessions.length),
                )}
              </Badge>
              <HistoryExportButton
                disabled={filteredSessions.length === 0}
                href={exportHref}
                label={copy.filters.export}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs onValueChange={(value) => setPeriodFilter(value as SessionPeriodFilter)} value={periodFilter}>
            <TabsList className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <TabsTrigger value="today" className="gap-2">
                <CalendarDays aria-hidden="true" className="size-4" />
                {copy.filters.periodToday}
              </TabsTrigger>
              <TabsTrigger value="last_7_days" className="gap-2">
                <CalendarRange aria-hidden="true" className="size-4" />
                {copy.filters.periodLast7Days}
              </TabsTrigger>
              <TabsTrigger value="last_30_days" className="gap-2">
                <CalendarRange aria-hidden="true" className="size-4" />
                {copy.filters.periodLast30Days}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Layers3 aria-hidden="true" className="size-4" />
                {copy.filters.periodAll}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs onValueChange={(value) => setModeFilter(value as SessionModeFilter)} value={modeFilter}>
            <TabsList className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <TabsTrigger value="all">{copy.filters.all}</TabsTrigger>
              <TabsTrigger value="focus">{modeCopy.focus.shortLabel}</TabsTrigger>
              <TabsTrigger value="short_break">
                {modeCopy.short_break.shortLabel}
              </TabsTrigger>
              <TabsTrigger value="long_break">
                {modeCopy.long_break.shortLabel}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
            <div className="space-y-2">
              <Label
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                htmlFor="history-tag-filter"
              >
                <Search aria-hidden="true" className="size-4 text-slate-400" />
                {copy.filters.tagLabel}
              </Label>
              <Input
                autoComplete="off"
                className="bg-white/75 dark:bg-slate-950/70"
                id="history-tag-filter"
                maxLength={40}
                name="tagFilter"
                onChange={(event) => setTagQuery(event.target.value)}
                placeholder={copy.filters.tagPlaceholder}
                value={tagQuery}
              />
            </div>

            <HistoryDateBrowser
              clearLabel={copy.filters.clearDate}
              description={
                selectedDate.length > 0
                  ? copy.filters.selectedDateDescription.replace("{date}", selectedDate)
                  : copy.filters.dateDescription
              }
              label={copy.filters.dateLabel}
              onChange={setSelectedDate}
              onClear={() => setSelectedDate("")}
              selectedDate={selectedDate}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {copy.filters.periodLabel}: {currentPeriodLabel}
            </p>
            <Button
              disabled={
                modeFilter === "all" &&
                periodFilter === "all" &&
                selectedDate.length === 0 &&
                tagQuery.trim().length === 0
              }
              onClick={resetFilters}
              type="button"
              variant="ghost"
            >
              {copy.filters.clear}
            </Button>
          </div>
        </CardContent>
      </Card>

      <HistorySessionList
        copy={copy.list}
        days={groupedSessions}
        deleteError={deleteError}
        locale={locale}
        modeCopy={modeCopy}
        onRequestDelete={(sessionId) => {
          setDeleteError(null);
          setConfirmingId(sessionId);
        }}
        pendingDeleteId={pendingDeleteId}
        timeZone={timeZone}
        unlabeledTag={unlabeledTag}
      />

      {confirmingId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center">
          <Card
            aria-labelledby="history-delete-title"
            aria-modal="true"
            className="w-full max-w-md border-white/60 bg-white/95 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-slate-950/95"
            role="dialog"
          >
            <CardHeader className="space-y-2">
              <CardTitle id="history-delete-title">{copy.list.confirmTitle}</CardTitle>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {copy.list.confirmDescription}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => setConfirmingId(null)}
                type="button"
                variant="ghost"
              >
                {copy.list.cancel}
              </Button>
              <Button
                disabled={pendingDeleteId === confirmingId}
                onClick={() => void handleDelete(confirmingId)}
                type="button"
                variant="secondary"
              >
                {pendingDeleteId === confirmingId
                  ? copy.list.deleting
                  : copy.list.confirmDelete}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
