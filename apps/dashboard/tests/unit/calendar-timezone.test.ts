import { describe, it, expect, vi } from "vitest";
import {
  getTimePartsInTimezone,
  getHoursInTimezone,
  getMinutesInTimezone,
  getTodayInTimezone,
  formatTimeInTimezone,
} from "@teqbook/shared";

describe("getTimePartsInTimezone", () => {
  it("converts UTC to Europe/Oslo (CET = UTC+1 in winter)", () => {
    // 2026-01-15 13:00 UTC = 14:00 in Oslo (CET, UTC+1)
    const parts = getTimePartsInTimezone("2026-01-15T13:00:00Z", "Europe/Oslo");
    expect(parts.hour).toBe(14);
    expect(parts.minute).toBe(0);
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(1);
    expect(parts.day).toBe(15);
  });

  it("converts UTC to Europe/Oslo (CEST = UTC+2 in summer)", () => {
    // 2026-07-15 13:00 UTC = 15:00 in Oslo (CEST, UTC+2)
    const parts = getTimePartsInTimezone("2026-07-15T13:00:00Z", "Europe/Oslo");
    expect(parts.hour).toBe(15);
    expect(parts.minute).toBe(0);
  });

  it("handles minutes correctly", () => {
    const parts = getTimePartsInTimezone("2026-02-11T13:45:00Z", "Europe/Oslo");
    expect(parts.hour).toBe(14);
    expect(parts.minute).toBe(45);
  });

  it("handles midnight edge case (hour 24 -> 0)", () => {
    // 23:00 UTC = 00:00 next day in Europe/Oslo (CET)
    const parts = getTimePartsInTimezone("2026-01-15T23:00:00Z", "Europe/Oslo");
    expect(parts.hour).toBe(0);
    expect(parts.day).toBe(16); // next day
  });

  it("handles UTC timezone correctly", () => {
    const parts = getTimePartsInTimezone("2026-02-11T09:30:00Z", "UTC");
    expect(parts.hour).toBe(9);
    expect(parts.minute).toBe(30);
  });

  it("handles US Eastern timezone", () => {
    // 2026-02-11 18:00 UTC = 13:00 EST (UTC-5 in winter)
    const parts = getTimePartsInTimezone("2026-02-11T18:00:00Z", "America/New_York");
    expect(parts.hour).toBe(13);
    expect(parts.minute).toBe(0);
  });
});

describe("getHoursInTimezone / getMinutesInTimezone", () => {
  it("returns correct hour", () => {
    expect(getHoursInTimezone("2026-01-15T13:00:00Z", "Europe/Oslo")).toBe(14);
  });

  it("returns correct minute", () => {
    expect(getMinutesInTimezone("2026-01-15T13:45:00Z", "Europe/Oslo")).toBe(45);
  });
});

describe("DST transitions", () => {
  it("handles spring forward (March) correctly", () => {
    // In Europe/Oslo, DST starts last Sunday of March 2026 = March 29
    // At 02:00 CET -> 03:00 CEST (clocks spring forward)
    // So 2026-03-29T00:30:00Z = 01:30 CET (before transition)
    const before = getTimePartsInTimezone("2026-03-29T00:30:00Z", "Europe/Oslo");
    expect(before.hour).toBe(1);
    expect(before.minute).toBe(30);

    // 2026-03-29T01:30:00Z = 03:30 CEST (after transition, hour 2 is skipped)
    const after = getTimePartsInTimezone("2026-03-29T01:30:00Z", "Europe/Oslo");
    expect(after.hour).toBe(3);
    expect(after.minute).toBe(30);
  });

  it("handles fall back (October) correctly", () => {
    // In Europe/Oslo, DST ends last Sunday of October 2026 = October 25
    // At 03:00 CEST -> 02:00 CET (clocks fall back)
    // 2026-10-25T00:30:00Z = 02:30 CEST (before transition)
    const before = getTimePartsInTimezone("2026-10-25T00:30:00Z", "Europe/Oslo");
    expect(before.hour).toBe(2);
    expect(before.minute).toBe(30);

    // 2026-10-25T01:30:00Z = 02:30 CET (after transition)
    const after = getTimePartsInTimezone("2026-10-25T01:30:00Z", "Europe/Oslo");
    expect(after.hour).toBe(2);
    expect(after.minute).toBe(30);
  });
});

describe("invalid ISO guard", () => {
  it("returns zeros for invalid ISO string", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const parts = getTimePartsInTimezone("not-a-date", "Europe/Oslo");
    expect(parts.hour).toBe(0);
    expect(parts.minute).toBe(0);
    expect(parts.year).toBe(0);
    expect(parts.day).toBe(0);
    expect(parts.weekday).toBe("");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid ISO string")
    );
    consoleSpy.mockRestore();
  });

  it("returns zeros for empty string", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const parts = getTimePartsInTimezone("", "Europe/Oslo");
    expect(parts.hour).toBe(0);
    expect(parts.minute).toBe(0);
    consoleSpy.mockRestore();
  });
});

describe("getTodayInTimezone", () => {
  it("returns a valid YYYY-MM-DD string", () => {
    const today = getTodayInTimezone("Europe/Oslo");
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a date that makes sense for the timezone", () => {
    const todayOslo = getTodayInTimezone("Europe/Oslo");
    const todayUTC = getTodayInTimezone("UTC");
    // These might differ around midnight, but both should be valid dates
    expect(new Date(todayOslo + "T00:00:00").getTime()).not.toBeNaN();
    expect(new Date(todayUTC + "T00:00:00").getTime()).not.toBeNaN();
  });
});

describe("grid range with timezone-aware segments", () => {
  it("computes correct min/max hours from segments in timezone", () => {
    const segments = [
      { start_time: "2026-02-11T07:00:00Z", end_time: "2026-02-11T16:00:00Z" }, // 08:00-17:00 Oslo
      { start_time: "2026-02-11T08:00:00Z", end_time: "2026-02-11T15:00:00Z" }, // 09:00-16:00 Oslo
    ];

    const tz = "Europe/Oslo";
    let earliest = 23;
    let latest = 0;

    for (const s of segments) {
      const startParts = getTimePartsInTimezone(s.start_time, tz);
      const endParts = getTimePartsInTimezone(s.end_time, tz);
      if (startParts.hour < earliest) earliest = startParts.hour;
      const endHour = endParts.hour;
      const endMin = endParts.minute;
      if (endHour > latest || (endHour === latest && endMin > 0))
        latest = endMin > 0 ? endHour + 1 : endHour;
    }

    expect(earliest).toBe(8); // 08:00 Oslo
    expect(latest).toBe(17); // 17:00 Oslo
  });
});

describe("locale formatting", () => {
  it("Norwegian locale produces 24h format (no AM/PM)", () => {
    const result = formatTimeInTimezone(
      "2026-02-11T13:00:00Z",
      "Europe/Oslo",
      "nb",
      { hour: "numeric", minute: "2-digit" }
    );
    // Should show 14:00 (24h), not 2:00 PM
    expect(result).toContain("14");
    expect(result).not.toMatch(/am|pm/i);
  });

  it("Norwegian locale nb-NO also produces 24h format", () => {
    const result = formatTimeInTimezone(
      "2026-02-11T13:00:00Z",
      "Europe/Oslo",
      "nb-NO",
      { hour: "numeric", minute: "2-digit" }
    );
    expect(result).toContain("14");
    expect(result).not.toMatch(/am|pm/i);
  });
});
