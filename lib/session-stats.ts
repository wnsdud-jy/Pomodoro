import {
  formatDateKey,
  formatDateLabel,
  formatMonthDayLabel,
  formatWeekdayLabelFromIndex,
} from "@/lib/format";
import type { AppLocale } from "@/lib/preferences";
import type {
  FocusStreakSummary,
  FocusTrendPoint,
  GroupedSessionDay,
  HistoryInsightSummary,
  HistoryOverviewStats,
  HistorySummaryStats,
  SessionModeFilter,
  SessionRow,
  TagFocusSummaryRow,
  TodaySessionSummary,
  WeekdayFocusRow,
} from "@/types/session";

const DEFAULT_STATS_TIME_ZONE = "Asia/Seoul";
const DEFAULT_STATS_LOCALE: AppLocale = "ko";

export type SessionPeriodFilter = "all" | "today" | "last_7_days" | "last_30_days";

type SessionStatsOptions = {
  nowIso: string;
  timeZone?: string;
  unlabeledTag: string;
  locale?: AppLocale;
};

function getTimeZone(timeZone?: string) {
  return timeZone ?? DEFAULT_STATS_TIME_ZONE;
}

function getLocale(locale?: AppLocale) {
  return locale ?? DEFAULT_STATS_LOCALE;
}

function getSafeDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00Z`);
}

function addDaysToDateKey(dateKey: string, days: number) {
  const nextDate = new Date(`${dateKey}T00:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function buildDateKeyWindow(nowKey: string, days: number) {
  return Array.from({ length: days }, (_, index) =>
    addDaysToDateKey(nowKey, index - (days - 1)),
  );
}

function getSessionDateKey(session: SessionRow, timeZone: string) {
  return formatDateKey(session.ended_at, timeZone);
}

function getWeekdayIndex(input: string | Date, timeZone: string) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone,
  }).format(new Date(input));

  switch (weekday) {
    case "Mon":
      return 1;
    case "Tue":
      return 2;
    case "Wed":
      return 3;
    case "Thu":
      return 4;
    case "Fri":
      return 5;
    case "Sat":
      return 6;
    default:
      return 0;
  }
}

function getCurrentWeekStartKey(nowIso: string, timeZone: string) {
  const todayKey = formatDateKey(nowIso, timeZone);
  const weekdayIndex = getWeekdayIndex(nowIso, timeZone);
  const mondayOffset = weekdayIndex === 0 ? 6 : weekdayIndex - 1;

  return addDaysToDateKey(todayKey, -mondayOffset);
}

function getFocusSessions(sessions: SessionRow[]) {
  return sessions.filter((session) => session.mode === "focus");
}

export function getSessionTagLabel(tag: string | null, unlabeledTag: string) {
  const normalizedTag = tag?.trim() ?? "";
  return normalizedTag.length > 0 ? normalizedTag : unlabeledTag;
}

export function normalizeSessionModeFilter(
  value: string | null | undefined,
): SessionModeFilter {
  return value === "focus" || value === "short_break" || value === "long_break"
    ? value
    : "all";
}

export function normalizeSessionPeriodFilter(
  value: string | null | undefined,
): SessionPeriodFilter {
  return value === "today" ||
    value === "last_7_days" ||
    value === "last_30_days"
    ? value
    : "all";
}

export function normalizeSelectedDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function getTodaySessions(
  sessions: SessionRow[],
  nowIso: string,
  timeZone = getTimeZone(),
) {
  const todayKey = formatDateKey(nowIso, timeZone);

  return sessions.filter((session) => getSessionDateKey(session, timeZone) === todayKey);
}

export function filterSessionsByPeriod(
  sessions: SessionRow[],
  options: {
    periodFilter: SessionPeriodFilter;
    nowIso: string;
    timeZone?: string;
  },
) {
  const timeZone = getTimeZone(options.timeZone);

  if (options.periodFilter === "all") {
    return sessions;
  }

  if (options.periodFilter === "today") {
    return getTodaySessions(sessions, options.nowIso, timeZone);
  }

  const days = options.periodFilter === "last_30_days" ? 30 : 7;
  const dateKeys = new Set(buildDateKeyWindow(formatDateKey(options.nowIso, timeZone), days));

  return sessions.filter((session) => dateKeys.has(getSessionDateKey(session, timeZone)));
}

export function filterSessionsBySelectedDate(
  sessions: SessionRow[],
  options: {
    selectedDate: string | null;
    timeZone?: string;
  },
) {
  if (!options.selectedDate) {
    return sessions;
  }

  const timeZone = getTimeZone(options.timeZone);

  return sessions.filter(
    (session) => getSessionDateKey(session, timeZone) === options.selectedDate,
  );
}

export function buildTagFocusSummary(
  sessions: SessionRow[],
  unlabeledTag: string,
  limit = 5,
) {
  const tagMap = new Map<string, TagFocusSummaryRow>();

  for (const session of sessions) {
    const tag = getSessionTagLabel(session.tag, unlabeledTag);
    const current = tagMap.get(tag);

    if (current) {
      current.totalSeconds += session.duration_seconds;
      current.sessionCount += 1;
      continue;
    }

    tagMap.set(tag, {
      tag,
      totalSeconds: session.duration_seconds,
      sessionCount: 1,
    });
  }

  return Array.from(tagMap.values())
    .sort((left, right) => {
      if (right.totalSeconds !== left.totalSeconds) {
        return right.totalSeconds - left.totalSeconds;
      }

      if (right.sessionCount !== left.sessionCount) {
        return right.sessionCount - left.sessionCount;
      }

      return left.tag.localeCompare(right.tag);
    })
    .slice(0, limit);
}

function buildRangeSummary(sessions: SessionRow[]) {
  const focusSessions = getFocusSessions(sessions);

  return {
    focusSeconds: focusSessions.reduce(
      (total, session) => total + session.duration_seconds,
      0,
    ),
    focusCount: focusSessions.length,
  };
}

export function buildFocusStreakSummary(
  sessions: SessionRow[],
  options: Pick<SessionStatsOptions, "nowIso" | "timeZone">,
): FocusStreakSummary {
  const timeZone = getTimeZone(options.timeZone);
  const todayKey = formatDateKey(options.nowIso, timeZone);
  const focusDayKeys = Array.from(
    new Set(getFocusSessions(sessions).map((session) => getSessionDateKey(session, timeZone))),
  ).sort((left, right) => left.localeCompare(right));

  if (focusDayKeys.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayCompleted: false,
    };
  }

  let longestStreak = 0;
  let runningStreak = 0;

  for (let index = 0; index < focusDayKeys.length; index += 1) {
    const dateKey = focusDayKeys[index];
    const previousKey = index > 0 ? focusDayKeys[index - 1] : null;

    if (previousKey && addDaysToDateKey(previousKey, 1) === dateKey) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const focusDaySet = new Set(focusDayKeys);
  const todayCompleted = focusDaySet.has(todayKey);
  const latestKey = focusDayKeys[focusDayKeys.length - 1];
  const currentStreak =
    latestKey === todayKey || latestKey === addDaysToDateKey(todayKey, -1)
      ? (() => {
          let streak = 0;
          let cursor = latestKey;

          while (focusDaySet.has(cursor)) {
            streak += 1;
            cursor = addDaysToDateKey(cursor, -1);
          }

          return streak;
        })()
      : 0;

  return {
    currentStreak,
    longestStreak,
    todayCompleted,
  };
}

export function buildTodaySessionSummary(
  sessions: SessionRow[],
  options: SessionStatsOptions,
): TodaySessionSummary {
  const timeZone = getTimeZone(options.timeZone);
  const todaySessions = getTodaySessions(sessions, options.nowIso, timeZone);
  const focusSessions = getFocusSessions(todaySessions);

  return {
    focusSeconds: focusSessions.reduce(
      (total, session) => total + session.duration_seconds,
      0,
    ),
    focusCount: focusSessions.length,
    shortBreakCount: todaySessions.filter(
      (session) => session.mode === "short_break",
    ).length,
    longBreakCount: todaySessions.filter((session) => session.mode === "long_break")
      .length,
    topTags: buildTagFocusSummary(focusSessions, options.unlabeledTag, 3),
  };
}

export function buildHistorySummaryStats(
  sessions: SessionRow[],
  options: SessionStatsOptions,
): HistorySummaryStats {
  const timeZone = getTimeZone(options.timeZone);
  const focusSessions = getFocusSessions(sessions);
  const todayKey = formatDateKey(options.nowIso, timeZone);
  const weekStartKey = getCurrentWeekStartKey(options.nowIso, timeZone);
  const monthPrefix = todayKey.slice(0, 7);

  const todaySessions = focusSessions.filter(
    (session) => getSessionDateKey(session, timeZone) === todayKey,
  );
  const weekSessions = focusSessions.filter((session) => {
    const sessionKey = getSessionDateKey(session, timeZone);
    return sessionKey >= weekStartKey && sessionKey <= todayKey;
  });
  const monthSessions = focusSessions.filter(
    (session) => getSessionDateKey(session, timeZone).slice(0, 7) === monthPrefix,
  );
  const totalFocusSeconds = focusSessions.reduce(
    (total, session) => total + session.duration_seconds,
    0,
  );

  return {
    today: buildRangeSummary(todaySessions),
    week: buildRangeSummary(weekSessions),
    month: buildRangeSummary(monthSessions),
    averageFocusSeconds:
      focusSessions.length > 0 ? Math.round(totalFocusSeconds / focusSessions.length) : 0,
    topTag: buildTagFocusSummary(focusSessions, options.unlabeledTag, 1)[0] ?? null,
  };
}

export function buildFocusTrendPoints(
  sessions: SessionRow[],
  options: {
    days: 7 | 30;
    nowIso: string;
    timeZone?: string;
    locale?: AppLocale;
  },
) {
  const timeZone = getTimeZone(options.timeZone);
  const locale = getLocale(options.locale);
  const dateKeys = buildDateKeyWindow(formatDateKey(options.nowIso, timeZone), options.days);
  const aggregates = new Map<string, FocusTrendPoint>(
    dateKeys.map((dateKey) => [
      dateKey,
      {
        dateKey,
        label: formatMonthDayLabel(getSafeDateFromKey(dateKey), "UTC", locale),
        totalSeconds: 0,
        focusCount: 0,
      },
    ]),
  );

  for (const session of getFocusSessions(sessions)) {
    const dateKey = getSessionDateKey(session, timeZone);
    const current = aggregates.get(dateKey);

    if (!current) {
      continue;
    }

    current.totalSeconds += session.duration_seconds;
    current.focusCount += 1;
  }

  return dateKeys.map((dateKey) => aggregates.get(dateKey)!);
}

export function buildWeekdayFocusSummary(
  sessions: SessionRow[],
  options: {
    timeZone?: string;
    locale?: AppLocale;
  },
) {
  const timeZone = getTimeZone(options.timeZone);
  const locale = getLocale(options.locale);
  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
  const weekdayMap = new Map<number, WeekdayFocusRow>(
    weekdayOrder.map((weekday) => [
      weekday,
      {
        weekday,
        label: formatWeekdayLabelFromIndex(weekday, locale),
        totalSeconds: 0,
        focusCount: 0,
      },
    ]),
  );

  for (const session of getFocusSessions(sessions)) {
    const weekday = getWeekdayIndex(session.ended_at, timeZone);
    const current = weekdayMap.get(weekday);

    if (!current) {
      continue;
    }

    current.totalSeconds += session.duration_seconds;
    current.focusCount += 1;
  }

  return weekdayOrder.map((weekday) => weekdayMap.get(weekday)!);
}

export function buildHistoryInsightSummary(options: {
  recent7Days: FocusTrendPoint[];
  recent30Days: FocusTrendPoint[];
  weekdaySummary: WeekdayFocusRow[];
  last30DayTags: TagFocusSummaryRow[];
}): HistoryInsightSummary {
  const bestDayLast7 =
    options.recent7Days
      .filter((row) => row.totalSeconds > 0)
      .sort((left, right) => right.totalSeconds - left.totalSeconds)[0] ?? null;
  const bestDayLast30 =
    options.recent30Days
      .filter((row) => row.totalSeconds > 0)
      .sort((left, right) => right.totalSeconds - left.totalSeconds)[0] ?? null;
  const busiestWeekday =
    options.weekdaySummary
      .filter((row) => row.totalSeconds > 0)
      .sort((left, right) => right.totalSeconds - left.totalSeconds)[0] ?? null;

  return {
    bestDayLast7,
    bestDayLast30,
    busiestWeekday,
    topTagLast30: options.last30DayTags[0] ?? null,
  };
}

export function groupSessionsByDate(
  sessions: SessionRow[],
  options: {
    timeZone?: string;
    locale?: AppLocale;
  },
) {
  const timeZone = getTimeZone(options.timeZone);
  const locale = getLocale(options.locale);
  const dayMap = new Map<string, GroupedSessionDay>();

  for (const session of sessions) {
    const dateKey = getSessionDateKey(session, timeZone);
    const current = dayMap.get(dateKey);

    if (current) {
      current.sessions.push(session);
      current.sessionCount += 1;
      if (session.mode === "focus") {
        current.focusSeconds += session.duration_seconds;
        current.focusCount += 1;
      }
      continue;
    }

    dayMap.set(dateKey, {
      dateKey,
      label: formatDateLabel(getSafeDateFromKey(dateKey), "UTC", locale),
      focusSeconds: session.mode === "focus" ? session.duration_seconds : 0,
      focusCount: session.mode === "focus" ? 1 : 0,
      sessionCount: 1,
      sessions: [session],
    });
  }

  return Array.from(dayMap.values()).sort((left, right) =>
    right.dateKey.localeCompare(left.dateKey),
  );
}

export function buildHistoryOverviewStats(
  sessions: SessionRow[],
  options: SessionStatsOptions,
): HistoryOverviewStats {
  const todaySummary = buildTodaySessionSummary(sessions, options);
  const recentFocusTrend = buildFocusTrendPoints(sessions, {
    days: 7,
    nowIso: options.nowIso,
    timeZone: options.timeZone,
    locale: options.locale,
  });

  return {
    todayFocusSeconds: todaySummary.focusSeconds,
    last7DaysFocusSeconds: recentFocusTrend.reduce(
      (total, row) => total + row.totalSeconds,
      0,
    ),
    todayFocusCount: todaySummary.focusCount,
    topTag: todaySummary.topTags[0] ?? null,
  };
}

export function filterSessions(
  sessions: SessionRow[],
  options: {
    modeFilter: SessionModeFilter;
    tagQuery: string;
    unlabeledTag: string;
  },
) {
  const normalizedQuery = options.tagQuery.trim().toLocaleLowerCase();

  return sessions.filter((session) => {
    if (options.modeFilter !== "all" && session.mode !== options.modeFilter) {
      return false;
    }

    if (normalizedQuery.length === 0) {
      return true;
    }

    return getSessionTagLabel(session.tag, options.unlabeledTag)
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}
