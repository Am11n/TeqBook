import { describe, it, expect, vi, beforeEach } from "vitest";
import { getShiftsForSalon, createShift, deleteShift } from "@/lib/services/shifts-service";
import * as shiftsRepo from "@/lib/repositories/shifts";
import * as featureFlagsService from "@/lib/services/feature-flags-service";

// Mock repositories and services
vi.mock("@/lib/repositories/shifts");
vi.mock("@/lib/services/feature-flags-service");

describe("Shifts Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getShiftsForSalon", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getShiftsForSalon("");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(featureFlagsService.hasFeature)).not.toHaveBeenCalled();
      expect(vi.mocked(shiftsRepo.getShiftsForCurrentSalon)).not.toHaveBeenCalled();
    });

    it("should return error if SHIFTS feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getShiftsForSalon("salon-1");

      expect(result.error).toContain("SHIFTS feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.getShiftsForCurrentSalon)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await getShiftsForSalon("salon-1");

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.getShiftsForCurrentSalon)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      const mockShifts = [
        {
          id: "shift-1",
          salon_id: "salon-1",
          employee_id: "employee-1",
          weekday: 1,
          start_time: "09:00",
          end_time: "17:00",
        },
      ];

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(shiftsRepo.getShiftsForCurrentSalon).mockResolvedValue({
        data: mockShifts,
        error: null,
        total: 1,
      });

      const result = await getShiftsForSalon("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShifts);
      expect(result.total).toBe(1);
      expect(vi.mocked(featureFlagsService.hasFeature)).toHaveBeenCalledWith("salon-1", "SHIFTS");
      expect(vi.mocked(shiftsRepo.getShiftsForCurrentSalon)).toHaveBeenCalledWith("salon-1", undefined);
    });

    it("should pass pagination options to repository", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(shiftsRepo.getShiftsForCurrentSalon).mockResolvedValue({
        data: [],
        error: null,
        total: 0,
      });

      await getShiftsForSalon("salon-1", { page: 2, pageSize: 10 });

      expect(vi.mocked(shiftsRepo.getShiftsForCurrentSalon)).toHaveBeenCalledWith("salon-1", {
        page: 2,
        pageSize: 10,
      });
    });
  });

  describe("createShift", () => {
    it("should return error if required fields are missing", async () => {
      const result = await createShift({
        salon_id: "",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toBe("All required fields must be provided");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should return error if weekday is invalid (less than 0)", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createShift({
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: -1,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toBe("Weekday must be between 0 (Sunday) and 6 (Saturday)");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should return error if weekday is invalid (greater than 6)", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createShift({
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 7,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toBe("Weekday must be between 0 (Sunday) and 6 (Saturday)");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should return error if time format is invalid", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createShift({
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "invalid",
        end_time: "17:00",
      });

      expect(result.error).toBe("Invalid time format. Use HH:MM format");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should return error if end time is before or equal to start time", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createShift({
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "17:00",
        end_time: "09:00",
      });

      expect(result.error).toBe("End time must be after start time");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should return error if end time equals start time", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createShift({
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "09:00",
      });

      expect(result.error).toBe("End time must be after start time");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should return error if SHIFTS feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await createShift({
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toContain("SHIFTS feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await createShift({
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(shiftsRepo.createShift)).not.toHaveBeenCalled();
    });

    it("should call repository with valid input", async () => {
      const mockShift = {
        id: "shift-1",
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(shiftsRepo.createShift).mockResolvedValue({
        data: mockShift,
        error: null,
      });

      const input = {
        salon_id: "salon-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      };

      const result = await createShift(input);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShift);
      expect(vi.mocked(shiftsRepo.createShift)).toHaveBeenCalledWith(input);
    });
  });

  describe("deleteShift", () => {
    it("should return error if salonId is empty", async () => {
      const result = await deleteShift("", "shift-1");

      expect(result.error).toBe("Salon ID and Shift ID are required");
      expect(vi.mocked(shiftsRepo.deleteShift)).not.toHaveBeenCalled();
    });

    it("should return error if shiftId is empty", async () => {
      const result = await deleteShift("salon-1", "");

      expect(result.error).toBe("Salon ID and Shift ID are required");
      expect(vi.mocked(shiftsRepo.deleteShift)).not.toHaveBeenCalled();
    });

    it("should return error if SHIFTS feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await deleteShift("salon-1", "shift-1");

      expect(result.error).toContain("SHIFTS feature is not available");
      expect(vi.mocked(shiftsRepo.deleteShift)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await deleteShift("salon-1", "shift-1");

      expect(result.error).toBe("Feature check failed");
      expect(vi.mocked(shiftsRepo.deleteShift)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(shiftsRepo.deleteShift).mockResolvedValue({
        error: null,
      });

      const result = await deleteShift("salon-1", "shift-1");

      expect(result.error).toBeNull();
      expect(vi.mocked(shiftsRepo.deleteShift)).toHaveBeenCalledWith("salon-1", "shift-1");
    });

    it("should return repository error", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(shiftsRepo.deleteShift).mockResolvedValue({
        error: "Shift not found",
      });

      const result = await deleteShift("salon-1", "shift-1");

      expect(result.error).toBe("Shift not found");
    });
  });
});
