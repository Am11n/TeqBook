import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCustomer, updateCustomer } from "@/lib/services/customers-service";
import * as customersRepo from "@/lib/repositories/customers";

// Mock repository
vi.mock("@/lib/repositories/customers");

describe("Customers Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCustomer", () => {
    it("should validate required fields", async () => {
      const result = await createCustomer({
        salon_id: "",
        full_name: "John Doe",
        gdpr_consent: true,
      });

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });

    it("should call repository with valid input", async () => {
      const mockCustomer = {
        id: "customer-1",
        full_name: "John Doe",
        email: "john@example.com",
        phone: "12345678",
        notes: null,
        gdpr_consent: true,
      };

      vi.mocked(customersRepo.createCustomer).mockResolvedValue({
        data: mockCustomer,
        error: null,
      });

      const result = await createCustomer({
        salon_id: "salon-1",
        full_name: "John Doe",
        email: "john@example.com",
        gdpr_consent: true,
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCustomer);
      expect(customersRepo.createCustomer).toHaveBeenCalledOnce();
    });
  });

  describe("updateCustomer", () => {
    it("should validate required fields", async () => {
      const result = await updateCustomer("salon-1", "", {
        full_name: "John Doe",
      });

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });

    it("should call repository with valid input", async () => {
      const mockCustomer = {
        id: "customer-1",
        full_name: "John Doe Updated",
        email: "john@example.com",
        phone: "12345678",
        notes: null,
        gdpr_consent: true,
      };

      vi.mocked(customersRepo.updateCustomer).mockResolvedValue({
        data: mockCustomer,
        error: null,
      });

      const result = await updateCustomer("salon-1", "customer-1", {
        full_name: "John Doe Updated",
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCustomer);
      expect(customersRepo.updateCustomer).toHaveBeenCalledOnce();
    });
  });
});

