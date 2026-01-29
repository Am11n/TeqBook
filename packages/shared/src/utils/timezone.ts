// =====================================================
// Timezone Utilities (shared)
// =====================================================
// All times in the database are stored in UTC.
// These functions convert UTC times to the salon's timezone for display.

function resolveLocale(locale: string | undefined): { locale: string; forceHour12?: boolean } {
  const raw = (locale || "").trim();
  const lower = raw.toLowerCase();
  if (lower === "nb" || lower.startsWith("nb-") || lower === "no" || lower.startsWith("no-")) {
    return { locale: "nb-NO", forceHour12: false };
  }
  if (lower === "en" || lower.startsWith("en-")) {
    return { locale: raw || "en-US" };
  }
  return { locale: raw || "en-US" };
}

export function formatTimeInTimezone(
  utcIsoString: string,
  timezone: string,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
): string {
  try {
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    const mergedOptions: Intl.DateTimeFormatOptions = {
      ...options,
      ...(resolved.forceHour12 !== undefined && options.hour12 === undefined ? { hour12: resolved.forceHour12 } : {}),
      timeZone: timezone,
    };
    return new Intl.DateTimeFormat(resolved.locale, mergedOptions).format(date);
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}, falling back to UTC`);
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    const mergedOptions: Intl.DateTimeFormatOptions = {
      ...options,
      ...(resolved.forceHour12 !== undefined && options.hour12 === undefined ? { hour12: resolved.forceHour12 } : {}),
      timeZone: "UTC",
    };
    return new Intl.DateTimeFormat(resolved.locale, mergedOptions).format(date);
  }
}

export function formatDateInTimezone(
  utcIsoString: string,
  timezone: string,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "2-digit" }
): string {
  try {
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    return new Intl.DateTimeFormat(resolved.locale, { ...options, timeZone: timezone }).format(date);
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}, falling back to UTC`);
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    return new Intl.DateTimeFormat(resolved.locale, { ...options, timeZone: "UTC" }).format(date);
  }
}

export function formatDateTimeInTimezone(
  utcIsoString: string,
  timezone: string,
  locale: string = "en-US"
): { date: string; time: string } {
  return {
    date: formatDateInTimezone(utcIsoString, timezone, locale, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }),
    time: formatTimeInTimezone(utcIsoString, timezone, locale),
  };
}

export function getCommonTimezones(): Array<{ value: string; label: string }> {
  return [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "Europe/Oslo", label: "Europe/Oslo (Norway)" },
    { value: "Europe/Stockholm", label: "Europe/Stockholm (Sweden)" },
    { value: "Europe/Copenhagen", label: "Europe/Copenhagen (Denmark)" },
    { value: "Europe/London", label: "Europe/London (UK)" },
    { value: "Europe/Paris", label: "Europe/Paris (France)" },
    { value: "Europe/Berlin", label: "Europe/Berlin (Germany)" },
    { value: "Europe/Madrid", label: "Europe/Madrid (Spain)" },
    { value: "Europe/Rome", label: "Europe/Rome (Italy)" },
    { value: "Europe/Amsterdam", label: "Europe/Amsterdam (Netherlands)" },
    { value: "America/New_York", label: "America/New_York (US Eastern)" },
    { value: "America/Chicago", label: "America/Chicago (US Central)" },
    { value: "America/Denver", label: "America/Denver (US Mountain)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (US Pacific)" },
    { value: "America/Toronto", label: "America/Toronto (Canada Eastern)" },
    { value: "America/Vancouver", label: "America/Vancouver (Canada Pacific)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (UAE)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (Japan)" },
    { value: "Asia/Shanghai", label: "Asia/Shanghai (China)" },
    { value: "Asia/Singapore", label: "Asia/Singapore (Singapore)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (Australia Eastern)" },
    { value: "Australia/Melbourne", label: "Australia/Melbourne (Australia Eastern)" },
  ];
}

export function localTimeToUTC(localDate: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(localDate);
    const year = parts.find((p) => p.type === "year")?.value || "2024";
    const month = parts.find((p) => p.type === "month")?.value || "01";
    const day = parts.find((p) => p.type === "day")?.value || "01";
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    const second = parts.find((p) => p.type === "second")?.value || "00";
    const localDateString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const tempDate = new Date(localDateString);
    const utcTime = tempDate.getTime();
    const localTime = localDate.getTime();
    const offset = localTime - utcTime;
    return new Date(localDate.getTime() - offset).toISOString();
  } catch (error) {
    console.warn(`Error converting local time to UTC with timezone ${timezone}:`, error);
    return localDate.toISOString();
  }
}

export function localISOStringToUTC(isoString: string, timezone: string): string {
  try {
    if (isoString.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(isoString)) {
      return new Date(isoString).toISOString();
    }
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
    if (!match) throw new Error(`Invalid ISO string format: ${isoString}`);
    const [, year, month, day, hour, minute, second] = match;
    const desiredHour = parseInt(hour!, 10);
    const desiredMinute = parseInt(minute!, 10);
    const tzFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    let guessUTC = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    let iterations = 0;
    const maxIterations = 10;
    while (iterations < maxIterations) {
      const tzParts = tzFormatter.formatToParts(guessUTC);
      const tzHour = parseInt(tzParts.find((p) => p.type === "hour")?.value || "0", 10);
      const tzMinute = parseInt(tzParts.find((p) => p.type === "minute")?.value || "0", 10);
      const hourDiff = desiredHour - tzHour;
      const minuteDiff = desiredMinute - tzMinute;
      if (hourDiff === 0 && Math.abs(minuteDiff) <= 1) {
        const totalDiffMs = minuteDiff * 60 * 1000;
        return new Date(guessUTC.getTime() + totalDiffMs).toISOString();
      }
      const totalDiffMs = (hourDiff * 60 + minuteDiff) * 60 * 1000;
      guessUTC = new Date(guessUTC.getTime() + totalDiffMs);
      iterations++;
    }
    return guessUTC.toISOString();
  } catch (error) {
    console.warn(`Error converting local ISO string to UTC with timezone ${timezone}:`, error, { isoString });
    const date = new Date(isoString);
    if (isNaN(date.getTime())) throw new Error(`Invalid date: ${isoString}`);
    return date.toISOString();
  }
}
