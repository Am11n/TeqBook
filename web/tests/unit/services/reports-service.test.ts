import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTotalBookingsForSalon,
  getRevenueByMonthForSalon,
  getBookingsPerServiceForSalon,
  getCapacityUtilisationForSalon,
} from "@/lib/services/reports-service";
import * as reportsRepo from "@/lib/repositories/reports";
import * as featureFlagsService from "@/lib/services/feature-flags-service";

// Mock repositories and services
vi.mock("@/lib/repositories/reports");
vi.mock("@/lib/services/feature-flags-service");

describe("Reports Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTotalBookingsForSalon", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getTotalBookingsForSalon("");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(featureFlagsService.hasFeature)).not.toHaveBeenCalled();
      expect(vi.mocked(reportsRepo.getTotalBookings)).not.toHaveBeenCalled();
    });

    it("should return error if ADVANCED_REPORTS feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getTotalBookingsForSalon("salon-1");

      expect(result.error).toContain("ADVANCED_REPORTS feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getTotalBookings)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await getTotalBookingsForSalon("salon-1");

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getTotalBookings)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      const mockResult = {
        total: 100,
        confirmed: 80,
        cancelled: 10,
        completed: 10,
      };

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(reportsRepo.getTotalBookings).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await getTotalBookingsForSalon("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockResult);
      expect(vi.mocked(reportsRepo.getTotalBookings)).toHaveBeenCalledWith("salon-1", {
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        employeeId: undefined,
      });
    });

    it("should pass filters to repository", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(reportsRepo.getTotalBookings).mockResolvedValue({
        data: { total: 0, confirmed: 0, cancelled: 0, completed: 0 },
        error: null,
      });

      await getTotalBookingsForSalon("salon-1", {
        status: "confirmed",
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });

      expect(vi.mocked(reportsRepo.getTotalBookings)).toHaveBeenCalledWith("salon-1", {
        status: "confirmed",
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });
    });
  });

  describe("getRevenueByMonthForSalon", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getRevenueByMonthForSalon("");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getRevenueByMonth)).not.toHaveBeenCalled();
    });

    it("should return error if ADVANCED_REPORTS feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getRevenueByMonthForSalon("salon-1");

      expect(result.error).toContain("ADVANCED_REPORTS feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getRevenueByMonth)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await getRevenueByMonthForSalon("salon-1");

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getRevenueByMonth)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      const mockResult = [
        { month: "2025-01", revenue: 10000 },
        { month: "2025-02", revenue: 15000 },
      ];

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(reportsRepo.getRevenueByMonth).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await getRevenueByMonthForSalon("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockResult);
      expect(vi.mocked(reportsRepo.getRevenueByMonth)).toHaveBeenCalledWith("salon-1", {
        startDate: undefined,
        endDate: undefined,
        employeeId: undefined,
      });
    });

    it("should pass filters to repository", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(reportsRepo.getRevenueByMonth).mockResolvedValue({
        data: [],
        error: null,
      });

      await getRevenueByMonthForSalon("salon-1", {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });

      expect(vi.mocked(reportsRepo.getRevenueByMonth)).toHaveBeenCalledWith("salon-1", {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });
    });
  });

  describe("getBookingsPerServiceForSalon", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getBookingsPerServiceForSalon("");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getBookingsPerService)).not.toHaveBeenCalled();
    });

    it("should return error if ADVANCED_REPORTS feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getBookingsPerServiceForSalon("salon-1");

      expect(result.error).toContain("ADVANCED_REPORTS feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getBookingsPerService)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await getBookingsPerServiceForSalon("salon-1");

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getBookingsPerService)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      const mockResult = [
        { service_id: "service-1", service_name: "Haircut", count: 50 },
        { service_id: "service-2", service_name: "Color", count: 30 },
      ];

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(reportsRepo.getBookingsPerService).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await getBookingsPerServiceForSalon("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockResult);
      expect(vi.mocked(reportsRepo.getBookingsPerService)).toHaveBeenCalledWith("salon-1", {
        startDate: undefined,
        endDate: undefined,
        employeeId: undefined,
      });
    });
  });

  describe("getCapacityUtilisationForSalon", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getCapacityUtilisationForSalon("");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getCapacityUtilisation)).not.toHaveBeenCalled();
    });

    it("should return error if ADVANCED_REPORTS feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getCapacityUtilisationForSalon("salon-1");

      expect(result.error).toContain("ADVANCED_REPORTS feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getCapacityUtilisation)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await getCapacityUtilisationForSalon("salon-1");

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(reportsRepo.getCapacityUtilisation)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      const mockResult = {
        total_capacity: 100,
        utilised_capacity: 75,
        utilisation_percentage: 75,
      };

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(reportsRepo.getCapacityUtilisation).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await getCapacityUtilisationForSalon("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockResult);
      expect(vi.mocked(reportsRepo.getCapacityUtilisation)).toHaveBeenCalledWith("salon-1", {
        startDate: undefined,
        endDate: undefined,
        employeeId: undefined,
      });
    });
  });
});
