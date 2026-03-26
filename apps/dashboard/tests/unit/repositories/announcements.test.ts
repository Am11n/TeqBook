import { describe, it, expect, vi, beforeEach } from "vitest";
import { listPublishedAnnouncements } from "@/lib/repositories/announcements";

const eqMock = vi.fn(() => ({
  order: vi.fn(() => ({
    order: vi.fn(() => ({
      limit: vi.fn(async () => ({ data: [], error: null })),
    })),
  })),
}));

vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: eqMock,
      })),
    })),
  },
}));

describe("announcements repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries only published announcements", async () => {
    await listPublishedAnnouncements();
    expect(eqMock).toHaveBeenCalledWith("status", "published");
  });
});
