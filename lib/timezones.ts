export const DEFAULT_APP_TIME_ZONE = "Asia/Seoul";

const FALLBACK_TIME_ZONES = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Bangkok",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
] as const;

function getSupportedTimeZones() {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [...FALLBACK_TIME_ZONES];
    }
  }

  return [...FALLBACK_TIME_ZONES];
}

const resolvedTimeZones = getSupportedTimeZones().filter(
  (timeZone) => timeZone !== DEFAULT_APP_TIME_ZONE,
);

export const APP_TIME_ZONES = [DEFAULT_APP_TIME_ZONE, ...resolvedTimeZones] as const;

const APP_TIME_ZONE_SET = new Set<string>(APP_TIME_ZONES);

export function isSupportedTimeZone(value: string | null | undefined): value is string {
  return typeof value === "string" && APP_TIME_ZONE_SET.has(value);
}

export function normalizeTimeZone(value: string | null | undefined) {
  return isSupportedTimeZone(value) ? value : DEFAULT_APP_TIME_ZONE;
}

export function formatTimeZoneOptionLabel(timeZone: string) {
  const baseLabel = timeZone.replaceAll("_", " ").replaceAll("/", " / ");

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((part) => part.type === "timeZoneName")?.value;

    return offset ? `${baseLabel} (${offset})` : baseLabel;
  } catch {
    return baseLabel;
  }
}
