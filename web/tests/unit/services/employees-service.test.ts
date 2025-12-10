import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEmployee, updateEmployee } from "@/lib/services/employees-service";
import * as employeesRepo from "@/lib/repositories/employees";

// Mock repository
vi.mock("@/lib/repositories/employees");

describe("Employees Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEmployee", () => {
    it("should validate required fields", async () => {
      const result = await createEmployee({
        salon_id: "",
        full_name: "Jane Smith",
      });

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });

    it("should validate email format", async () => {
      const result = await createEmployee({
        salon_id: "salon-1",
        full_name: "Jane Smith",
        email: "invalid-email",
      });

      expect(result.error).toBe("Invalid email format");
      expect(result.data).toBeNull();
    });

    it("should call repository with valid input", async () => {
      const mockEmployee = {
        id: "employee-1",
        full_name: "Jane Smith",
        email: "jane@example.com",
        phone: "12345678",
        role: "staff",
        preferred_language: "en",
        is_active: true,
      };

      vi.mocked(employeesRepo.createEmployee).mockResolvedValue({
        data: mockEmployee,
        error: null,
      });

      const result = await createEmployee({
        salon_id: "salon-1",
        full_name: "Jane Smith",
        email: "jane@example.com",
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockEmployee);
      expect(employeesRepo.createEmployee).toHaveBeenCalledOnce();
    });
  });

  describe("updateEmployee", () => {
    it("should validate required fields", async () => {
      const result = await updateEmployee("salon-1", "", {
        full_name: "Jane Smith",
      });

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });

    it("should validate email format", async () => {
      const result = await updateEmployee("salon-1", "employee-1", {
        email: "invalid-email",
      });

      expect(result.error).toBe("Invalid email format");
      expect(result.data).toBeNull();
    });

    it("should call repository with valid input", async () => {
      const mockEmployee = {
        id: "employee-1",
        full_name: "Jane Smith Updated",
        email: "jane@example.com",
        phone: "12345678",
        role: "staff",
        preferred_language: "en",
        is_active: true,
      };

      vi.mocked(employeesRepo.updateEmployee).mockResolvedValue({
        data: mockEmployee,
        error: null,
      });

      const result = await updateEmployee("salon-1", "employee-1", {
        full_name: "Jane Smith Updated",
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockEmployee);
      expect(employeesRepo.updateEmployee).toHaveBeenCalledOnce();
    });
  });
});

