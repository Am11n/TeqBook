import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleWaitlistCancellation } from "@/lib/services/waitlist-cancellation";

vi.mock("server-only", () => ({}));

const mockSendSms = vi.fn();
const mockSendEmail = vi.fn();
const mockGetSalonById = vi.fn();
const mockGetAdminClient = vi.fn();
const mockRpc = vi.fn();
const mockCreateAndSendWaitlistOffer = vi.fn();

function buildAdminClient() {
  const pendingOfferMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const pendingOfferQuery = {
    eq: vi.fn(() => pendingOfferQuery),
    maybeSingle: pendingOfferMaybeSingle,
  };
  const waitlistCandidatesQuery = {
    select: vi.fn(() => waitlistCandidatesQuery),
    eq: vi.fn(() => waitlistCandidatesQuery),
    or: vi.fn(() => waitlistCandidatesQuery),
    order: vi.fn(() => waitlistCandidatesQuery),
    limit: vi.fn(async () => ({
      data: [
        {
          id: "entry-1",
          salon_id: "salon-1",
          customer_id: null,
          customer_name: "Jane Doe",
          customer_email: "jane@example.com",
          customer_phone: "+4799999999",
          service_id: "service-1",
          employee_id: null,
          preferred_date: "2026-03-12",
          preferred_time_start: null,
          preferred_time_end: null,
          preference_mode: "day_flexible",
          flex_window_minutes: 60,
          priority_score_snapshot: 5,
          status: "waiting",
          notified_at: null,
          expires_at: null,
          cooldown_until: null,
          cooldown_reason: null,
          decline_count: 0,
          booking_id: null,
          created_at: "2026-03-01T10:00:00.000Z",
        },
      ],
      error: null,
    })),
  };
  const updateWaitlistEntryChain = {
    eq: vi.fn(() => updateWaitlistEntryChain),
    select: vi.fn(() => updateWaitlistEntryChain),
    maybeSingle: vi.fn(async () => ({
      data: { id: "entry-1" },
      error: null,
    })),
  };
  const insertOfferChain = {
    select: vi.fn(() => insertOfferChain),
    single: vi.fn(async () => ({ data: { id: "offer-1" }, error: null })),
  };

  return {
    rpc: mockRpc,
    from: vi.fn((table: string) => {
      if (table === "waitlist_offers") {
        return {
          select: vi.fn(() => pendingOfferQuery),
          insert: vi.fn(() => insertOfferChain),
        };
      }
      if (table === "waitlist_entries") {
        return {
          select: vi.fn(() => waitlistCandidatesQuery),
          update: vi.fn(() => updateWaitlistEntryChain),
        };
      }
      if (table === "waitlist_lifecycle_events") {
        return {
          insert: vi.fn(async () => ({ error: null })),
        };
      }
      return {};
    }),
  };
}

vi.mock("@/lib/supabase/admin", () => ({
  getAdminClient: () => mockGetAdminClient(),
}));

vi.mock("@/lib/services/sms", () => ({
  sendSms: (...args: unknown[]) => mockSendSms(...args),
}));

vi.mock("@/lib/services/email-service", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

vi.mock("@/lib/repositories/salons", () => ({
  getSalonById: (...args: unknown[]) => mockGetSalonById(...args),
}));

vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("@/lib/services/waitlist-offer-flow", () => ({
  createAndSendWaitlistOffer: (...args: unknown[]) => mockCreateAndSendWaitlistOffer(...args),
}));

describe("Waitlist service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue([{ claim_expiry_minutes: 15 }]);
    mockCreateAndSendWaitlistOffer.mockResolvedValue({
      notified: true,
      entry: { id: "entry-1" },
      error: null,
      offerId: "offer-1",
    });
    mockGetAdminClient.mockReturnValue(buildAdminClient());
  });

  it("returns without notify when no match exists", async () => {
    const admin: any = buildAdminClient();
    admin.from = vi.fn((table: string) => {
      if (table === "waitlist_offers") {
        const pendingQuery = {
          eq: vi.fn(() => pendingQuery),
          maybeSingle: vi.fn(async () => ({ data: null, error: null })),
        };
        return {
          select: vi.fn(() => pendingQuery),
        };
      }
      if (table === "waitlist_entries") {
        const query = {
          select: vi.fn(() => query),
          eq: vi.fn(() => query),
          or: vi.fn(() => query),
          order: vi.fn(() => query),
          limit: vi.fn(async () => ({ data: [], error: null })),
        };
        return query;
      }
      return {};
    });
    mockGetAdminClient.mockReturnValue(admin);

    const result = await handleWaitlistCancellation(
      "salon-1",
      "service-1",
      "2026-03-12",
      "employee-1",
      "2026-03-12T19:35:00.000Z",
      "2026-03-12T20:05:00.000Z"
    );
    expect(result.notified).toBe(false);
    expect(mockSendSms).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sends SMS and email when waitlist match exists", async () => {
    mockGetSalonById.mockResolvedValue({
      data: { id: "salon-1", slug: "my-salon", current_period_end: null },
      error: null,
    });
    mockSendSms.mockResolvedValue({
      allowed: true,
      status: "sent",
      logId: "sms-log-1",
    });
    mockSendEmail.mockResolvedValue({ data: { id: "mail-1" }, error: null });

    const result = await handleWaitlistCancellation("salon-1", "service-1", "2026-03-12");

    expect(result.notified).toBe(true);
    expect(mockCreateAndSendWaitlistOffer).toHaveBeenCalledOnce();
  });
});
