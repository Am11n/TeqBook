import { describe, it, expect } from "vitest";
import { renderNotificationTemplate } from "./notification-templates";

describe("renderNotificationTemplate", () => {
  it("interpolates single-brace placeholders for new_booking (nb)", () => {
    const r = renderNotificationTemplate(
      "new_booking",
      {
        customerName: "Ola",
        serviceName: "Hårklipp",
        startTime: "2026-06-15T10:00:00.000Z",
        timezone: "Europe/Oslo",
      },
      "nb",
    );
    expect(r.title).toBeTruthy();
    expect(r.body).toContain("Ola");
    expect(r.body).toContain("Hårklipp");
    expect(r.body).not.toMatch(/\{serviceName\}/);
    expect(r.body).not.toMatch(/\{customerName\}/);
  });

  it("interpolates for booking_cancelled (ar)", () => {
    const r = renderNotificationTemplate(
      "booking_cancelled",
      {
        serviceName: "Cut",
        startTime: "2026-06-15T10:00:00.000Z",
        timezone: "UTC",
      },
      "ar",
    );
    expect(r.body).toContain("Cut");
    expect(r.body).not.toMatch(/\{serviceName\}/);
  });
});
