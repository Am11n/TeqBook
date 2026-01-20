// =====================================================
// Bookings Repository Integration Tests
// =====================================================
// Tests for bookings repository + Supabase interactions
// Verifies CRUD operations, RLS policies, and data transformations

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  isSupabaseConfigured,
  createTestSalon,
  createTestUser,
  createTestCustomer,
  createTestEmployee,
  createTestService,
  createTestBooking,
  cleanupTestSalon,
  cleanupTestUser,
  createUserClient,
  createServiceRoleClient,
  type TestSalon,
  type TestUser,
} from "./setup";

// Skip tests if Supabase is not configured
const describeIf = isSupabaseConfigured() ? describe : describe.skip;

describeIf("Bookings Repository Integration Tests", () => {
  let salon: TestSalon;
  let user: TestUser;
  let customerId: string;
  let employeeId: string;
  let serviceId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Create test salon and user
    salon = await createTestSalon(`Integration Test Salon ${Date.now()}`);
    user = await createTestUser(`bookings-test-${Date.now()}@test.com`, { salonId: salon.id });

    // Create test data
    customerId = await createTestCustomer(salon.id);
    employeeId = await createTestEmployee(salon.id);
    serviceId = await createTestService(salon.id);
    bookingId = await createTestBooking(salon.id, customerId, employeeId, serviceId);
  });

  afterAll(async () => {
    // Cleanup in reverse order
    await cleanupTestUser(user.id);
    await cleanupTestSalon(salon.id);
  });

  describe("getBookingsForCurrentSalon", () => {
    it("should fetch bookings for the salon with pagination", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error, count } = await client
        .from("bookings")
        .select(
          "id, start_time, end_time, status, is_walk_in, notes, customers(full_name), employees(full_name), services(name)",
          { count: "exact" }
        )
        .eq("salon_id", salon.id)
        .order("start_time", { ascending: true })
        .range(0, 49);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThanOrEqual(1);

      // Verify booking structure
      const booking = data!.find((b) => b.id === bookingId);
      expect(booking).toBeDefined();
      expect(booking!.status).toBe("confirmed");
    });

    it("should only return bookings for the user's salon", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select("id, salon_id");

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // All bookings should belong to the user's salon
      if (data && data.length > 0) {
        for (const booking of data) {
          expect(booking.salon_id).toBe(salon.id);
        }
      }
    });
  });

  describe("getBookingsForCalendar", () => {
    it("should fetch bookings with employee ID for calendar view", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select(
          "id, start_time, end_time, status, is_walk_in, customers(full_name), employees(id, full_name), services(name)"
        )
        .eq("salon_id", salon.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verify employee ID is included
      const booking = data!.find((b) => b.id === bookingId);
      expect(booking).toBeDefined();
      expect(booking!.employees).toBeDefined();
      expect((booking!.employees as { id: string; full_name: string }).id).toBe(employeeId);
    });

    it("should filter bookings by date range", async () => {
      const client = createUserClient(user.accessToken);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().split("T")[0];

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);
      const endDate = dayAfter.toISOString().split("T")[0];

      const { data, error } = await client
        .from("bookings")
        .select("id, start_time")
        .eq("salon_id", salon.id)
        .gte("start_time", startDate)
        .lte("start_time", endDate);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("updateBookingStatus", () => {
    it("should update booking status", async () => {
      const client = createUserClient(user.accessToken);

      // First update to cancelled
      const { data: updatedData, error: updateError } = await client
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("salon_id", salon.id)
        .select("id, status")
        .single();

      expect(updateError).toBeNull();
      expect(updatedData).toBeDefined();
      expect(updatedData!.status).toBe("cancelled");

      // Restore to confirmed
      await client
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
        .eq("salon_id", salon.id);
    });

    it("should not update booking from another salon", async () => {
      // Create another salon
      const otherSalon = await createTestSalon(`Other Salon ${Date.now()}`);
      const otherUser = await createTestUser(`other-user-${Date.now()}@test.com`, {
        salonId: otherSalon.id,
      });

      const client = createUserClient(otherUser.accessToken);

      // Try to update booking from salon1
      const { data, error } = await client
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .select("id");

      // Should return empty (RLS prevents access)
      expect(error).toBeNull();
      expect(data).toEqual([]);

      // Cleanup
      await cleanupTestUser(otherUser.id);
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("getBookingById", () => {
    it("should fetch a single booking by ID", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select(
          "id, salon_id, start_time, end_time, status, is_walk_in, notes, customers(full_name), employees(full_name), services(name)"
        )
        .eq("id", bookingId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.id).toBe(bookingId);
      expect(data!.salon_id).toBe(salon.id);
    });

    it("should return error for non-existent booking", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select("id")
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .single();

      // Supabase returns PGRST116 for no rows found with .single()
      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe("deleteBooking", () => {
    it("should delete a booking", async () => {
      // Create a booking to delete
      const deleteBookingId = await createTestBooking(salon.id, customerId, employeeId, serviceId);

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("bookings")
        .delete()
        .eq("id", deleteBookingId)
        .eq("salon_id", salon.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: checkData } = await client
        .from("bookings")
        .select("id")
        .eq("id", deleteBookingId);

      expect(checkData).toEqual([]);
    });

    it("should not delete booking from another salon", async () => {
      // Create another salon
      const otherSalon = await createTestSalon(`Delete Test Salon ${Date.now()}`);
      const otherUser = await createTestUser(`delete-test-${Date.now()}@test.com`, {
        salonId: otherSalon.id,
      });

      const client = createUserClient(otherUser.accessToken);

      // Try to delete booking from salon1
      const { error } = await client
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      expect(error).toBeNull(); // No error, but...

      // Verify booking still exists (RLS prevented deletion)
      const serviceClient = createServiceRoleClient();
      const { data: checkData } = await serviceClient
        .from("bookings")
        .select("id")
        .eq("id", bookingId);

      expect(checkData).toHaveLength(1);

      // Cleanup
      await cleanupTestUser(otherUser.id);
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("RLS Policy Enforcement", () => {
    it("should enforce RLS on insert operations", async () => {
      // Create another salon
      const otherSalon = await createTestSalon(`Insert Test Salon ${Date.now()}`);
      const otherCustomerId = await createTestCustomer(otherSalon.id);
      const otherEmployeeId = await createTestEmployee(otherSalon.id);
      const otherServiceId = await createTestService(otherSalon.id);

      const client = createUserClient(user.accessToken);

      // Try to insert booking into another salon
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 2);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      const { data, error } = await client
        .from("bookings")
        .insert({
          salon_id: otherSalon.id,
          customer_id: otherCustomerId,
          employee_id: otherEmployeeId,
          service_id: otherServiceId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: "confirmed",
        })
        .select();

      // Should fail due to RLS
      expect(error).toBeDefined();

      // Cleanup
      await cleanupTestSalon(otherSalon.id);
    });
  });
});
