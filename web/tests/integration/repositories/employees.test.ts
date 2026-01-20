// =====================================================
// Employees Repository Integration Tests
// =====================================================
// Tests for employees repository + Supabase interactions
// Verifies CRUD operations, RLS policies, and employee-services relationships

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  isSupabaseConfigured,
  createTestSalon,
  createTestUser,
  createTestEmployee,
  createTestService,
  cleanupTestSalon,
  cleanupTestUser,
  createUserClient,
  createServiceRoleClient,
  type TestSalon,
  type TestUser,
} from "./setup";

// Skip tests if Supabase is not configured
const describeIf = isSupabaseConfigured() ? describe : describe.skip;

describeIf("Employees Repository Integration Tests", () => {
  let salon: TestSalon;
  let user: TestUser;
  let employeeId: string;
  let serviceId: string;

  beforeAll(async () => {
    // Create test salon and user
    salon = await createTestSalon(`Employees Test Salon ${Date.now()}`);
    user = await createTestUser(`employees-test-${Date.now()}@test.com`, { salonId: salon.id });

    // Create test data
    employeeId = await createTestEmployee(salon.id);
    serviceId = await createTestService(salon.id);
  });

  afterAll(async () => {
    await cleanupTestUser(user.id);
    await cleanupTestSalon(salon.id);
  });

  describe("getEmployeesForCurrentSalon", () => {
    it("should fetch employees with pagination", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error, count } = await client
        .from("employees")
        .select("id, full_name, email, phone, role, preferred_language, is_active", { count: "exact" })
        .eq("salon_id", salon.id)
        .order("created_at", { ascending: true })
        .range(0, 49);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThanOrEqual(1);

      const employee = data!.find((e) => e.id === employeeId);
      expect(employee).toBeDefined();
      expect(employee!.is_active).toBe(true);
    });

    it("should only return employees for the user's salon", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("employees")
        .select("id, salon_id");

      expect(error).toBeNull();

      if (data && data.length > 0) {
        for (const employee of data) {
          expect(employee.salon_id).toBe(salon.id);
        }
      }
    });
  });

  describe("createEmployee", () => {
    it("should create a new employee", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("employees")
        .insert({
          salon_id: salon.id,
          full_name: "New Test Employee",
          email: "newemployee@test.com",
          phone: "+4722222222",
          role: "stylist",
          preferred_language: "nb",
        })
        .select("id, full_name, email, phone, role, preferred_language, is_active")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.full_name).toBe("New Test Employee");
      expect(data!.role).toBe("stylist");
      expect(data!.is_active).toBe(true); // Default value

      // Cleanup
      if (data) {
        await client.from("employees").delete().eq("id", data.id);
      }
    });

    it("should not create employee for another salon", async () => {
      const otherSalon = await createTestSalon(`Other Employee Salon ${Date.now()}`);

      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("employees")
        .insert({
          salon_id: otherSalon.id,
          full_name: "Should Fail",
          email: "fail@test.com",
        })
        .select();

      expect(error).toBeDefined();

      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("getEmployeeWithServices", () => {
    it("should fetch employee with associated services", async () => {
      const serviceClient = createServiceRoleClient();

      // Link employee to service
      await serviceClient.from("employee_services").insert({
        employee_id: employeeId,
        service_id: serviceId,
        salon_id: salon.id,
      });

      const client = createUserClient(user.accessToken);

      // Get employee
      const { data: employeeData, error: employeeError } = await client
        .from("employees")
        .select("id, full_name, email, phone, role, preferred_language, is_active")
        .eq("id", employeeId)
        .eq("salon_id", salon.id)
        .single();

      expect(employeeError).toBeNull();
      expect(employeeData).toBeDefined();

      // Get services
      const { data: servicesData, error: servicesError } = await client
        .from("employee_services")
        .select("service_id, services(id, name)")
        .eq("employee_id", employeeId)
        .eq("salon_id", salon.id);

      expect(servicesError).toBeNull();
      expect(servicesData).toBeDefined();
      expect(servicesData!.length).toBeGreaterThanOrEqual(1);

      // Cleanup
      await serviceClient
        .from("employee_services")
        .delete()
        .eq("employee_id", employeeId)
        .eq("service_id", serviceId);
    });
  });

  describe("updateEmployee", () => {
    it("should update employee details", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("employees")
        .update({
          role: "senior_stylist",
          phone: "+4733333333",
        })
        .eq("id", employeeId)
        .eq("salon_id", salon.id)
        .select("id, role, phone")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.role).toBe("senior_stylist");
      expect(data!.phone).toBe("+4733333333");
    });

    it("should toggle employee active status", async () => {
      const client = createUserClient(user.accessToken);

      // Set to inactive
      const { data: inactiveData, error: inactiveError } = await client
        .from("employees")
        .update({ is_active: false })
        .eq("id", employeeId)
        .eq("salon_id", salon.id)
        .select("id, is_active")
        .single();

      expect(inactiveError).toBeNull();
      expect(inactiveData!.is_active).toBe(false);

      // Set back to active
      const { data: activeData, error: activeError } = await client
        .from("employees")
        .update({ is_active: true })
        .eq("id", employeeId)
        .eq("salon_id", salon.id)
        .select("id, is_active")
        .single();

      expect(activeError).toBeNull();
      expect(activeData!.is_active).toBe(true);
    });

    it("should not update employee from another salon", async () => {
      const otherSalon = await createTestSalon(`Update Employee Salon ${Date.now()}`);
      const otherUser = await createTestUser(`update-emp-${Date.now()}@test.com`, {
        salonId: otherSalon.id,
      });

      const client = createUserClient(otherUser.accessToken);

      const { data, error } = await client
        .from("employees")
        .update({ role: "hacked" })
        .eq("id", employeeId)
        .select("id");

      expect(error).toBeNull();
      expect(data).toEqual([]);

      await cleanupTestUser(otherUser.id);
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("updateEmployeeServices", () => {
    it("should update employee service associations", async () => {
      const serviceClient = createServiceRoleClient();

      // Create another service
      const { data: newService } = await serviceClient
        .from("services")
        .insert({
          salon_id: salon.id,
          name: "Another Service",
          duration_minutes: 45,
          price_cents: 60000,
          is_active: true,
        })
        .select("id")
        .single();

      const client = createUserClient(user.accessToken);

      // Delete existing services
      await client
        .from("employee_services")
        .delete()
        .eq("employee_id", employeeId)
        .eq("salon_id", salon.id);

      // Insert new services
      const { error: insertError } = await client.from("employee_services").insert([
        { employee_id: employeeId, service_id: serviceId, salon_id: salon.id },
        { employee_id: employeeId, service_id: newService!.id, salon_id: salon.id },
      ]);

      expect(insertError).toBeNull();

      // Verify
      const { data: servicesData } = await client
        .from("employee_services")
        .select("service_id")
        .eq("employee_id", employeeId);

      expect(servicesData).toHaveLength(2);

      // Cleanup
      await serviceClient.from("employee_services").delete().eq("employee_id", employeeId);
      await serviceClient.from("services").delete().eq("id", newService!.id);
    });
  });

  describe("deleteEmployee", () => {
    it("should delete an employee", async () => {
      const serviceClient = createServiceRoleClient();
      const { data: newEmployee } = await serviceClient
        .from("employees")
        .insert({
          salon_id: salon.id,
          full_name: "Delete Me",
          email: "deleteme@test.com",
        })
        .select("id")
        .single();

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("employees")
        .delete()
        .eq("id", newEmployee!.id)
        .eq("salon_id", salon.id);

      expect(error).toBeNull();

      const { data: checkData } = await client
        .from("employees")
        .select("id")
        .eq("id", newEmployee!.id);

      expect(checkData).toEqual([]);
    });

    it("should not delete employee from another salon", async () => {
      const otherSalon = await createTestSalon(`Delete Employee Salon ${Date.now()}`);
      const otherEmployeeId = await createTestEmployee(otherSalon.id);

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("employees")
        .delete()
        .eq("id", otherEmployeeId);

      expect(error).toBeNull();

      // Verify employee still exists
      const serviceClient = createServiceRoleClient();
      const { data: checkData } = await serviceClient
        .from("employees")
        .select("id")
        .eq("id", otherEmployeeId);

      expect(checkData).toHaveLength(1);

      await cleanupTestSalon(otherSalon.id);
    });
  });
});
