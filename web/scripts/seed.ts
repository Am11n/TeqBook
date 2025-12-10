#!/usr/bin/env tsx
/**
 * Seed Script
 * 
 * Seeds the database with initial data for development/testing.
 * 
 * Usage:
 *   npm run seed
 *   npm run seed -- --reset  # Reset database before seeding
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Example: Seed a test salon
    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .insert({
        name: "Test Salon",
        slug: "test-salon",
        is_public: true,
        preferred_language: "en",
        salon_type: "barber",
      })
      .select()
      .single();

    if (salonError) {
      console.error("❌ Error seeding salon:", salonError.message);
      return;
    }

    console.log("✅ Seeded salon:", salon.name);

    // Example: Seed test services
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .insert([
        {
          salon_id: salon.id,
          name: "Haircut",
          category: "cut",
          duration_minutes: 30,
          price_cents: 50000,
          is_active: true,
          sort_order: 1,
        },
        {
          salon_id: salon.id,
          name: "Beard Trim",
          category: "beard",
          duration_minutes: 15,
          price_cents: 25000,
          is_active: true,
          sort_order: 2,
        },
      ])
      .select();

    if (servicesError) {
      console.error("❌ Error seeding services:", servicesError.message);
      return;
    }

    console.log(`✅ Seeded ${services.length} services`);

    console.log("\n✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

async function reset() {
  console.log("🔄 Resetting database...\n");

  try {
    // WARNING: This deletes all data!
    // In production, you should use migrations instead
    const tables = ["bookings", "customers", "employees", "services", "shifts", "opening_hours", "salons"];

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

(async () => {
  if (shouldReset) {
    await reset();
  }
  await seed();
})();

