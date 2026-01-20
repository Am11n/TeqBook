// =====================================================
// Shifts Repository Integration Tests
// =====================================================
// Tests for shifts repository + Supabase interactions
// Verifies CRUD operations, RLS policies, and employee relationships

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  isSupabaseConfigured,
  createTestSalon,
  createTestUser,
  createTestEmployee,
  createTestShift,
  cleanupTestSalon,
  cleanupTestUser,
  createUserClient,
  createServiceRoleClient,
  type TestSalon,
  type TestUser,
} from "./setup";

// Skip tests if Supabase is not configured
const describeIf = isSupabaseConfigured() ? describe : describe.skip;

describeIf("Shifts Repository Integration Tests", () => {
  let salon: TestSalon;
  let user: TestUser;
  let employeeId: string;
  let shiftId: string;

  beforeAll(async () => {
    // Create test salon and user
    salon = await createTestSalon(`Shifts Test Salon ${Date.now()}`);
    user = await createTestUser(`shifts-test-${Date.now()}@test.com`, { salonId: salon.id });

    // Create test data
    employeeId = await createTestEmployee(salon.id);
    shiftId = await createTestShift(salon.id, employeeId);
  });

  afterAll(async () => {
    await cleanupTestUser(user.id);
    await cleanupTestSalon(salon.id);
  });

  describe("getShiftsForCurrentSalon", () => {
    it("should fetch shifts with employee information", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error, count } = await client
        .from("shifts")
        .select("id, employee_id, weekday, start_time, end_time, employee:employees(full_name)", {
          count: "exact",
        })
        .eq("salon_id", salon.id)
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true })
        .range(0, 49);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThanOrEqual(1);

      const shift = data!.find((s) => s.id === shiftId);
      expect(shift).toBeDefined();
      expect(shift!.employee_id).toBe(employeeId);
      expect(shift!.employee).toBeDefined();
    });

    it("should only return shifts for the user's salon", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .select("id, salon_id");

      expect(error).toBeNull();

      if (data && data.length > 0) {
        for (const shift of data) {
          expect(shift.salon_id).toBe(salon.id);
        }
      }
    });
  });

  describe("createShift", () => {
    it("should create a new shift", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .insert({
          salon_id: salon.id,
          employee_id: employeeId,
          weekday: 2, // Tuesday
          start_time: "10:00",
          end_time: "18:00",
        })
        .select("id, employee_id, weekday, start_time, end_time, employee:employees(full_name)")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.weekday).toBe(2);
      expect(data!.start_time).toBe("10:00:00");
      expect(data!.end_time).toBe("18:00:00");

      // Cleanup
      if (data) {
        await client.from("shifts").delete().eq("id", data.id);
      }
    });

    it("should create shifts for all weekdays", async () => {
      const client = createUserClient(user.accessToken);
      const createdShiftIds: string[] = [];

      // Create shifts for each weekday (0-6)
      for (let weekday = 0; weekday <= 6; weekday++) {
        if (weekday === 1) continue; // Skip Monday, already exists

        const { data, error } = await client
          .from("shifts")
          .insert({
            salon_id: salon.id,
            employee_id: employeeId,
            weekday,
            start_time: "09:00",
            end_time: "17:00",
          })
          .select("id, weekday")
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data!.weekday).toBe(weekday);
        createdShiftIds.push(data!.id);
      }

      // Cleanup
      for (const id of createdShiftIds) {
        await client.from("shifts").delete().eq("id", id);
      }
    });

    it("should not create shift for another salon", async () => {
      const otherSalon = await createTestSalon(`Other Shift Salon ${Date.now()}`);
      const otherEmployeeId = await createTestEmployee(otherSalon.id);

      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .insert({
          salon_id: otherSalon.id,
          employee_id: otherEmployeeId,
          weekday: 3,
          start_time: "09:00",
          end_time: "17:00",
        })
        .select();

      expect(error).toBeDefined();

      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("updateShift", () => {
    it("should update shift times", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .update({
          start_time: "08:00",
          end_time: "16:00",
        })
        .eq("id", shiftId)
        .eq("salon_id", salon.id)
        .select("id, start_time, end_time")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.start_time).toBe("08:00:00");
      expect(data!.end_time).toBe("16:00:00");

      // Restore original times
      await client
        .from("shifts")
        .update({
          start_time: "09:00",
          end_time: "17:00",
        })
        .eq("id", shiftId);
    });

    it("should update shift weekday", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .update({ weekday: 3 }) // Wednesday
        .eq("id", shiftId)
        .eq("salon_id", salon.id)
        .select("id, weekday")
        .single();

      expect(error).toBeNull();
      expect(data!.weekday).toBe(3);

      // Restore original weekday
      await client
        .from("shifts")
        .update({ weekday: 1 })
        .eq("id", shiftId);
    });

    it("should not update shift from another salon", async () => {
      const otherSalon = await createTestSalon(`Update Shift Salon ${Date.now()}`);
      const otherUser = await createTestUser(`update-shift-${Date.now()}@test.com`, {
        salonId: otherSalon.id,
      });

      const client = createUserClient(otherUser.accessToken);

      const { data, error } = await client
        .from("shifts")
        .update({ weekday: 5 })
        .eq("id", shiftId)
        .select("id");

      expect(error).toBeNull();
      expect(data).toEqual([]);

      await cleanupTestUser(otherUser.id);
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("deleteShift", () => {
    it("should delete a shift", async () => {
      const serviceClient = createServiceRoleClient();
      const { data: newShift } = await serviceClient
        .from("shifts")
        .insert({
          salon_id: salon.id,
          employee_id: employeeId,
          weekday: 4, // Thursday
          start_time: "09:00",
          end_time: "17:00",
        })
        .select("id")
        .single();

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("shifts")
        .delete()
        .eq("id", newShift!.id)
        .eq("salon_id", salon.id);

      expect(error).toBeNull();

      const { data: checkData } = await client
        .from("shifts")
        .select("id")
        .eq("id", newShift!.id);

      expect(checkData).toEqual([]);
    });

    it("should not delete shift from another salon", async () => {
      const otherSalon = await createTestSalon(`Delete Shift Salon ${Date.now()}`);
      const otherEmployeeId = await createTestEmployee(otherSalon.id);
      const otherShiftId = await createTestShift(otherSalon.id, otherEmployeeId);

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("shifts")
        .delete()
        .eq("id", otherShiftId);

      expect(error).toBeNull();

      // Verify shift still exists
      const serviceClient = createServiceRoleClient();
      const { data: checkData } = await serviceClient
        .from("shifts")
        .select("id")
        .eq("id", otherShiftId);

      expect(checkData).toHaveLength(1);

      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("Shift Time Handling", () => {
    it("should handle various time formats", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .insert({
          salon_id: salon.id,
          employee_id: employeeId,
          weekday: 5, // Friday
          start_time: "07:30",
          end_time: "15:45",
        })
        .select("id, start_time, end_time")
        .single();

      expect(error).toBeNull();
      expect(data!.start_time).toBe("07:30:00");
      expect(data!.end_time).toBe("15:45:00");

      // Cleanup
      if (data) {
        await client.from("shifts").delete().eq("id", data.id);
      }
    });

    it("should handle early morning shifts", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .insert({
          salon_id: salon.id,
          employee_id: employeeId,
          weekday: 6, // Saturday
          start_time: "06:00",
          end_time: "14:00",
        })
        .select("id, start_time, end_time")
        .single();

      expect(error).toBeNull();
      expect(data!.start_time).toBe("06:00:00");
      expect(data!.end_time).toBe("14:00:00");

      // Cleanup
      if (data) {
        await client.from("shifts").delete().eq("id", data.id);
      }
    });

    it("should handle late evening shifts", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .insert({
          salon_id: salon.id,
          employee_id: employeeId,
          weekday: 0, // Sunday
          start_time: "14:00",
          end_time: "22:00",
        })
        .select("id, start_time, end_time")
        .single();

      expect(error).toBeNull();
      expect(data!.start_time).toBe("14:00:00");
      expect(data!.end_time).toBe("22:00:00");

      // Cleanup
      if (data) {
        await client.from("shifts").delete().eq("id", data.id);
      }
    });
  });

  describe("Employee-Shift Relationship", () => {
    it("should fetch shifts with employee details", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("shifts")
        .select(`
          id,
          weekday,
          start_time,
          end_time,
          employee:employees (
            id,
            full_name,
            email
          )
        `)
        .eq("id", shiftId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.employee).toBeDefined();
      // employee can be an array or single object depending on the query
      const employee = Array.isArray(data!.employee) 
        ? data!.employee[0] 
        : data!.employee;
      expect((employee as { id: string }).id).toBe(employeeId);
    });

    it("should filter shifts by employee", async () => {
      const serviceClient = createServiceRoleClient();

      // Create another employee with shifts
      const { data: anotherEmployee } = await serviceClient
        .from("employees")
        .insert({
          salon_id: salon.id,
          full_name: "Another Employee",
          email: "another@test.com",
        })
        .select("id")
        .single();

      const { data: anotherShift } = await serviceClient
        .from("shifts")
        .insert({
          salon_id: salon.id,
          employee_id: anotherEmployee!.id,
          weekday: 2,
          start_time: "10:00",
          end_time: "18:00",
        })
        .select("id")
        .single();

      const client = createUserClient(user.accessToken);

      const { data: filteredShifts, error } = await client
        .from("shifts")
        .select("id, employee_id")
        .eq("salon_id", salon.id)
        .eq("employee_id", employeeId);

      expect(error).toBeNull();
      expect(filteredShifts).toBeDefined();

      // All shifts should belong to the specified employee
      for (const shift of filteredShifts!) {
        expect(shift.employee_id).toBe(employeeId);
      }

      // Cleanup
      await serviceClient.from("shifts").delete().eq("id", anotherShift!.id);
      await serviceClient.from("employees").delete().eq("id", anotherEmployee!.id);
    });
  });
});
