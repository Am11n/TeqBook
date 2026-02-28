import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleWaitlistCancellation } from "@/lib/services/waitlist-cancellation";
import * as waitlistRepo from "@/lib/repositories/waitlist";

const mockSendSms = vi.fn();
const mockSendEmail = vi.fn();
const mockGetSalonById = vi.fn();

vi.mock("@/lib/repositories/waitlist");

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

describe("Waitlist service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns without notify when no match exists", async () => {
    vi.mocked(waitlistRepo.findMatchingWaitlistEntry).mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await handleWaitlistCancellation("salon-1", "service-1", "2026-03-12");
    expect(result.notified).toBe(false);
    expect(mockSendSms).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sends SMS and email when waitlist match exists", async () => {
    vi.mocked(waitlistRepo.findMatchingWaitlistEntry).mockResolvedValue({
      data: {
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
        status: "waiting",
        notified_at: null,
        expires_at: null,
        created_at: "2026-03-01T10:00:00.000Z",
      },
      error: null,
    });
    vi.mocked(waitlistRepo.updateWaitlistEntryStatus).mockResolvedValue({ error: null });
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
    expect(waitlistRepo.updateWaitlistEntryStatus).toHaveBeenCalledWith(
      "salon-1",
      "entry-1",
      "notified",
      expect.objectContaining({ from_status: "waiting" })
    );
    expect(mockSendSms).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });
});
