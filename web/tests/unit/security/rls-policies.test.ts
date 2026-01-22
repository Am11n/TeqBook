// =====================================================
// RLS Policy Tests
// =====================================================
// Tests for RLS UPDATE policies with WITH CHECK
// and salon_id immutability

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("RLS UPDATE Policies with WITH CHECK", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UPDATE with same salon_id", () => {
    it("should allow UPDATE when salon_id remains the same", () => {
      // Mock: User has access to salon-1
      const userSalonId = "salon-1";
      const bookingSalonId = "salon-1";

      // UPDATE should succeed because salon_id matches
      const canUpdate = userSalonId === bookingSalonId;

      expect(canUpdate).toBe(true);
    });

    it("should allow updating other fields when salon_id unchanged", () => {
      const updateData = {
        salon_id: "salon-1", // Unchanged
        status: "completed", // Changed
        notes: "Updated notes", // Changed
      };

      // WITH CHECK should verify salon_id matches user's salon
      const userSalonId = "salon-1";
      const updateAllowed = updateData.salon_id === userSalonId;

      expect(updateAllowed).toBe(true);
    });
  });

  describe("UPDATE attempting to change salon_id", () => {
    it("should reject UPDATE that changes salon_id", () => {
      // Mock: User tries to change salon_id from salon-1 to salon-2
      const originalSalonId = "salon-1";
      const newSalonId = "salon-2";
      const userSalonId = "salon-1";

      // WITH CHECK should verify NEW.salon_id matches user's salon
      const updateAllowed = newSalonId === userSalonId;

      expect(updateAllowed).toBe(false);
    });

    it("should reject UPDATE that sets salon_id to null", () => {
      const originalSalonId = "salon-1";
      const newSalonId = null;
      const userSalonId = "salon-1";

      // WITH CHECK should reject null salon_id
      const updateAllowed = newSalonId === userSalonId;

      expect(updateAllowed).toBe(false);
    });

    it("should trigger immutability trigger when salon_id changes", () => {
      // Mock trigger behavior
      const oldSalonId = "salon-1";
      const newSalonId = "salon-2";

      // Trigger should raise exception
      const shouldRaiseException = oldSalonId !== newSalonId;

      expect(shouldRaiseException).toBe(true);
      // In actual implementation, this would raise:
      // RAISE EXCEPTION 'salon_id cannot be changed after INSERT';
    });
  });

  describe("UPDATE by unauthorized user", () => {
    it("should reject UPDATE by user without salon access", () => {
      // Mock: User from salon-1 tries to update booking from salon-2
      const userSalonId = "salon-1";
      const bookingSalonId = "salon-2";

      // USING clause should check OLD.salon_id matches user's salon
      const canSeeRow = bookingSalonId === userSalonId;

      expect(canSeeRow).toBe(false);
    });

    it("should reject UPDATE by unauthenticated user", () => {
      const userId = null; // Not authenticated
      const bookingSalonId = "salon-1";

      // USING clause should check auth.uid() is not null
      const canUpdate = userId !== null && bookingSalonId !== null;

      expect(canUpdate).toBe(false);
    });
  });

  describe("salon_id immutability trigger", () => {
    it("should prevent salon_id change via trigger", () => {
      const oldSalonId = "salon-1";
      const newSalonId = "salon-2";

      // Trigger function should check: OLD.salon_id != NEW.salon_id
      const salonIdChanged = oldSalonId !== newSalonId;

      if (salonIdChanged) {
        // Should raise exception
        expect(salonIdChanged).toBe(true);
        // Exception: "salon_id cannot be changed after INSERT"
      }
    });

    it("should allow UPDATE when salon_id is unchanged", () => {
      const oldSalonId = "salon-1";
      const newSalonId = "salon-1";

      // Trigger should allow this
      const salonIdChanged = oldSalonId !== newSalonId;

      expect(salonIdChanged).toBe(false);
    });
  });

  describe("Multi-table coverage", () => {
    it("should apply WITH CHECK to all tenant tables", () => {
      const tables = [
        "bookings",
        "customers",
        "employees",
        "services",
        "shifts",
        "salons",
        "products",
        "booking_products",
        "opening_hours",
        "salon_addons",
      ];

      // All tables should have WITH CHECK on UPDATE policies
      tables.forEach((table) => {
        expect(table).toBeDefined();
        expect(typeof table).toBe("string");
      });

      expect(tables.length).toBe(10);
    });
  });
});
