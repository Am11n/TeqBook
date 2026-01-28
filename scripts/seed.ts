#!/usr/bin/env tsx
/**
 * Seed Script
 *
 * Seeds the database with initial data for development/testing.
 * Creates a complete test salon with employees, services, shifts,
 * customers, products, and sample bookings.
 *
 * Usage:
 *   npm run seed              # Seed database (skips if test-salon exists)
 *   npm run seed -- --reset   # Reset and re-seed database
 *   npm run seed -- --force   # Force re-seed even if data exists
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

const TEST_SALON_SLUG = "test-salon";

async function checkExistingSalon(): Promise<string | null> {
  const { data } = await supabase.from("salons").select("id").eq("slug", TEST_SALON_SLUG).single();
  return data?.id || null;
}

async function seed(force = false) {
  console.log("🌱 Starting database seed...\n");

  try {
    // Check if test salon already exists
    const existingSalonId = await checkExistingSalon();
    if (existingSalonId && !force) {
      console.log(`ℹ️  Salon '${TEST_SALON_SLUG}' already exists.`);
      console.log("   Use --reset or --force to re-seed.");
      return;
    }

    // Note: Creating a salon requires an owner (profile with salon_id).
    // The database has a trigger that enforces this.
    // Use create-e2e-users.ts to create salon with owner, or use RPC.
    
    // Try using RPC function if available
    let salonId: string | null = null;
    let salonName = "Test Salon";

    // First, create a temporary owner user
    const tempOwnerEmail = `temp-owner-${Date.now()}@test.local`;
    const { data: tempAuthData, error: tempAuthError } = await supabase.auth.admin.createUser({
      email: tempOwnerEmail,
      password: "TempPassword123!",
      email_confirm: true,
    });

    if (tempAuthError || !tempAuthData.user) {
      console.error("❌ Error creating temporary owner:", tempAuthError?.message);
      console.log("ℹ️  Skipping salon seed. Run 'pnpm run create:e2e-users' to create salon with owner.");
      return;
    }

    const tempOwnerId = tempAuthData.user.id;

    // Try RPC first
    const { data: rpcResult, error: rpcError } = await supabase.rpc("create_test_salon_with_owner", {
      p_owner_user_id: tempOwnerId,
      p_name: salonName,
      p_salon_type: "barber",
      p_preferred_language: "nb",
      p_online_booking_enabled: true,
      p_is_public: true,
    });

    if (!rpcError && rpcResult) {
      salonId = rpcResult;
    } else {
      // RPC not available, try manual creation
      console.log("ℹ️  RPC not available, trying manual salon creation...");

      // Create salon
      const { data: salonData, error: salonError } = await supabase
        .from("salons")
        .insert({
          name: salonName,
          slug: TEST_SALON_SLUG,
          is_public: true,
          preferred_language: "nb",
          salon_type: "barber",
          online_booking_enabled: true,
          plan: "starter",
        })
        .select()
        .single();

      if (salonError) {
        // Clean up temp user
        await supabase.auth.admin.deleteUser(tempOwnerId);
        console.error("❌ Error seeding salon:", salonError.message);
        console.log("ℹ️  This usually means the salon requires an owner.");
        console.log("   Run 'npm run create:e2e-users' instead to create salon with owner.");
        return;
      }

      salonId = salonData.id;

      // Create profile for temp owner
      await supabase.from("profiles").insert({
        user_id: tempOwnerId,
        salon_id: salonId,
        is_superadmin: false,
      });
    }

    if (!salonId) {
      await supabase.auth.admin.deleteUser(tempOwnerId);
      console.error("❌ Failed to create salon");
      return;
    }

    console.log("✅ Seeded salon:", salonName);

    // Seed employees
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .insert([
        {
          salon_id: salonId,
          full_name: "Emma Hansen",
          email: "emma@testsalon.com",
          phone: "+4799999901",
          is_active: true,
        },
        {
          salon_id: salonId,
          full_name: "Oliver Berg",
          email: "oliver@testsalon.com",
          phone: "+4799999902",
          is_active: true,
        },
        {
          salon_id: salonId,
          full_name: "Sofie Andersen",
          email: "sofie@testsalon.com",
          phone: "+4799999903",
          is_active: true,
        },
      ])
      .select();

    if (employeesError) {
      console.warn("⚠️  Warning seeding employees:", employeesError.message);
    } else {
      console.log(`✅ Seeded ${employees?.length || 0} employees`);
    }

    // Seed services
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .insert([
        {
          salon_id: salonId,
          name: "Hårklipp",
          category: "cut",
          duration_minutes: 30,
          price_cents: 50000,
          is_active: true,
          sort_order: 1,
        },
        {
          salon_id: salonId,
          name: "Skjeggtrim",
          category: "beard",
          duration_minutes: 15,
          price_cents: 25000,
          is_active: true,
          sort_order: 2,
        },
        {
          salon_id: salonId,
          name: "Hårklipp + Skjeggtrim",
          category: "combo",
          duration_minutes: 45,
          price_cents: 65000,
          is_active: true,
          sort_order: 3,
        },
        {
          salon_id: salonId,
          name: "Styling",
          category: "styling",
          duration_minutes: 20,
          price_cents: 20000,
          is_active: true,
          sort_order: 4,
        },
        {
          salon_id: salonId,
          name: "Hårfarge",
          category: "color",
          duration_minutes: 90,
          price_cents: 150000,
          is_active: true,
          sort_order: 5,
        },
      ])
      .select();

    if (servicesError) {
      console.warn("⚠️  Warning seeding services:", servicesError.message);
    } else {
      console.log(`✅ Seeded ${services?.length || 0} services`);
    }

    // Seed customers
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .insert([
        {
          salon_id: salonId,
          full_name: "Lars Olsen",
          email: "lars.olsen@example.com",
          phone: "+4790000001",
        },
        {
          salon_id: salonId,
          full_name: "Kari Nordmann",
          email: "kari.nordmann@example.com",
          phone: "+4790000002",
        },
        {
          salon_id: salonId,
          full_name: "Erik Svendsen",
          email: "erik.svendsen@example.com",
          phone: "+4790000003",
        },
        {
          salon_id: salonId,
          full_name: "Ingrid Haugen",
          email: "ingrid.haugen@example.com",
          phone: "+4790000004",
        },
      ])
      .select();

    if (customersError) {
      console.warn("⚠️  Warning seeding customers:", customersError.message);
    } else {
      console.log(`✅ Seeded ${customers?.length || 0} customers`);
    }

    // Seed shifts (Monday-Friday 09:00-17:00, Saturday 10:00-15:00)
    if (employees && employees.length > 0) {
      const shifts = [];
      for (const employee of employees) {
        // Monday to Friday
        for (let weekday = 1; weekday <= 5; weekday++) {
          shifts.push({
            salon_id: salonId,
            employee_id: employee.id,
            weekday,
            start_time: "09:00",
            end_time: "17:00",
          });
        }
        // Saturday (shorter hours)
        shifts.push({
          salon_id: salonId,
          employee_id: employee.id,
          weekday: 6,
          start_time: "10:00",
          end_time: "15:00",
        });
      }

      const { data: shiftsData, error: shiftsError } = await supabase.from("shifts").insert(shifts).select();

      if (shiftsError) {
        console.warn("⚠️  Warning seeding shifts:", shiftsError.message);
      } else {
        console.log(`✅ Seeded ${shiftsData?.length || 0} shifts`);
      }
    }

    // Seed opening hours
    const openingHours = [
      { salon_id: salonId, weekday: 0, open_time: "00:00", close_time: "00:00", is_closed: true }, // Sunday
      { salon_id: salonId, weekday: 1, open_time: "09:00", close_time: "18:00", is_closed: false }, // Monday
      { salon_id: salonId, weekday: 2, open_time: "09:00", close_time: "18:00", is_closed: false }, // Tuesday
      { salon_id: salonId, weekday: 3, open_time: "09:00", close_time: "18:00", is_closed: false }, // Wednesday
      { salon_id: salonId, weekday: 4, open_time: "09:00", close_time: "20:00", is_closed: false }, // Thursday (late)
      { salon_id: salonId, weekday: 5, open_time: "09:00", close_time: "18:00", is_closed: false }, // Friday
      { salon_id: salonId, weekday: 6, open_time: "10:00", close_time: "15:00", is_closed: false }, // Saturday
    ];

    const { data: hoursData, error: hoursError } = await supabase.from("opening_hours").insert(openingHours).select();

    if (hoursError) {
      console.warn("⚠️  Warning seeding opening hours:", hoursError.message);
    } else {
      console.log(`✅ Seeded ${hoursData?.length || 0} opening hours entries`);
    }

    // Seed products
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
        {
          salon_id: salonId,
          name: "Shampoo",
          price_cents: 18000,
          stock: 25,
          is_active: true,
        },
        {
          salon_id: salonId,
          name: "Conditioner",
          price_cents: 18000,
          stock: 20,
          is_active: true,
        },
      ])
      .select();

    if (productsError) {
      console.warn("⚠️  Warning seeding products:", productsError.message);
    } else {
      console.log(`✅ Seeded ${products?.length || 0} products`);
    }

    // Seed sample bookings (next few days)
    if (employees && employees.length > 0 && services && services.length > 0 && customers && customers.length > 0) {
      const bookings = [];
      const today = new Date();

      // Create bookings for the next 3 days
      for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        const bookingDate = new Date(today);
        bookingDate.setDate(bookingDate.getDate() + dayOffset);

        // Skip if it's Sunday
        if (bookingDate.getDay() === 0) continue;

        // Create 2-3 bookings per day
        const bookingsPerDay = Math.min(2 + dayOffset, customers.length);

        for (let i = 0; i < bookingsPerDay; i++) {
          const startTime = new Date(bookingDate);
          startTime.setHours(10 + i * 2, 0, 0, 0); // 10:00, 12:00, 14:00

          const service = services[i % services.length];
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + service.duration_minutes);

          bookings.push({
            salon_id: salonId,
            customer_id: customers[i % customers.length].id,
            employee_id: employees[i % employees.length].id,
            service_id: service.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: "confirmed",
          });
        }
      }

      const { data: bookingsData, error: bookingsError } = await supabase.from("bookings").insert(bookings).select();

      if (bookingsError) {
        console.warn("⚠️  Warning seeding bookings:", bookingsError.message);
      } else {
        console.log(`✅ Seeded ${bookingsData?.length || 0} sample bookings`);
      }
    }

    console.log("\n✨ Seed completed successfully!");
    console.log(`\n📋 Summary:`);
    console.log(`   Salon: ${salonName} (slug: ${TEST_SALON_SLUG})`);
    console.log(`   Employees: ${employees?.length || 0}`);
    console.log(`   Services: ${services?.length || 0}`);
    console.log(`   Customers: ${customers?.length || 0}`);
    console.log(`   Products: ${products?.length || 0}`);
    console.log(`\n🔗 Public booking page: /book/${TEST_SALON_SLUG}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

async function reset() {
  console.log("🔄 Resetting database...\n");

  try {
    // WARNING: This deletes all data!
    // Delete in correct order to respect foreign key constraints
    const tables = ["bookings", "customers", "shifts", "employees", "services", "products", "opening_hours", "profiles", "salons"];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        console.warn(`⚠️  Warning: Could not reset ${table}:`, error.message);
      } else {
        console.log(`✅ Reset ${table}`);
      }
    }

    console.log("\n✨ Reset completed!");
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
const shouldReset = args.includes("--reset");
const shouldForce = args.includes("--force");

(async () => {
  if (shouldReset) {
    await reset();
  }
  await seed(shouldForce || shouldReset);
})();

