#!/usr/bin/env tsx
/**
 * Create E2E Test Users Script
 *
 * Creates test users for E2E testing:
 * - Owner user: Has a salon and can access /settings/*
 * - Superadmin user: Can access /admin/*
 *
 * Usage:
 *   npm run create:e2e-users
 *   npm run create:e2e-users -- --cleanup  # Delete existing test users first
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test user credentials - these should match what E2E tests expect
const E2E_OWNER_EMAIL = "e2e-owner@teqbook.test";
const E2E_OWNER_PASSWORD = "E2ETestPassword123!";
const E2E_SUPERADMIN_EMAIL = "e2e-superadmin@teqbook.test";
const E2E_SUPERADMIN_PASSWORD = "E2ETestPassword123!";
const E2E_SALON_NAME = "Test Salon";
const E2E_SALON_SLUG = "test-salon";

interface CreatedUser {
  id: string;
  email: string;
  password: string;
}

interface CreatedSalon {
  id: string;
  name: string;
  slug: string;
}

async function findExistingUser(email: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error.message);
    return null;
  }
  const user = data.users.find((u) => u.email === email);
  return user?.id || null;
}

async function findExistingSalon(slug: string): Promise<string | null> {
  const { data, error } = await supabase.from("salons").select("id").eq("slug", slug).single();
  if (error) {
    return null;
  }
  return data?.id || null;
}

async function cleanupTestUser(email: string): Promise<void> {
  // Find user in auth system
  const { data } = await supabase.auth.admin.listUsers();
  const authUser = data?.users.find((u) => u.email === email);
  
  if (!authUser) {
    return; // User doesn't exist
  }

  const userId = authUser.id;

  // First, nullify the salon_id in profile (this avoids the "last owner" trigger)
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ salon_id: null })
    .eq("user_id", userId);
  
  if (updateError) {
    console.warn(`⚠️  Warning updating profile for ${email}: ${updateError.message}`);
  }

  // Small delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Now delete the profile
  const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId);
  if (profileError) {
    console.warn(`⚠️  Warning deleting profile for ${email}: ${profileError.message}`);
  }

  // Small delay to let database constraints settle
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Now delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    console.warn(`⚠️  Warning deleting auth user ${email}: ${authError.message}`);
    
    // Wait and try again
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { error: retryError } = await supabase.auth.admin.deleteUser(userId);
    if (retryError) {
      console.error(`❌ Could not delete user ${email}. You may need to delete manually in Supabase Dashboard.`);
      console.error(`   User ID: ${userId}`);
    } else {
      console.log(`🗑️  Deleted existing user: ${email} (on retry)`);
    }
  } else {
    console.log(`🗑️  Deleted existing user: ${email}`);
  }
}

async function cleanupTestSalon(slug: string): Promise<void> {
  const salonId = await findExistingSalon(slug);
  if (salonId) {
    console.log(`🧹 Cleaning up salon: ${slug} (${salonId})`);
    
    // Delete related data in correct order (respecting foreign keys)
    const tables = [
      "bookings",
      "customers", 
      "shifts",
      "employees",
      "services",
      "products",
      "opening_hours",
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq("salon_id", salonId);
      if (error) {
        console.warn(`   ⚠️  ${table}: ${error.message}`);
      }
    }

    // First delete the salon (this should cascade or we handle profiles after)
    // We need to delete salon first to release the "last owner" constraint
    const { error: salonError } = await supabase.from("salons").delete().eq("id", salonId);
    if (salonError) {
      console.warn(`   ⚠️  salon: ${salonError.message}`);
      
      // If salon delete fails, try to nullify profiles first, then delete salon
      console.log("   ℹ️  Trying to nullify profile salon_id first...");
      
      // Update profiles to remove salon association (instead of deleting)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ salon_id: null })
        .eq("salon_id", salonId);
      
      if (updateError) {
        console.warn(`   ⚠️  profiles update: ${updateError.message}`);
      }
      
      // Try deleting salon again
      const { error: retryError } = await supabase.from("salons").delete().eq("id", salonId);
      if (retryError) {
        console.error(`   ❌ Could not delete salon. Error: ${retryError.message}`);
      } else {
        console.log(`🗑️  Deleted existing salon: ${slug}`);
      }
    } else {
      console.log(`🗑️  Deleted existing salon: ${slug}`);
    }

    // Now clean up orphaned profiles (profiles that had this salon_id)
    // They should already be nullified or deleted by cascade
  }
}

async function createTestSalonWithOwner(): Promise<{ salon: CreatedSalon; owner: CreatedUser }> {
  console.log("\n📦 Creating test salon with owner...\n");

  // First, create the owner user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: E2E_OWNER_EMAIL,
    password: E2E_OWNER_PASSWORD,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create owner user: ${authError?.message || "Unknown error"}`);
  }

  const ownerUserId = authData.user.id;
  console.log(`✅ Created owner user: ${E2E_OWNER_EMAIL}`);

  // Try to use the RPC function if available, otherwise create manually
  let salonId: string;

  const { data: rpcResult, error: rpcError } = await supabase.rpc("create_test_salon_with_owner", {
    p_owner_user_id: ownerUserId,
    p_name: E2E_SALON_NAME,
    p_salon_type: "barber",
    p_preferred_language: "nb",
    p_online_booking_enabled: true,
    p_is_public: true,
  });

  if (rpcError || !rpcResult) {
    // RPC not available or failed, create manually
    console.log("ℹ️  RPC not available, creating salon manually...");

    // Create salon
    const { data: salonData, error: salonError } = await supabase
      .from("salons")
      .insert({
        name: E2E_SALON_NAME,
        slug: E2E_SALON_SLUG,
        is_public: true,
        preferred_language: "nb",
        salon_type: "barber",
        online_booking_enabled: true,
        plan: "starter",
      })
      .select()
      .single();

    if (salonError || !salonData) {
      // Cleanup user if salon creation fails
      await supabase.auth.admin.deleteUser(ownerUserId);
      throw new Error(`Failed to create salon: ${salonError?.message || "Unknown error"}`);
    }

    salonId = salonData.id;

    // Create profile for owner
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: ownerUserId,
      salon_id: salonId,
      is_superadmin: false,
    });

    if (profileError) {
      // Cleanup
      await supabase.from("salons").delete().eq("id", salonId);
      await supabase.auth.admin.deleteUser(ownerUserId);
      throw new Error(`Failed to create owner profile: ${profileError.message}`);
    }
  } else {
    salonId = rpcResult;
    // RPC doesn't set slug, so update it
    await supabase.from("salons").update({ slug: E2E_SALON_SLUG }).eq("id", salonId);
  }

  console.log(`✅ Created salon: ${E2E_SALON_NAME} (${E2E_SALON_SLUG})`);

  return {
    salon: {
      id: salonId,
      name: E2E_SALON_NAME,
      slug: E2E_SALON_SLUG,
    },
    owner: {
      id: ownerUserId,
      email: E2E_OWNER_EMAIL,
      password: E2E_OWNER_PASSWORD,
    },
  };
}

async function createSuperadminUser(): Promise<CreatedUser> {
  console.log("\n👑 Creating superadmin user...\n");

  // Create the superadmin user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: E2E_SUPERADMIN_EMAIL,
    password: E2E_SUPERADMIN_PASSWORD,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create superadmin user: ${authError?.message || "Unknown error"}`);
  }

  const userId = authData.user.id;

  // Create profile with superadmin flag
  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: userId,
    salon_id: null, // Superadmin doesn't need a specific salon
    is_superadmin: true,
  });

  if (profileError) {
    // Cleanup user if profile creation fails
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(`Failed to create superadmin profile: ${profileError.message}`);
  }

  console.log(`✅ Created superadmin user: ${E2E_SUPERADMIN_EMAIL}`);

  return {
    id: userId,
    email: E2E_SUPERADMIN_EMAIL,
    password: E2E_SUPERADMIN_PASSWORD,
  };
}

async function createTestData(salonId: string): Promise<void> {
  console.log("\n📊 Creating test data for salon...\n");

  // Create employees
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .insert([
      {
        salon_id: salonId,
        full_name: "Emma Hansen",
        email: "emma@test.com",
        phone: "+4799999901",
        is_active: true,
      },
      {
        salon_id: salonId,
        full_name: "Oliver Berg",
        email: "oliver@test.com",
        phone: "+4799999902",
        is_active: true,
      },
    ])
    .select();

  if (employeesError) {
    console.warn(`⚠️  Warning: Could not create employees: ${employeesError.message}`);
  } else {
    console.log(`✅ Created ${employees?.length || 0} employees`);
  }

  // Create services (without category - schema may not have it)
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .insert([
      {
        salon_id: salonId,
        name: "Hårklipp",
        duration_minutes: 30,
        price_cents: 50000,
        is_active: true,
        sort_order: 1,
      },
      {
        salon_id: salonId,
        name: "Skjeggtrim",
        duration_minutes: 15,
        price_cents: 25000,
        is_active: true,
        sort_order: 2,
      },
      {
        salon_id: salonId,
        name: "Hårklipp + Skjeggtrim",
        duration_minutes: 45,
        price_cents: 65000,
        is_active: true,
        sort_order: 3,
      },
    ])
    .select();

  if (servicesError) {
    console.warn(`⚠️  Warning: Could not create services: ${servicesError.message}`);
  } else {
    console.log(`✅ Created ${services?.length || 0} services`);
  }

  // Create customers
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .insert([
      {
        salon_id: salonId,
        full_name: "Lars Olsen",
        email: "lars@example.com",
        phone: "+4790000001",
      },
      {
        salon_id: salonId,
        full_name: "Kari Nordmann",
        email: "kari@example.com",
        phone: "+4790000002",
      },
    ])
    .select();

  if (customersError) {
    console.warn(`⚠️  Warning: Could not create customers: ${customersError.message}`);
  } else {
    console.log(`✅ Created ${customers?.length || 0} customers`);
  }

  // Create shifts for employees (Monday to Friday, 09:00-17:00)
  if (employees && employees.length > 0) {
    const shifts = [];
    for (const employee of employees) {
      for (let weekday = 1; weekday <= 5; weekday++) {
        shifts.push({
          salon_id: salonId,
          employee_id: employee.id,
          weekday,
          start_time: "09:00",
          end_time: "17:00",
        });
      }
    }

    const { data: shiftsData, error: shiftsError } = await supabase.from("shifts").insert(shifts).select();

    if (shiftsError) {
      console.warn(`⚠️  Warning: Could not create shifts: ${shiftsError.message}`);
    } else {
      console.log(`✅ Created ${shiftsData?.length || 0} shifts`);
    }
  }

  // Create opening hours (Monday to Saturday) - without is_closed field
  const openingHours = [];
  for (let weekday = 1; weekday <= 6; weekday++) {
    openingHours.push({
      salon_id: salonId,
      weekday,
      open_time: weekday === 6 ? "10:00" : "09:00", // Saturday opens later
      close_time: weekday === 6 ? "15:00" : "18:00", // Saturday closes earlier
    });
  }
  // Sunday - use 00:00-00:00 to indicate closed
  openingHours.push({
    salon_id: salonId,
    weekday: 0,
    open_time: "00:00",
    close_time: "00:00",
  });

  const { data: hoursData, error: hoursError } = await supabase.from("opening_hours").insert(openingHours).select();

  if (hoursError) {
    console.warn(`⚠️  Warning: Could not create opening hours: ${hoursError.message}`);
  } else {
    console.log(`✅ Created ${hoursData?.length || 0} opening hours entries`);
  }

  // Create a sample booking (for tomorrow)
  if (employees && employees.length > 0 && services && services.length > 0 && customers && customers.length > 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + services[0].duration_minutes);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        salon_id: salonId,
        customer_id: customers[0].id,
        employee_id: employees[0].id,
        service_id: services[0].id,
        start_time: tomorrow.toISOString(),
        end_time: endTime.toISOString(),
        status: "confirmed",
      })
      .select();

    if (bookingError) {
      console.warn(`⚠️  Warning: Could not create booking: ${bookingError.message}`);
    } else {
      console.log(`✅ Created ${booking?.length || 0} sample booking(s)`);
    }
  }

  // Create products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .insert([
      {
        salon_id: salonId,
        name: "Styling Wax",
        price_cents: 15000,
        stock: 20,
        is_active: true,
      },
      {
        salon_id: salonId,
        name: "Beard Oil",
        price_cents: 12000,
        stock: 15,
        is_active: true,
      },
    ])
    .select();

  if (productsError) {
    console.warn(`⚠️  Warning: Could not create products: ${productsError.message}`);
  } else {
    console.log(`✅ Created ${products?.length || 0} products`);
  }
}

async function main() {
  console.log("🚀 Starting E2E user and data setup...\n");
  console.log("=".repeat(50));

  const args = process.argv.slice(2);
  const shouldCleanup = args.includes("--cleanup");

  try {
    if (shouldCleanup) {
      console.log("\n🧹 Cleaning up existing test data...\n");
      // IMPORTANT: Delete salon first (this removes profile associations)
      // Then delete users
      await cleanupTestSalon(E2E_SALON_SLUG);
      await cleanupTestUser(E2E_OWNER_EMAIL);
      await cleanupTestUser(E2E_SUPERADMIN_EMAIL);
      
      // Wait a moment for cascade deletes to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Create salon with owner
    const { salon, owner } = await createTestSalonWithOwner();

    // Create superadmin
    const superadmin = await createSuperadminUser();

    // Create test data for the salon
    await createTestData(salon.id);

    console.log("\n" + "=".repeat(50));
    console.log("\n✨ E2E setup completed successfully!\n");
    console.log("📋 Test Credentials:\n");
    console.log("   Owner (for /settings/*, /dashboard):");
    console.log(`   Email: ${owner.email}`);
    console.log(`   Password: ${owner.password}`);
    console.log(`   Salon: ${salon.name} (${salon.slug})`);
    console.log("");
    console.log("   Superadmin (for /admin/*):");
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   Password: ${superadmin.password}`);
    console.log("");
    console.log("📖 Next steps:");
    console.log("   1. Start dev server: npm run dev");
    console.log("   2. Log in at /login with owner credentials");
    console.log("   3. Run E2E tests: npm run test:e2e");
    console.log("");
  } catch (error) {
    console.error("\n❌ E2E setup failed:", error);
    process.exit(1);
  }
}

main();
