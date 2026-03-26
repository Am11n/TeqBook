import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as createAnnouncementRoute } from "@/app/api/announcements/route";
import { POST as publishAnnouncementRoute } from "@/app/api/announcements/[id]/publish/route";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "user-1", email: "user@teqbook.com" } },
      }),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

describe("Announcements API authorization boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { is_superadmin: false }, error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      };
    });
  });

  it("blocks non-admin create announcement", async () => {
    const req = new Request("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hello", body: "World", is_pinned: false }),
    });
    const res = await createAnnouncementRoute(req);
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error).toBe("Forbidden");
  });

  it("blocks non-admin publish announcement", async () => {
    const req = new Request("http://localhost/api/announcements/id/publish", {
      method: "POST",
    });
    const res = await publishAnnouncementRoute(req, {
      params: Promise.resolve({ id: "announcement-1" }),
    });
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error).toBe("Forbidden");
  });
});
