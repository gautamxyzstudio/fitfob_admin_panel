import dayjs, { type ConfigType, type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Register all essential Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

/**
 * Detects the user's current IANA timezone (e.g., "Asia/Kolkata", "America/New_York").
 * Defaults to "UTC" if detection fails.
 */
export const getLocalTimezone = (): string => {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      dayjs.tz.guess() ||
      "UTC"
    );
  } catch {
    return "UTC";
  }
};

// Set the global default timezone for all dayjs.tz operations
try {
  dayjs.tz.setDefault(getLocalTimezone());
} catch {
  // Graceful fallback if timezone string isn't recognized
}

/**
 * Parses any date input (UTC ISO string, date string, timestamp, Date)
 * and safely converts it to the user's local timezone.
 */
export const toLocalDate = (date?: ConfigType): Dayjs => {
  const tz = getLocalTimezone();
  if (!date) {
    return dayjs().tz(tz);
  }

  if (typeof date === "string") {
    const trimmed = date.trim();
    // If it's an ISO timestamp with time and without explicit timezone offset (no 'Z' and no '+/-HH:mm')
    // Databases often return UTC without the Z suffix.
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
      return dayjs.utc(trimmed).tz(tz);
    }
    // If it has 'Z' or explicit offset, dayjs.utc parses and .tz converts to local
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*(Z|[+-]\d{2}:?\d{2})$/.test(trimmed)) {
      return dayjs.utc(trimmed).tz(tz);
    }
    // If it's a date-only string e.g. "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return dayjs.tz(trimmed, "YYYY-MM-DD", tz);
    }
  }

  return dayjs(date).tz(tz);
};

/**
 * Formats a date/timestamp into the user's local timezone.
 * Defaults to "DD/MM/YYYY" if formatStr is omitted.
 */
export const formatLocalDate = (
  date: ConfigType,
  formatStr: string = "DD/MM/YYYY"
): string => {
  if (!date) return "";
  const parsed = toLocalDate(date);
  return parsed.isValid() ? parsed.format(formatStr) : "";
};

/**
 * Formats a date and time into the user's local timezone.
 * Defaults to "DD MMM YYYY, hh:mm A" (e.g., "11 Nov 2026, 01:45 PM").
 */
export const formatLocalDateTime = (
  date: ConfigType,
  formatStr: string = "DD MMM YYYY, hh:mm A"
): string => {
  return formatLocalDate(date, formatStr);
};

/**
 * Formats a time into the user's local timezone.
 * Defaults to "hh:mm A" (e.g., "01:45 PM").
 */
export const formatLocalTime = (
  date: ConfigType,
  formatStr: string = "hh:mm A"
): string => {
  return formatLocalDate(date, formatStr);
};

/**
 * Returns human-readable relative time string in local timezone (e.g. "2 hours ago", "in 3 days").
 */
export const formatLocalFromNow = (date: ConfigType): string => {
  if (!date) return "";
  const parsed = toLocalDate(date);
  return parsed.isValid() ? parsed.fromNow() : "";
};

/**
 * Converts a user's local date/time selection into an ISO 8601 UTC string for API payloads.
 */
export const toUtcISOString = (localDate: ConfigType): string | null => {
  if (!localDate) return null;
  const parsed = toLocalDate(localDate);
  return parsed.isValid() ? parsed.utc().toISOString() : null;
};

export type { ConfigType, Dayjs };
export default dayjs;
