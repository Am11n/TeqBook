import { describe, it, expect, vi, afterEach } from "vitest";
import { notifyWithClaimOffer, convertWaitlistToBooking } from "@/lib/services/waitlist-service";

describe("waitlist-service failure paths", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns API error when notifyWithClaimOffer receives non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    );

    const result = await notifyWithClaimOffer({
      salonId: "salon-1",
      entryId: "entry-1",
      slotStart: new Date().toISOString(),
      fallbackError: "fallback",
    });

    expect(result.error).toBe("Forbidden");
    expect(result.notified).toBe(false);
  });

  it("returns fallback error when convertWaitlistToBooking throws", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network down"));

    const result = await convertWaitlistToBooking({
      salonId: "salon-1",
      entryId: "entry-1",
      fallbackError: "Failed conversion",
    });

    expect(result.error).toBe("Network down");
    expect(result.bookingId).toBeNull();
  });
});
