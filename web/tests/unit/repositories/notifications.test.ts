// =====================================================
// Notifications Repository Tests
// =====================================================
// Tests for notification CRUD operations

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockSingle = vi.fn();
const mockRpc = vi.fn();

const mockSupabaseClient = {
  from: mockFrom,
  rpc: mockRpc,
};

vi.mock("@/lib/supabase-client", () => ({
  createServerClient: () => Promise.resolve(mockSupabaseClient),
}));

describe("Notifications Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset chain methods
    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    });
    mockInsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    });
    mockOrder.mockReturnValue({
      range: mockRange,
      eq: mockEq,
    });
    mockRange.mockReturnValue({
      data: [],
      error: null,
    });
    mockSingle.mockReturnValue({
      data: null,
      error: null,
    });
  });

  describe("createNotification", () => {
    it("should create notification with correct fields", async () => {
      const mockNotification = {
        id: "notif-123",
        user_id: "user-123",
        salon_id: "salon-123",
        type: "booking",
        title: "Booking Confirmed",
        body: "Your appointment has been confirmed.",
        read: false,
        metadata: { booking_id: "booking-123" },
        action_url: "/bookings?id=booking-123",
        created_at: "2026-01-21T12:00:00Z",
      };

      mockSingle.mockReturnValue({
        data: mockNotification,
        error: null,
      });

      const { createNotification } = await import("@/lib/repositories/notifications");

      const result = await createNotification({
        user_id: "user-123",
        salon_id: "salon-123",
        type: "booking",
        title: "Booking Confirmed",
        body: "Your appointment has been confirmed.",
        metadata: { booking_id: "booking-123" },
        action_url: "/bookings?id=booking-123",
      });

      expect(mockFrom).toHaveBeenCalledWith("notifications");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          salon_id: "salon-123",
          type: "booking",
          title: "Booking Confirmed",
          read: false,
        })
      );
      expect(result.data).toEqual(mockNotification);
      expect(result.error).toBeNull();
    });

    it("should handle creation errors", async () => {
      mockSingle.mockReturnValue({
        data: null,
        error: { message: "Database error" },
      });

      const { createNotification } = await import("@/lib/repositories/notifications");

      const result = await createNotification({
        user_id: "user-123",
        type: "booking",
        title: "Test",
        body: "Test body",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe("Database error");
    });
  });

  describe("getNotificationsForUser", () => {
    it("should fetch notifications with pagination", async () => {
      const mockNotifications = [
        { id: "notif-1", user_id: "user-123", type: "booking", title: "Test 1", body: "Body 1", read: false },
        { id: "notif-2", user_id: "user-123", type: "booking", title: "Test 2", body: "Body 2", read: true },
      ];

      mockRange.mockReturnValue({
        data: mockNotifications,
        error: null,
      });

      const { getNotificationsForUser } = await import("@/lib/repositories/notifications");

      const result = await getNotificationsForUser("user-123", { limit: 20, offset: 0 });

      expect(mockFrom).toHaveBeenCalledWith("notifications");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(0, 19);
      expect(result.data).toEqual(mockNotifications);
    });

    it("should filter unread only when specified", async () => {
      mockRange.mockReturnValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({
        eq: mockEq,
        order: mockOrder,
      });

      const { getNotificationsForUser } = await import("@/lib/repositories/notifications");

      await getNotificationsForUser("user-123", { unreadOnly: true });

      // Should call eq twice: once for user_id, once for read=false
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockEq).toHaveBeenCalledWith("read", false);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count from database function", async () => {
      mockRpc.mockResolvedValue({
        data: 5,
        error: null,
      });

      const { getUnreadCount } = await import("@/lib/repositories/notifications");

      const result = await getUnreadCount("user-123");

      expect(mockRpc).toHaveBeenCalledWith("get_unread_notification_count", {
        p_user_id: "user-123",
      });
      expect(result.data).toBe(5);
      expect(result.error).toBeNull();
    });

    it("should fallback to count query if function fails", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Function not found" },
      });

      // Mock count query fallback
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            count: 3,
            error: null,
          }),
        }),
      });

      const { getUnreadCount } = await import("@/lib/repositories/notifications");

      const result = await getUnreadCount("user-123");

      // Should attempt RPC first
      expect(mockRpc).toHaveBeenCalled();
    });
  });

  describe("markAsRead", () => {
    it("should update notification read status", async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null,
        }),
      });

      const { markAsRead } = await import("@/lib/repositories/notifications");

      const result = await markAsRead("notif-123", "user-123");

      expect(mockFrom).toHaveBeenCalledWith("notifications");
      expect(mockUpdate).toHaveBeenCalledWith({ read: true });
      expect(mockEq).toHaveBeenCalledWith("id", "notif-123");
      expect(result.error).toBeNull();
    });
  });

  describe("markAllAsRead", () => {
    it("should call database function to mark all as read", async () => {
      mockRpc.mockResolvedValue({
        data: 5,
        error: null,
      });

      const { markAllAsRead } = await import("@/lib/repositories/notifications");

      const result = await markAllAsRead("user-123");

      expect(mockRpc).toHaveBeenCalledWith("mark_all_notifications_read", {
        p_user_id: "user-123",
      });
      expect(result.data).toBe(5);
      expect(result.error).toBeNull();
    });
  });

  describe("deleteNotification", () => {
    it("should delete notification for user", async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null,
        }),
      });

      const { deleteNotification } = await import("@/lib/repositories/notifications");

      const result = await deleteNotification("notif-123", "user-123");

      expect(mockFrom).toHaveBeenCalledWith("notifications");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "notif-123");
      expect(result.error).toBeNull();
    });
  });
});
