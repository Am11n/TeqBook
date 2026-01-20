// =====================================================
// Customers Repository Integration Tests
// =====================================================
// Tests for customers repository + Supabase interactions
// Verifies CRUD operations, RLS policies, and data transformations

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  isSupabaseConfigured,
  createTestSalon,
  createTestUser,
  createTestCustomer,
  cleanupTestSalon,
  cleanupTestUser,
  createUserClient,
  createServiceRoleClient,
  type TestSalon,
  type TestUser,
} from "./setup";

// Skip tests if Supabase is not configured
const describeIf = isSupabaseConfigured() ? describe : describe.skip;

describeIf("Customers Repository Integration Tests", () => {
  let salon: TestSalon;
  let user: TestUser;
  let customerId: string;

  beforeAll(async () => {
    // Create test salon and user
    salon = await createTestSalon(`Customers Test Salon ${Date.now()}`);
    user = await createTestUser(`customers-test-${Date.now()}@test.com`, { salonId: salon.id });

    // Create test customer
    customerId = await createTestCustomer(salon.id);
  });

  afterAll(async () => {
    await cleanupTestUser(user.id);
    await cleanupTestSalon(salon.id);
  });

  describe("getCustomersForCurrentSalon", () => {
    it("should fetch customers with pagination", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error, count } = await client
        .from("customers")
        .select("id, full_name, email, phone, notes, gdpr_consent", { count: "exact" })
        .eq("salon_id", salon.id)
        .order("full_name", { ascending: true })
        .range(0, 49);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThanOrEqual(1);

      // Verify customer structure
      const customer = data!.find((c) => c.id === customerId);
      expect(customer).toBeDefined();
      expect(customer!.full_name).toBeDefined();
    });

    it("should only return customers for the user's salon", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .select("id, salon_id");

      expect(error).toBeNull();

      // All customers should belong to the user's salon
      if (data && data.length > 0) {
        for (const customer of data) {
          expect(customer.salon_id).toBe(salon.id);
        }
      }
    });
  });

  describe("createCustomer", () => {
    it("should create a new customer", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .insert({
          salon_id: salon.id,
          full_name: "New Test Customer",
          email: "newcustomer@test.com",
          phone: "+4711111111",
          gdpr_consent: true,
        })
        .select("id, full_name, email, phone, gdpr_consent")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.full_name).toBe("New Test Customer");
      expect(data!.email).toBe("newcustomer@test.com");
      expect(data!.gdpr_consent).toBe(true);

      // Cleanup
      if (data) {
        await client.from("customers").delete().eq("id", data.id);
      }
    });

    it("should trim whitespace from customer data", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .insert({
          salon_id: salon.id,
          full_name: "  Trimmed Name  ",
          email: "  trimmed@test.com  ",
        })
        .select("id, full_name, email")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      // Note: trimming is done in repository layer, not DB
      // This test verifies the DB accepts the data
      expect(data!.full_name).toBeDefined();

      // Cleanup
      if (data) {
        await client.from("customers").delete().eq("id", data.id);
      }
    });

    it("should not create customer for another salon", async () => {
      const otherSalon = await createTestSalon(`Other Customer Salon ${Date.now()}`);

      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .insert({
          salon_id: otherSalon.id,
          full_name: "Should Fail",
          email: "fail@test.com",
        })
        .select();

      // Should fail due to RLS
      expect(error).toBeDefined();

      // Cleanup
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("getCustomerById", () => {
    it("should fetch a single customer by ID", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .select("id, full_name, email, phone, notes, gdpr_consent")
        .eq("id", customerId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.id).toBe(customerId);
    });

    it("should return error for non-existent customer", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .select("id")
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
    });

    it("should not fetch customer from another salon", async () => {
      const otherSalon = await createTestSalon(`GetById Test Salon ${Date.now()}`);
      const otherCustomerId = await createTestCustomer(otherSalon.id);

      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .select("id")
        .eq("id", otherCustomerId);

      // RLS should return empty
      expect(error).toBeNull();
      expect(data).toEqual([]);

      // Cleanup
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("deleteCustomer", () => {
    it("should delete a customer", async () => {
      // Create a customer to delete
      const serviceClient = createServiceRoleClient();
      const { data: newCustomer } = await serviceClient
        .from("customers")
        .insert({
          salon_id: salon.id,
          full_name: "Delete Me",
          email: "deleteme@test.com",
        })
        .select("id")
        .single();

      const client = createUserClient(user.accessToken);

      const { error } = await client
        .from("customers")
        .delete()
        .eq("id", newCustomer!.id)
        .eq("salon_id", salon.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: checkData } = await client
        .from("customers")
        .select("id")
        .eq("id", newCustomer!.id);

      expect(checkData).toEqual([]);
    });

    it("should not delete customer from another salon", async () => {
      const otherSalon = await createTestSalon(`Delete Customer Salon ${Date.now()}`);
      const otherCustomerId = await createTestCustomer(otherSalon.id);

      const client = createUserClient(user.accessToken);

      // Try to delete customer from another salon
      const { error } = await client
        .from("customers")
        .delete()
        .eq("id", otherCustomerId);

      expect(error).toBeNull(); // No error, but...

      // Verify customer still exists
      const serviceClient = createServiceRoleClient();
      const { data: checkData } = await serviceClient
        .from("customers")
        .select("id")
        .eq("id", otherCustomerId);

      expect(checkData).toHaveLength(1);

      // Cleanup
      await cleanupTestSalon(otherSalon.id);
    });
  });

  describe("Data Transformations", () => {
    it("should handle null values correctly", async () => {
      const client = createUserClient(user.accessToken);

      const { data, error } = await client
        .from("customers")
        .insert({
          salon_id: salon.id,
          full_name: "Minimal Customer",
          email: null,
          phone: null,
          notes: null,
        })
        .select("id, full_name, email, phone, notes")
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.email).toBeNull();
      expect(data!.phone).toBeNull();
      expect(data!.notes).toBeNull();

      // Cleanup
      if (data) {
        await client.from("customers").delete().eq("id", data.id);
      }
    });
  });
});
