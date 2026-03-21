import type { AppLocale } from "@/lib/preferences";
import { DEFAULT_APP_TIME_ZONE } from "@/lib/timezones";

const DEFAULT_TIME_ZONE = DEFAULT_APP_TIME_ZONE;
const DATE_LOCALES: Record<AppLocale, string> = {
  ko: "ko-KR",
  en: "en-US",
};

function getDateLocale(locale: AppLocale) {
  return DATE_LOCALES[locale];
}

function toDate(input: string | Date) {
  return input instanceof Date ? input : new Date(input);
}

function getSafeDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00Z`);
}

export function formatSeconds(totalSeconds: number) {
  const clamped = Math.max(totalSeconds, 0);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatDurationLabel(totalSeconds: number, locale: AppLocale = "ko") {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (locale === "en") {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h`;
    }

    return `${minutes}m`;
  }

  if (hours > 0 && minutes > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (hours > 0) {
    return `${hours}시간`;
  }

  return `${minutes}분`;
}

export function formatDateTime(
  input: string | Date,
  timeZone = DEFAULT_TIME_ZONE,
  locale: AppLocale = "ko",
) {
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(toDate(input));
}

export function formatDateLabel(
  input: string | Date,
  timeZone = DEFAULT_TIME_ZONE,
  locale: AppLocale = "ko",
) {
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone,
  }).format(toDate(input));
}

export function formatMonthDayLabel(
  input: string | Date,
  timeZone = DEFAULT_TIME_ZONE,
  locale: AppLocale = "ko",
) {
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    month: "numeric",
    day: "numeric",
    timeZone,
  }).format(toDate(input));
}

export function formatDateKey(input: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(toDate(input));
}

export function formatDateKeyLabel(
  dateKey: string,
  timeZone = DEFAULT_TIME_ZONE,
  locale: AppLocale = "ko",
) {
  return formatDateLabel(getSafeDateFromKey(dateKey), timeZone, locale);
}

export function formatWeekdayLabelFromIndex(
  weekday: number,
  locale: AppLocale = "ko",
) {
  const safeWeekday = ((weekday % 7) + 7) % 7;
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 7 + safeWeekday)));
}

export function getTodayDateKey(timeZone = DEFAULT_TIME_ZONE) {
  return formatDateKey(new Date(), timeZone);
}
