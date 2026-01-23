// =====================================================
// Timezone Utilities
// =====================================================
// Utility functions for handling timezone conversions
// All times in the database are stored in UTC
// These functions convert UTC times to the salon's timezone for display
// =====================================================

/**
 * Convert UTC ISO string to a Date object in the specified timezone
 * Returns a formatted string in the salon's timezone
 */
function resolveLocale(locale: string | undefined): { locale: string; forceHour12?: boolean } {
  const raw = (locale || "").trim();
  const lower = raw.toLowerCase();

  // Norwegian: support "nb", "nb-NO", and legacy "no"
  if (lower === "nb" || lower.startsWith("nb-") || lower === "no" || lower.startsWith("no-")) {
    return { locale: "nb-NO", forceHour12: false };
  }

  // Common shorthands
  if (lower === "en" || lower.startsWith("en-")) {
    return { locale: raw || "en-US" };
  }

  // If it's already a BCP47-ish tag, pass through; otherwise default.
  return { locale: raw || "en-US" };
}

export function formatTimeInTimezone(
  utcIsoString: string,
  timezone: string,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  try {
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    const mergedOptions: Intl.DateTimeFormatOptions = {
      ...options,
      ...(resolved.forceHour12 !== undefined && options.hour12 === undefined
        ? { hour12: resolved.forceHour12 }
        : {}),
      timeZone: timezone,
    };
    return new Intl.DateTimeFormat(resolved.locale, mergedOptions).format(date);
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    console.warn(`Invalid timezone: ${timezone}, falling back to UTC`);
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    const mergedOptions: Intl.DateTimeFormatOptions = {
      ...options,
      ...(resolved.forceHour12 !== undefined && options.hour12 === undefined
        ? { hour12: resolved.forceHour12 }
        : {}),
      timeZone: "UTC",
    };
    return new Intl.DateTimeFormat(resolved.locale, mergedOptions).format(date);
  }
}

/**
 * Format date in timezone
 */
export function formatDateInTimezone(
  utcIsoString: string,
  timezone: string,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }
): string {
  try {
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    return new Intl.DateTimeFormat(resolved.locale, {
      ...options,
      timeZone: timezone,
    }).format(date);
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    console.warn(`Invalid timezone: ${timezone}, falling back to UTC`);
    const date = new Date(utcIsoString);
    const resolved = resolveLocale(locale);
    return new Intl.DateTimeFormat(resolved.locale, {
      ...options,
      timeZone: "UTC",
    }).format(date);
  }
}

/**
 * Format date and time in timezone
 */
export function formatDateTimeInTimezone(
  utcIsoString: string,
  timezone: string,
  locale: string = "en-US"
): { date: string; time: string } {
  return {
    date: formatDateInTimezone(utcIsoString, timezone, locale, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: formatTimeInTimezone(utcIsoString, timezone, locale),
  };
}

/**
 * Get a list of common timezones
 * Returns IANA timezone identifiers
 */
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

/**
 * Convert a local time (in salon timezone) to UTC ISO string
 * Used when creating bookings from the UI
 * 
 * @param localDate - A Date object representing the local time
 * @param timezone - IANA timezone identifier (e.g., "Europe/Oslo")
 * @returns UTC ISO string
 */
export function localTimeToUTC(
  localDate: Date,
  timezone: string
): string {
  try {
    // Get the time components in the target timezone
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

    // Create a date string in the format: YYYY-MM-DDTHH:mm:ss
    const localDateString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

    // Parse as if it's in the target timezone and convert to UTC
    // We need to use a library or manual calculation for this
    // For now, we'll use a simpler approach: create date and adjust
    const tempDate = new Date(localDateString);
    const utcTime = tempDate.getTime();
    const localTime = localDate.getTime();
    const offset = localTime - utcTime;

    // Create UTC date
    const utcDate = new Date(localDate.getTime() - offset);
    return utcDate.toISOString();
  } catch (error) {
    console.warn(`Error converting local time to UTC with timezone ${timezone}:`, error);
    // Fallback: return as-is (assume it's already UTC)
    return localDate.toISOString();
  }
}

/**
 * Convert an ISO string that represents a time in the salon's timezone to UTC
 * 
 * Problem: When getAvailableSlots returns "2024-01-15T09:00:00" (no timezone),
 * we need to interpret this as 09:00 in the salon's timezone (e.g., Europe/Oslo),
 * not as 09:00 UTC or 09:00 in the browser's timezone.
 * 
 * Solution: Use an iterative approach to find the UTC time that, when formatted
 * in the salon's timezone, gives us the desired local time.
 * 
 * @param isoString - ISO string without timezone (e.g., "2024-01-15T09:00:00")
 * @param timezone - IANA timezone identifier (e.g., "Europe/Oslo")
 * @returns UTC ISO string
 */
export function localISOStringToUTC(
  isoString: string,
  timezone: string
): string {
  try {
    // If the ISO string already has a timezone, treat it as UTC
    if (isoString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(isoString)) {
      return new Date(isoString).toISOString();
    }
    
    // Extract date and time components
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
    if (!match) {
      throw new Error(`Invalid ISO string format: ${isoString}`);
    }
    
    const [, year, month, day, hour, minute, second] = match;
    const desiredHour = parseInt(hour, 10);
    const desiredMinute = parseInt(minute, 10);
    
    // Create a formatter for the salon's timezone
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
    
    // Start with a guess: assume the time is already in UTC
    // Then adjust until we get the right local time
    let guessUTC = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    let iterations = 0;
    const maxIterations = 10;
    
    while (iterations < maxIterations) {
      // Format this UTC guess in the salon's timezone
      const tzParts = tzFormatter.formatToParts(guessUTC);
      const tzHour = parseInt(tzParts.find((p) => p.type === "hour")?.value || "0", 10);
      const tzMinute = parseInt(tzParts.find((p) => p.type === "minute")?.value || "0", 10);
      
      // Check if we're close enough (within 1 minute)
      const hourDiff = desiredHour - tzHour;
      const minuteDiff = desiredMinute - tzMinute;
      
      if (hourDiff === 0 && Math.abs(minuteDiff) <= 1) {
        // Close enough! Adjust by the minute difference
        // If minuteDiff is negative, we need to go back in UTC
        const totalDiffMs = minuteDiff * 60 * 1000;
        const result = new Date(guessUTC.getTime() + totalDiffMs).toISOString();
        return result;
      }
      
      // Adjust by the hour and minute difference
      // If the difference is negative (desired < actual), we need to go back in UTC
      // So we ADD the difference (which is negative, so we subtract)
      const totalDiffMs = (hourDiff * 60 + minuteDiff) * 60 * 1000;
      guessUTC = new Date(guessUTC.getTime() + totalDiffMs);
      iterations++;
    }
    
    // If we didn't converge, return the best guess
    return guessUTC.toISOString();
  } catch (error) {
    console.warn(`Error converting local ISO string to UTC with timezone ${timezone}:`, error, { isoString });
    // Fallback: assume it's already in UTC
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${isoString}`);
    }
    return date.toISOString();
  }
}
