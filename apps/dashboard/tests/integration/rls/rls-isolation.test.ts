// =====================================================
// RLS Isolation Tests
// =====================================================
// Tests for Row Level Security (RLS) policy isolation
// Verifies that users can only access their own salon's data
// and that superadmins can access all data

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestUser,
  createTestSalon,
  createTestSalonData,
  createUserClient,
  cleanupTestUser,
  cleanupTestSalon,
  isSupabaseConfigured,
  type TestUser,
  type TestSalon,
} from "./rls-test-utils";

// Skip tests if Supabase is not configured
const describeIf = isSupabaseConfigured() ? describe : describe.skip;

describeIf("RLS Isolation Tests", () => {
  // Test data
  let salon1: TestSalon;
  let salon2: TestSalon;
  let user1: TestUser; // User in salon1
  let user2: TestUser; // User in salon2
  let superadmin: TestUser; // Superadmin user
  let salon1Data: {
    customerId: string;
    employeeId: string;
    serviceId: string;
    bookingId: string;
    productId: string;
    shiftId: string;
  };
  let salon2Data: {
    customerId: string;
    employeeId: string;
    serviceId: string;
    bookingId: string;
    productId: string;
    shiftId: string;
  };

  beforeAll(async () => {
    // Create test salons
    salon1 = await createTestSalon("Test Salon 1");
    salon2 = await createTestSalon("Test Salon 2");

    // Create test users
    user1 = await createTestUser("user1@test.com", { salonId: salon1.id });
    user2 = await createTestUser("user2@test.com", { salonId: salon2.id });
    superadmin = await createTestUser("superadmin@test.com", {
      salonId: null,
      isSuperAdmin: true,
    });

    // Create test data for each salon
    salon1Data = await createTestSalonData(salon1.id);
    salon2Data = await createTestSalonData(salon2.id);
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestUser(user1.id);
    await cleanupTestUser(user2.id);
    await cleanupTestUser(superadmin.id);
    await cleanupTestSalon(salon1.id);
    await cleanupTestSalon(salon2.id);
  });

  describe("Cross-tenant data access prevention", () => {
    it("should prevent user1 from accessing salon2 bookings", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select("*")
        .eq("id", salon2Data.bookingId);

      // Should return empty array (no access) or error
      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it("should prevent user1 from accessing salon2 customers", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("customers")
        .select("*")
        .eq("id", salon2Data.customerId);

      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it("should prevent user1 from accessing salon2 employees", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("employees")
        .select("*")
        .eq("id", salon2Data.employeeId);

      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it("should prevent user1 from accessing salon2 services", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("services")
        .select("*")
        .eq("id", salon2Data.serviceId);

      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it("should prevent user1 from accessing salon2 products", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("products")
        .select("*")
        .eq("id", salon2Data.productId);

      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it("should prevent user1 from accessing salon2 shifts", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("shifts")
        .select("*")
        .eq("id", salon2Data.shiftId);

      expect(data).toEqual([]);
      expect(error).toBeNull();
    });
  });

  describe("User can only access own salon data", () => {
    it("should allow user1 to access salon1 bookings", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select("*")
        .eq("id", salon1Data.bookingId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon1Data.bookingId);
      expect(data?.salon_id).toBe(salon1.id);
    });

    it("should allow user1 to access salon1 customers", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("customers")
        .select("*")
        .eq("id", salon1Data.customerId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon1Data.customerId);
      expect(data?.salon_id).toBe(salon1.id);
    });

    it("should allow user1 to access salon1 employees", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("employees")
        .select("*")
        .eq("id", salon1Data.employeeId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon1Data.employeeId);
      expect(data?.salon_id).toBe(salon1.id);
    });

    it("should allow user1 to access salon1 services", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("services")
        .select("*")
        .eq("id", salon1Data.serviceId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon1Data.serviceId);
      expect(data?.salon_id).toBe(salon1.id);
    });

    it("should allow user1 to access salon1 products", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("products")
        .select("*")
        .eq("id", salon1Data.productId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon1Data.productId);
      expect(data?.salon_id).toBe(salon1.id);
    });

    it("should allow user1 to access salon1 shifts", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client
        .from("shifts")
        .select("*")
        .eq("id", salon1Data.shiftId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon1Data.shiftId);
      expect(data?.salon_id).toBe(salon1.id);
    });
  });

  describe("Superadmin access to all data", () => {
    it("should allow superadmin to access all salons", async () => {
      const client = createUserClient(superadmin.accessToken);

      const { data, error } = await client.from("salons").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThanOrEqual(2);
      expect(data?.some((s) => s.id === salon1.id)).toBe(true);
      expect(data?.some((s) => s.id === salon2.id)).toBe(true);
    });

    it("should allow superadmin to access salon1 bookings", async () => {
      const client = createUserClient(superadmin.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select("*")
        .eq("id", salon1Data.bookingId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon1Data.bookingId);
    });

    it("should allow superadmin to access salon2 bookings", async () => {
      const client = createUserClient(superadmin.accessToken);

      const { data, error } = await client
        .from("bookings")
        .select("*")
        .eq("id", salon2Data.bookingId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(salon2Data.bookingId);
    });

    it("should allow superadmin to access all customers", async () => {
      const client = createUserClient(superadmin.accessToken);

      const { data, error } = await client.from("customers").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThanOrEqual(2);
      expect(data?.some((c) => c.id === salon1Data.customerId)).toBe(true);
      expect(data?.some((c) => c.id === salon2Data.customerId)).toBe(true);
    });
  });

  describe("RLS policies on all tenant tables", () => {
    it("should enforce RLS on bookings table", async () => {
      const client = createUserClient(user1.accessToken);

      // Try to list all bookings - should only see salon1 bookings
      const { data, error } = await client.from("bookings").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      // All bookings should belong to salon1
      if (data && data.length > 0) {
        data.forEach((booking) => {
          expect(booking.salon_id).toBe(salon1.id);
        });
      }
    });

    it("should enforce RLS on customers table", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client.from("customers").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data && data.length > 0) {
        data.forEach((customer) => {
          expect(customer.salon_id).toBe(salon1.id);
        });
      }
    });

    it("should enforce RLS on employees table", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client.from("employees").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data && data.length > 0) {
        data.forEach((employee) => {
          expect(employee.salon_id).toBe(salon1.id);
        });
      }
    });

    it("should enforce RLS on services table", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client.from("services").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data && data.length > 0) {
        data.forEach((service) => {
          expect(service.salon_id).toBe(salon1.id);
        });
      }
    });

    it("should enforce RLS on products table", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client.from("products").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data && data.length > 0) {
        data.forEach((product) => {
          expect(product.salon_id).toBe(salon1.id);
        });
      }
    });

    it("should enforce RLS on shifts table", async () => {
      const client = createUserClient(user1.accessToken);

      const { data, error } = await client.from("shifts").select("*");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data && data.length > 0) {
        data.forEach((shift) => {
          expect(shift.salon_id).toBe(salon1.id);
        });
      }
    });
  });
});

