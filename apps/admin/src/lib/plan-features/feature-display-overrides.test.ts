import { describe, expect, it } from "vitest";
import { getPlanFeatureDisplay } from "./feature-display-overrides";

describe("getPlanFeatureDisplay", () => {
  it("overrides WHATSAPP copy regardless of DB strings", () => {
    const d = getPlanFeatureDisplay({
      key: "WHATSAPP",
      name: "WhatsApp Integration",
      description: "WhatsApp support and notifications",
    });
    expect(d.name).toBe("WhatsApp");
    expect(d.description).toBe("Customer communication");
  });

  it("passes through when no override", () => {
    const d = getPlanFeatureDisplay({
      key: "BOOKINGS",
      name: "Bookings",
      description: "Create bookings",
    });
    expect(d).toEqual({ name: "Bookings", description: "Create bookings" });
  });
});
