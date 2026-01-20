// =====================================================
// Repository Integration Tests Setup
// =====================================================
// Provides test utilities for repository integration tests
// Uses real Supabase instance for testing repository + DB interactions

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Check if Supabase is configured for integration tests
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ANON_KEY);
}

if (!isSupabaseConfigured()) {
  console.warn(
    "[Repository Integration Tests] SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Integration tests will be skipped."
  );
}

/**
 * Create a Supabase client with service role key (bypasses RLS)
 * Use this for test setup/teardown and direct database operations
 */
export function createServiceRoleClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured for integration tests");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client with anon key
 * This is what the repository functions use
 */
export function createAnonClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured for integration tests");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client with a specific user's JWT token
 */
export function createUserClient(accessToken: string): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured for integration tests");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Test user data structure
 */
export type TestUser = {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  salonId: string | null;
};

/**
 * Test salon data structure
 */
export type TestSalon = {
  id: string;
  name: string;
};

/**
 * Test data IDs for cleanup
 */
export type TestDataIds = {
  userIds: string[];
  salonIds: string[];
  customerIds: string[];
  employeeIds: string[];
  serviceIds: string[];
  bookingIds: string[];
  shiftIds: string[];
  productIds: string[];
};

/**
 * Create initial empty test data tracking
 */
export function createTestDataTracker(): TestDataIds {
  return {
    userIds: [],
    salonIds: [],
    customerIds: [],
    employeeIds: [],
    serviceIds: [],
    bookingIds: [],
    shiftIds: [],
    productIds: [],
  };
}

/**
 * Create a test user with optional salon
 */
export async function createTestUser(
  email: string,
  options: { salonId?: string | null } = {}
): Promise<TestUser> {
  const serviceClient = createServiceRoleClient();
  const password = "TestPassword123!";

  // Create auth user
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create test user: ${authError?.message || "Unknown error"}`);
  }

  const userId = authData.user.id;

  // Create profile
  const { error: profileError } = await serviceClient
    .from("profiles")
    .insert({
      user_id: userId,
      salon_id: options.salonId || null,
      is_superadmin: false,
    });

  if (profileError) {
    await serviceClient.auth.admin.deleteUser(userId);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Get access token by signing in
  const { data: sessionData, error: sessionError } = await serviceClient.auth.signInWithPassword({
    email,
    password,
  });

  if (sessionError || !sessionData.session) {
    await serviceClient.auth.admin.deleteUser(userId);
    throw new Error(`Failed to get session: ${sessionError?.message || "Unknown error"}`);
  }

  return {
    id: userId,
    email,
    password,
    accessToken: sessionData.session.access_token,
    salonId: options.salonId || null,
  };
}

/**
 * Create a test salon using the RPC function
 */
export async function createTestSalon(name: string): Promise<TestSalon> {
  const serviceClient = createServiceRoleClient();

  // First, create a dummy user to be the owner
  const dummyEmail = `salon-owner-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
  const dummyPassword = "DummyPassword123!";

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email: dummyEmail,
    password: dummyPassword,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create dummy owner user: ${authError?.message || "Unknown error"}`);
  }

  const ownerUserId = authData.user.id;

  // Use the test helper RPC function
  const { data: salonId, error: rpcError } = await serviceClient.rpc("create_test_salon_with_owner", {
    p_owner_user_id: ownerUserId,
    p_name: name,
    p_salon_type: "barber",
    p_preferred_language: "nb",
    p_online_booking_enabled: true,
    p_is_public: true,
  });

  if (rpcError || !salonId) {
    await serviceClient.auth.admin.deleteUser(ownerUserId);
    throw new Error(`Failed to create test salon via RPC: ${rpcError?.message || "Unknown error"}`);
  }

  return {
    id: salonId,
    name,
  };
}

/**
 * Create a test customer
 */
export async function createTestCustomer(salonId: string): Promise<string> {
  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("customers")
    .insert({
      salon_id: salonId,
      full_name: `Test Customer ${Date.now()}`,
      email: `customer-${Date.now()}@test.com`,
      phone: "+4799999999",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create test customer: ${error?.message}`);
  }

  return data.id;
}

/**
 * Create a test employee
 */
export async function createTestEmployee(salonId: string): Promise<string> {
  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("employees")
    .insert({
      salon_id: salonId,
      full_name: `Test Employee ${Date.now()}`,
      email: `employee-${Date.now()}@test.com`,
      phone: "+4799999998",
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create test employee: ${error?.message}`);
  }

  return data.id;
}

/**
 * Create a test service
 */
export async function createTestService(salonId: string): Promise<string> {
  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("services")
    .insert({
      salon_id: salonId,
      name: `Test Service ${Date.now()}`,
      duration_minutes: 30,
      price_cents: 50000,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create test service: ${error?.message}`);
  }

  return data.id;
}

/**
 * Create a test booking
 */
export async function createTestBooking(
  salonId: string,
  customerId: string,
  employeeId: string,
  serviceId: string
): Promise<string> {
  const serviceClient = createServiceRoleClient();

  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1); // Tomorrow
  startTime.setHours(10, 0, 0, 0);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 30);

  const { data, error } = await serviceClient
    .from("bookings")
    .insert({
      salon_id: salonId,
      customer_id: customerId,
      employee_id: employeeId,
      service_id: serviceId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "confirmed",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create test booking: ${error?.message}`);
  }

  return data.id;
}

/**
 * Create a test shift
 */
export async function createTestShift(salonId: string, employeeId: string): Promise<string> {
  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("shifts")
    .insert({
      salon_id: salonId,
      employee_id: employeeId,
      weekday: 1, // Monday
      start_time: "09:00",
      end_time: "17:00",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create test shift: ${error?.message}`);
  }

  return data.id;
}

/**
 * Create a test product
 */
export async function createTestProduct(salonId: string): Promise<string> {
  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("products")
    .insert({
      salon_id: salonId,
      name: `Test Product ${Date.now()}`,
      price_cents: 10000,
      stock: 10,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create test product: ${error?.message}`);
  }

  return data.id;
}

/**
 * Clean up a test user
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();

  try {
    await serviceClient.from("profiles").delete().eq("user_id", userId);
    await serviceClient.auth.admin.deleteUser(userId);
  } catch (err) {
    console.warn(`Failed to cleanup user ${userId}:`, err);
  }
}

/**
 * Clean up a test salon and all related data
 */
export async function cleanupTestSalon(salonId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();

  try {
    // Delete in order of dependencies
    await serviceClient.from("bookings").delete().eq("salon_id", salonId);
    await serviceClient.from("shifts").delete().eq("salon_id", salonId);
    await serviceClient.from("employee_services").delete().eq("salon_id", salonId);
    await serviceClient.from("employees").delete().eq("salon_id", salonId);
    await serviceClient.from("services").delete().eq("salon_id", salonId);
    await serviceClient.from("customers").delete().eq("salon_id", salonId);
    await serviceClient.from("products").delete().eq("salon_id", salonId);
    
    // Get the owner user ID before deleting the salon
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("user_id")
      .eq("salon_id", salonId);
    
    // Delete profiles associated with this salon
    await serviceClient.from("profiles").delete().eq("salon_id", salonId);
    
    // Delete the salon
    await serviceClient.from("salons").delete().eq("id", salonId);
    
    // Delete the owner users
    if (profiles) {
      for (const profile of profiles) {
        try {
          await serviceClient.auth.admin.deleteUser(profile.user_id);
        } catch (err) {
          console.warn(`Failed to delete user ${profile.user_id}:`, err);
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to cleanup salon ${salonId}:`, err);
  }
}

/**
 * Clean up all test data
 */
export async function cleanupAllTestData(testData: TestDataIds): Promise<void> {
  const serviceClient = createServiceRoleClient();

  // Clean up in reverse order of dependencies
  for (const bookingId of testData.bookingIds) {
    try {
      await serviceClient.from("bookings").delete().eq("id", bookingId);
    } catch (err) {
      console.warn(`Failed to delete booking ${bookingId}:`, err);
    }
  }

  for (const shiftId of testData.shiftIds) {
    try {
      await serviceClient.from("shifts").delete().eq("id", shiftId);
    } catch (err) {
      console.warn(`Failed to delete shift ${shiftId}:`, err);
    }
  }

  for (const productId of testData.productIds) {
    try {
      await serviceClient.from("products").delete().eq("id", productId);
    } catch (err) {
      console.warn(`Failed to delete product ${productId}:`, err);
    }
  }

  for (const serviceId of testData.serviceIds) {
    try {
      await serviceClient.from("services").delete().eq("id", serviceId);
    } catch (err) {
      console.warn(`Failed to delete service ${serviceId}:`, err);
    }
  }

  for (const employeeId of testData.employeeIds) {
    try {
      await serviceClient.from("employees").delete().eq("id", employeeId);
    } catch (err) {
      console.warn(`Failed to delete employee ${employeeId}:`, err);
    }
  }

  for (const customerId of testData.customerIds) {
    try {
      await serviceClient.from("customers").delete().eq("id", customerId);
    } catch (err) {
      console.warn(`Failed to delete customer ${customerId}:`, err);
    }
  }

  for (const salonId of testData.salonIds) {
    await cleanupTestSalon(salonId);
  }

  for (const userId of testData.userIds) {
    await cleanupTestUser(userId);
  }
}
