// =====================================================
// RLS Test Utilities
// =====================================================
// Utilities for testing Row Level Security (RLS) policies
// Provides helpers for creating test users, salons, and data

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
    "[RLS Tests] SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. RLS integration tests will be skipped."
  );
}

/**
 * Create a Supabase client with service role key (bypasses RLS)
 * Use this for test setup/teardown
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
 * Create a Supabase client with a specific user's JWT token
 * Use this to test RLS policies as a specific user
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
 * Test user and salon data structure
 */
export type TestUser = {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  salonId: string | null;
  isSuperAdmin: boolean;
};

export type TestSalon = {
  id: string;
  name: string;
};

/**
 * Create a test user with optional salon
 * Returns user data including access token
 */
export async function createTestUser(
  email: string,
  options: {
    salonId?: string | null;
    isSuperAdmin?: boolean;
  } = {}
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
      is_superadmin: options.isSuperAdmin || false,
    });

  if (profileError) {
    // Clean up auth user if profile creation fails
    await serviceClient.auth.admin.deleteUser(userId);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Get access token by signing in
  const { data: sessionData, error: sessionError } = await serviceClient.auth.signInWithPassword({
    email,
    password,
  });

  if (sessionError || !sessionData.session) {
    // Clean up
    await serviceClient.auth.admin.deleteUser(userId);
    throw new Error(`Failed to get session: ${sessionError?.message || "Unknown error"}`);
  }

  return {
    id: userId,
    email,
    password,
    accessToken: sessionData.session.access_token,
    salonId: options.salonId || null,
    isSuperAdmin: options.isSuperAdmin || false,
  };
}

/**
 * Create a test salon
 * Note: Salons require at least one owner (profile with salon_id).
 * The trigger runs AFTER INSERT and checks for an owner.
 * We temporarily disable the trigger, create salon and profile, then re-enable it.
 */
export async function createTestSalon(name: string): Promise<TestSalon> {
  const serviceClient = createServiceRoleClient();

  // First, create a dummy user to be the owner
  const dummyEmail = `salon-owner-${Date.now()}@test.com`;
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

  // Use the test helper RPC function to create salon and profile in a single transaction
  // This avoids the trigger constraint issue
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

  // Fetch the salon details
  const { data: salonData, error: fetchError } = await serviceClient
    .from("salons")
    .select("*")
    .eq("id", salonId)
    .single();

  if (fetchError || !salonData) {
    await serviceClient.auth.admin.deleteUser(ownerUserId);
    throw new Error(`Failed to fetch created salon: ${fetchError?.message || "Unknown error"}`);
  }

  return {
    id: salonData.id,
    name: salonData.name,
  };
}

/**
 * Create test data for a salon (bookings, customers, employees, etc.)
 */
export async function createTestSalonData(salonId: string): Promise<{
  customerId: string;
  employeeId: string;
  serviceId: string;
  bookingId: string;
  productId: string;
  shiftId: string;
}> {
  const serviceClient = createServiceRoleClient();

  // Create customer
  const { data: customer, error: customerError } = await serviceClient
    .from("customers")
    .insert({
      salon_id: salonId,
      full_name: "Test Customer",
      email: "customer@test.com",
      phone: "+4799999999",
    })
    .select()
    .single();

  if (customerError || !customer) {
    throw new Error(`Failed to create test customer: ${customerError?.message}`);
  }

  // Create employee
  const { data: employee, error: employeeError } = await serviceClient
    .from("employees")
    .insert({
      salon_id: salonId,
      full_name: "Test Employee",
      email: "employee@test.com",
      phone: "+4799999998",
    })
    .select()
    .single();

  if (employeeError || !employee) {
    throw new Error(`Failed to create test employee: ${employeeError?.message}`);
  }

  // Create service
  const { data: service, error: serviceError } = await serviceClient
    .from("services")
    .insert({
      salon_id: salonId,
      name: "Test Service",
      duration_minutes: 30,
      price_cents: 50000,
      is_active: true,
    })
    .select()
    .single();

  if (serviceError || !service) {
    throw new Error(`Failed to create test service: ${serviceError?.message}`);
  }

  // Create booking
  const startTime = new Date();
  startTime.setHours(10, 0, 0, 0);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 30);

  const { data: booking, error: bookingError } = await serviceClient
    .from("bookings")
    .insert({
      salon_id: salonId,
      customer_id: customer.id,
      employee_id: employee.id,
      service_id: service.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "confirmed",
    })
    .select()
    .single();

  if (bookingError || !booking) {
    throw new Error(`Failed to create test booking: ${bookingError?.message}`);
  }

  // Create product
  const { data: product, error: productError } = await serviceClient
    .from("products")
    .insert({
      salon_id: salonId,
      name: "Test Product",
      price_cents: 10000,
      stock: 10,
      is_active: true,
    })
    .select()
    .single();

  if (productError || !product) {
    throw new Error(`Failed to create test product: ${productError?.message}`);
  }

  // Create shift
  const { data: shift, error: shiftError } = await serviceClient
    .from("shifts")
    .insert({
      salon_id: salonId,
      employee_id: employee.id,
      weekday: 1, // Monday
      start_time: "09:00",
      end_time: "17:00",
    })
    .select()
    .single();

  if (shiftError || !shift) {
    throw new Error(`Failed to create test shift: ${shiftError?.message}`);
  }

  return {
    customerId: customer.id,
    employeeId: employee.id,
    serviceId: service.id,
    bookingId: booking.id,
    productId: product.id,
    shiftId: shift.id,
  };
}

/**
 * Clean up test user (delete profile and auth user)
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();

  // Delete profile first
  await serviceClient.from("profiles").delete().eq("user_id", userId);

  // Delete auth user
  await serviceClient.auth.admin.deleteUser(userId);
}

/**
 * Clean up test salon and all related data
 */
export async function cleanupTestSalon(salonId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();

  // Delete all related data (cascade should handle most, but be explicit)
  await serviceClient.from("bookings").delete().eq("salon_id", salonId);
  await serviceClient.from("customers").delete().eq("salon_id", salonId);
  await serviceClient.from("employees").delete().eq("salon_id", salonId);
  await serviceClient.from("services").delete().eq("salon_id", salonId);
  await serviceClient.from("products").delete().eq("salon_id", salonId);
  await serviceClient.from("shifts").delete().eq("salon_id", salonId);
  await serviceClient.from("profiles").delete().eq("salon_id", salonId);
  await serviceClient.from("salons").delete().eq("id", salonId);
}

/**
 * Clean up all test data
 */
export async function cleanupAllTestData(userIds: string[], salonIds: string[]): Promise<void> {
  // Clean up salons (this will cascade delete related data)
  for (const salonId of salonIds) {
    await cleanupTestSalon(salonId);
  }

  // Clean up users
  for (const userId of userIds) {
    await cleanupTestUser(userId);
  }
}

