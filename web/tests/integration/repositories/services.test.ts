// =====================================================
// Services Repository Integration Tests
// =====================================================
// Tests for services repository + Supabase interactions
// Verifies CRUD operations, RLS policies, and data transformations

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  isSupabaseConfigured,
  createTestSalon,
  createTestUser,
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

describeIf("Services Repository Integration Tests", () => {
  let salon: TestSalon;
  let user: TestUser;
  let serviceId: string;

  beforeAll(async () => {
    // Create test salon and user
    salon = await createTestSalon(`Services Test Salon ${Date.now()}`);
    user = await createTestUser(`services-test-${Date.now()}@test.com`, { salonId: salon.id });

    // Create test service
    serviceId = await createTestService(salon.id);
  });

  afterAll(async () => {
    await cleanupTestUser(user.id);
    await cleanupTestSalon(salon.id);
  });

  describe("getServicesForCurrentSalon", () => {
    it("should fetch services with pagination and ordering", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error, count } = await client
        .from("services")
        .select("id, name, category, duration_minutes, price_cents, sort_order, is_active", { count: "exact" })
        .eq("salon_id", salon.id)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true })
        .range(0, 49);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThanOrEqual(1);

      const service = data!.find((s) => s.id === serviceId);
      expect(service).toBeDefined();
      expect(service!.is_active).toBe(true);
    });

    it("should only return services for the user's salon", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .select("id, salon_id");

      expect(error).toBeNull();

      if (data && data.length > 0) {
        for (const service of data) {
          expect(service.salon_id).toBe(salon.id);
        }
      }
    });
  });

  describe("getActiveServicesForCurrentSalon", () => {
    it("should only fetch active services", async () => {
      const serviceClient = createServiceRoleClient();

      // Create an inactive service
      const { data: inactiveService } = await serviceClient
        .from("services")
        .insert({
          salon_id: salon.id,
          name: "Inactive Service",
          duration_minutes: 30,
          price_cents: 30000,
          is_active: false,
        })
        .select("id")
        .single();

      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .select("id, name, is_active")
        .eq("salon_id", salon.id)
        .eq("is_active", true);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Should not include inactive service
      const inactiveInResults = data!.find((s) => s.id === inactiveService!.id);
      expect(inactiveInResults).toBeUndefined();

      // Cleanup
      await serviceClient.from("services").delete().eq("id", inactiveService!.id);
    });
  });

  describe("getServiceById", () => {
    it("should fetch a single service by ID", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .select("id, name, category, duration_minutes, price_cents, sort_order, is_active")
        .eq("id", serviceId)
        .eq("salon_id", salon.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.id).toBe(serviceId);
    });

    it("should return error for non-existent service", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .select("id")
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
    });

    it("should not fetch service from another salon", async () => {
      const otherSalon = await createTestSalon(`GetById Service Salon ${Date.now()}`);
      const otherServiceId = await createTestService(otherSalon.id);

      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .select("id")
        .eq("id", otherServiceId);

      expect(error).toBeNull();
      expect(data).toEqual([]);

      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("createService", () => {
    it("should create a new service", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .insert({
          salon_id: salon.id,
          name: "New Test Service",
          category: "cut",
          duration_minutes: 45,
          price_cents: 75000,
          sort_order: 1,
        })
        .select("id, name, category, duration_minutes, price_cents, sort_order, is_active")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.name).toBe("New Test Service");
      expect(data!.category).toBe("cut");
      expect(data!.duration_minutes).toBe(45);
      expect(data!.price_cents).toBe(75000);
      expect(data!.is_active).toBe(true); // Default value

      // Cleanup
      if (data) {
        await client.from("services").delete().eq("id", data.id);
      }
    });

    it("should not create service for another salon", async () => {
      const otherSalon = await createTestSalon(`Other Service Salon ${Date.now()}`);

      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .insert({
          salon_id: otherSalon.id,
          name: "Should Fail",
          duration_minutes: 30,
          price_cents: 50000,
        })
        .select();

      expect(error).toBeDefined();

      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("updateService", () => {
    it("should update service details", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .update({
          name: "Updated Service Name",
          price_cents: 80000,
          duration_minutes: 60,
        })
        .eq("id", serviceId)
        .eq("salon_id", salon.id)
        .select("id, name, price_cents, duration_minutes")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.name).toBe("Updated Service Name");
      expect(data!.price_cents).toBe(80000);
      expect(data!.duration_minutes).toBe(60);
    });

    it("should toggle service active status", async () => {
      const client = createUserClient(user.accessToken);

      // Set to inactive
      const { data: inactiveData, error: inactiveError } = await client
        .from("services")
        .update({ is_active: false })
        .eq("id", serviceId)
        .eq("salon_id", salon.id)
        .select("id, is_active")
        .single();

      expect(inactiveError).toBeNull();
      expect(inactiveData!.is_active).toBe(false);

      // Set back to active
      const { data: activeData, error: activeError } = await client
        .from("services")
        .update({ is_active: true })
        .eq("id", serviceId)
        .eq("salon_id", salon.id)
        .select("id, is_active")
        .single();

      expect(activeError).toBeNull();
      expect(activeData!.is_active).toBe(true);
    });

    it("should not update service from another salon", async () => {
      const otherSalon = await createTestSalon(`Update Service Salon ${Date.now()}`);
      const otherUser = await createTestUser(`update-svc-${Date.now()}@test.com`, {
        salonId: otherSalon.id,
      });

      const client = createUserClient(otherUser.accessToken);

      const { data, error } = await client
        .from("services")
        .update({ name: "Hacked Service" })
        .eq("id", serviceId)
        .select("id");

      expect(error).toBeNull();
      expect(data).toEqual([]);

      await cleanupTestUser(otherUser.id);
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("deleteService", () => {
    it("should delete a service", async () => {
      const serviceClient = createServiceRoleClient();
      const { data: newService } = await serviceClient
        .from("services")
        .insert({
          salon_id: salon.id,
          name: "Delete Me",
          duration_minutes: 30,
          price_cents: 50000,
        })
        .select("id")
        .single();

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("services")
        .delete()
        .eq("id", newService!.id)
        .eq("salon_id", salon.id);

      expect(error).toBeNull();

      const { data: checkData } = await client
        .from("services")
        .select("id")
        .eq("id", newService!.id);

      expect(checkData).toEqual([]);
    });

    it("should not delete service from another salon", async () => {
      const otherSalon = await createTestSalon(`Delete Service Salon ${Date.now()}`);
      const otherServiceId = await createTestService(otherSalon.id);

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("services")
        .delete()
        .eq("id", otherServiceId);

      expect(error).toBeNull();

      // Verify service still exists
      const serviceClient = createServiceRoleClient();
      const { data: checkData } = await serviceClient
        .from("services")
        .select("id")
        .eq("id", otherServiceId);

      expect(checkData).toHaveLength(1);

      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("Price and Duration Handling", () => {
    it("should handle price in cents correctly", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .insert({
          salon_id: salon.id,
          name: "Expensive Service",
          duration_minutes: 120,
          price_cents: 150000, // 1500.00 NOK
        })
        .select("id, price_cents")
        .single();

      expect(error).toBeNull();
      expect(data!.price_cents).toBe(150000);

      // Cleanup
      if (data) {
        await client.from("services").delete().eq("id", data.id);
      }
    });

    it("should handle various durations", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("services")
        .insert({
          salon_id: salon.id,
          name: "Long Service",
          duration_minutes: 180, // 3 hours
          price_cents: 200000,
        })
        .select("id, duration_minutes")
        .single();

      expect(error).toBeNull();
      expect(data!.duration_minutes).toBe(180);

      // Cleanup
      if (data) {
        await client.from("services").delete().eq("id", data.id);
      }
    });
  });
});
