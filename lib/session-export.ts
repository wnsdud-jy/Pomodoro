import { formatDateKey } from "@/lib/format";
import type { SessionModeFilter, SessionRow } from "@/types/session";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export type SessionExportPeriodFilter = "all" | "today" | "last_7_days" | "last_30_days";

export type SessionExportFilters = {
  periodFilter: SessionExportPeriodFilter;
  modeFilter: SessionModeFilter;
  tagQuery: string;
  selectedDate: string | null;
  nowIso: string;
  timeZone: string;
};

const CSV_HEADER = [
  "mode",
  "tag",
  "duration_seconds",
  "started_at",
  "ended_at",
  "completed",
  "created_at",
] as const;

function normalizeCsvCell(value: string) {
  const trimmedLeadingValue = value.replace(/^\uFEFF/, "");
  const escapedFormulaPrefix = /^[=+\-@]/.test(trimmedLeadingValue.trimStart())
    ? `'${trimmedLeadingValue}`
    : trimmedLeadingValue;
  const escapedQuotes = escapedFormulaPrefix.replace(/"/g, '""');

  return `"${escapedQuotes}"`;
}

export function buildSessionsCsv(rows: SessionRow[]) {
  const lines = [
    CSV_HEADER.join(","),
    ...rows.map((row) =>
      [
        normalizeCsvCell(row.mode),
        normalizeCsvCell(row.tag ?? ""),
        normalizeCsvCell(String(row.duration_seconds)),
        normalizeCsvCell(row.started_at),
        normalizeCsvCell(row.ended_at),
        normalizeCsvCell(String(row.completed)),
        normalizeCsvCell(row.created_at),
      ].join(","),
    ),
  ];

  return `${lines.join("\r\n")}\r\n`;
}

function isValidDateKey(value: string | null | undefined): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function normalizeSessionExportPeriodFilter(
  value: string | null | undefined,
): SessionExportPeriodFilter {
  return value === "today" || value === "last_7_days" || value === "last_30_days"
    ? value
    : "all";
}

export function normalizeSessionExportDate(
  value: string | null | undefined,
): string | null {
  return isValidDateKey(value) ? value : null;
}

export function normalizeSessionExportModeFilter(
  value: string | null | undefined,
): SessionModeFilter {
  return value === "focus" || value === "short_break" || value === "long_break"
    ? value
    : "all";
}

function getWindowStartIso(nowIso: string, days: number) {
  return new Date(new Date(nowIso).getTime() - DAY_IN_MS * days).toISOString();
}

export function filterSessionsForExport(
  sessions: SessionRow[],
  options: SessionExportFilters,
) {
  let filteredSessions = sessions;

  if (options.selectedDate) {
    filteredSessions = filteredSessions.filter(
      (session) =>
        formatDateKey(session.ended_at, options.timeZone) === options.selectedDate,
    );
  } else if (options.periodFilter === "today") {
    const todayKey = formatDateKey(options.nowIso, options.timeZone);

    filteredSessions = filteredSessions.filter(
      (session) => formatDateKey(session.ended_at, options.timeZone) === todayKey,
    );
  } else if (options.periodFilter === "last_7_days") {
    const windowStartIso = getWindowStartIso(options.nowIso, 7);

    filteredSessions = filteredSessions.filter(
      (session) => new Date(session.ended_at).getTime() >= new Date(windowStartIso).getTime(),
    );
  } else if (options.periodFilter === "last_30_days") {
    const windowStartIso = getWindowStartIso(options.nowIso, 30);

    filteredSessions = filteredSessions.filter(
      (session) => new Date(session.ended_at).getTime() >= new Date(windowStartIso).getTime(),
    );
  }

  if (options.modeFilter !== "all") {
    filteredSessions = filteredSessions.filter(
      (session) => session.mode === options.modeFilter,
    );
  }

  const normalizedTagQuery = options.tagQuery.trim().toLowerCase();

  if (normalizedTagQuery.length > 0) {
    filteredSessions = filteredSessions.filter((session) =>
      (session.tag ?? "").toLowerCase().includes(normalizedTagQuery),
    );
  }

  return filteredSessions;
}

export function buildSessionExportFilename(options: {
  selectedDate: string | null;
  periodFilter: SessionExportPeriodFilter;
  nowIso: string;
  timeZone: string;
}) {
  const suffix = options.selectedDate ?? options.periodFilter;
  const dayStamp = formatDateKey(options.nowIso, options.timeZone);

  return `poromoro-history-${suffix}-${dayStamp}.csv`;
}
