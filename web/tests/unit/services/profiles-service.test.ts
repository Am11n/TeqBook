import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProfileForUser,
  updatePreferencesForUser,
  updateProfile,
} from "@/lib/services/profiles-service";
import * as profilesRepo from "@/lib/repositories/profiles";

// Mock repository
vi.mock("@/lib/repositories/profiles");

describe("Profiles Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfileForUser", () => {
    it("should return error if userId is empty", async () => {
      const result = await getProfileForUser("");

      expect(result.error).toBe("User ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(profilesRepo.getProfileByUserId)).not.toHaveBeenCalled();
    });

    it("should call repository with valid userId", async () => {
      const mockProfile = {
        user_id: "user-1",
        salon_id: "salon-1",
        is_superadmin: false,
        role: "owner",
        preferred_language: "en",
      };

      vi.mocked(profilesRepo.getProfileByUserId).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await getProfileForUser("user-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProfile);
      expect(vi.mocked(profilesRepo.getProfileByUserId)).toHaveBeenCalledWith("user-1");
    });

    it("should return repository error", async () => {
      vi.mocked(profilesRepo.getProfileByUserId).mockResolvedValue({
        data: null,
        error: "Profile not found",
      });

      const result = await getProfileForUser("user-1");

      expect(result.error).toBe("Profile not found");
      expect(result.data).toBeNull();
    });
  });

  describe("updatePreferencesForUser", () => {
    it("should return error if userId is empty", async () => {
      const result = await updatePreferencesForUser("", {
        sidebarCollapsed: true,
      });

      expect(result.error).toBe("User ID is required");
      expect(vi.mocked(profilesRepo.updateUserPreferences)).not.toHaveBeenCalled();
    });

    it("should call repository with valid preferences", async () => {
      vi.mocked(profilesRepo.updateUserPreferences).mockResolvedValue({
        error: null,
      });

      const preferences = {
        sidebarCollapsed: true,
        notifications: {
          email: {
            bookingConfirmation: true,
            bookingReminder: false,
          },
        },
      };

      const result = await updatePreferencesForUser("user-1", preferences);

      expect(result.error).toBeNull();
      expect(vi.mocked(profilesRepo.updateUserPreferences)).toHaveBeenCalledWith("user-1", preferences);
    });

    it("should return repository error", async () => {
      vi.mocked(profilesRepo.updateUserPreferences).mockResolvedValue({
        error: "Database error",
      });

      const result = await updatePreferencesForUser("user-1", {
        sidebarCollapsed: true,
      });

      expect(result.error).toBe("Database error");
    });
  });

  describe("updateProfile", () => {
    it("should return error if userId is empty", async () => {
      const result = await updateProfile("", { first_name: "John" });

      expect(result.error).toBe("User ID is required");
      expect(vi.mocked(profilesRepo.updateProfile)).not.toHaveBeenCalled();
    });

    it("should return error if role is invalid", async () => {
      const result = await updateProfile("user-1", { role: "invalid" });

      expect(result.error).toBe("Invalid role. Must be owner, manager, or staff");
      expect(vi.mocked(profilesRepo.updateProfile)).not.toHaveBeenCalled();
    });

    it("should accept valid roles", async () => {
      vi.mocked(profilesRepo.updateProfile).mockResolvedValue({
        error: null,
      });

      for (const role of ["owner", "manager", "staff"]) {
        const result = await updateProfile("user-1", { role });
        expect(result.error).toBeNull();
      }

      expect(vi.mocked(profilesRepo.updateProfile)).toHaveBeenCalledTimes(3);
    });

    it("should return error if first_name exceeds 50 characters", async () => {
      const longName = "a".repeat(51);
      const result = await updateProfile("user-1", { first_name: longName });

      expect(result.error).toBe("First name must be 50 characters or less");
      expect(vi.mocked(profilesRepo.updateProfile)).not.toHaveBeenCalled();
    });

    it("should return error if last_name exceeds 50 characters", async () => {
      const longName = "a".repeat(51);
      const result = await updateProfile("user-1", { last_name: longName });

      expect(result.error).toBe("Last name must be 50 characters or less");
      expect(vi.mocked(profilesRepo.updateProfile)).not.toHaveBeenCalled();
    });

    it("should trim and allow 50 character names", async () => {
      const name = "a".repeat(50);
      vi.mocked(profilesRepo.updateProfile).mockResolvedValue({
        error: null,
      });

      const result = await updateProfile("user-1", { first_name: name });

      expect(result.error).toBeNull();
      expect(vi.mocked(profilesRepo.updateProfile)).toHaveBeenCalledWith("user-1", {
        first_name: name,
      });
    });

    it("should trim whitespace from names", async () => {
      vi.mocked(profilesRepo.updateProfile).mockResolvedValue({
        error: null,
      });

      const result = await updateProfile("user-1", {
        first_name: "  John  ",
        last_name: "  Doe  ",
      });

      expect(result.error).toBeNull();
      expect(vi.mocked(profilesRepo.updateProfile)).toHaveBeenCalledWith("user-1", {
        first_name: "John",
        last_name: "Doe",
      });
    });

    it("should handle null names", async () => {
      vi.mocked(profilesRepo.updateProfile).mockResolvedValue({
        error: null,
      });

      const result = await updateProfile("user-1", {
        first_name: "   ",
        last_name: null,
      });

      expect(result.error).toBeNull();
      expect(vi.mocked(profilesRepo.updateProfile)).toHaveBeenCalledWith("user-1", {
        first_name: null,
        last_name: null,
      });
    });

    it("should call repository with all valid updates", async () => {
      vi.mocked(profilesRepo.updateProfile).mockResolvedValue({
        error: null,
      });

      const updates = {
        preferred_language: "nb",
        role: "manager",
        first_name: "John",
        last_name: "Doe",
        avatar_url: "https://example.com/avatar.jpg",
      };

      const result = await updateProfile("user-1", updates);

      expect(result.error).toBeNull();
      expect(vi.mocked(profilesRepo.updateProfile)).toHaveBeenCalledWith("user-1", updates);
    });

    it("should return repository error", async () => {
      vi.mocked(profilesRepo.updateProfile).mockResolvedValue({
        error: "Database error",
      });

      const result = await updateProfile("user-1", { first_name: "John" });

      expect(result.error).toBe("Database error");
    });
  });
});
