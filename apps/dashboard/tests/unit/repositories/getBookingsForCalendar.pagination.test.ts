import { describe, it, expect, vi, beforeEach } from "vitest";

const rangeMock = vi.fn();

vi.mock("@/lib/supabase-client", () => {
  const buildQuery = () => {
    const chain = {
      eq: vi.fn(() => chain),
      gte: vi.fn(() => chain),
      lte: vi.fn(() => chain),
      order: vi.fn(() => ({
        range: (from: number, to: number) => rangeMock(from, to),
      })),
    };
    return chain;
  };
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => buildQuery()),
      })),
    },
  };
});

import { getBookingsForCalendar } from "@/lib/repositories/bookings/queries";

describe("getBookingsForCalendar pagination (high-volume path)", () => {
  beforeEach(() => {
    rangeMock.mockReset();
  });

  it("merges every Supabase page until the last partial chunk (no silent first-page cap)", async () => {
    let pageIndex = 0;
    rangeMock.mockImplementation((from: number, to: number) => {
      const size = to - from + 1;
      expect(size).toBe(100);
      if (pageIndex === 0) {
        pageIndex += 1;
        return Promise.resolve({
          data: Array.from({ length: 100 }, (_, i) => ({ id: `p0-${i}` })),
          error: null,
          count: 250,
        });
      }
      if (pageIndex === 1) {
        pageIndex += 1;
        return Promise.resolve({
          data: Array.from({ length: 100 }, (_, i) => ({ id: `p1-${i}` })),
          error: null,
          count: 250,
        });
      }
      pageIndex += 1;
      return Promise.resolve({
        data: Array.from({ length: 50 }, (_, i) => ({ id: `p2-${i}` })),
        error: null,
        count: 250,
      });
    });

    const result = await getBookingsForCalendar("00000000-0000-4000-8000-000000000001", {
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-01-31T23:59:59.999Z",
    });

    expect(rangeMock).toHaveBeenCalledTimes(3);
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(250);
    expect(result.total).toBe(250);
    expect(result.truncated).toBe(false);
  });

  it("sets truncated when the safety cap is reached", async () => {
    let calls = 0;
    rangeMock.mockImplementation(() => {
      calls += 1;
      return Promise.resolve({
        data: Array.from({ length: 100 }, (_, i) => ({ id: `row-${calls}-${i}` })),
        error: null,
        count: 100_000,
      });
    });

    const result = await getBookingsForCalendar("00000000-0000-4000-8000-000000000002", {
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-12-31T23:59:59.999Z",
    });

    expect(calls).toBe(50);
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(5000);
    expect(result.truncated).toBe(true);
  });
});
