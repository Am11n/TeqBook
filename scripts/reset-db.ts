#!/usr/bin/env tsx
/**
 * Reset Database Script
 * 
 * Resets the local database by dropping and recreating all tables.
 * WARNING: This will delete all data!
 * 
 * Usage:
 *   npm run reset:db
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

const targetEnv = process.env.TEQBOOK_ENV_TARGET;
if (targetEnv !== "staging") {
  console.error("❌ reset:db is only allowed when TEQBOOK_ENV_TARGET=staging");
  process.exit(1);
}

async function resetDatabase() {
  console.log("⚠️  WARNING: This will delete ALL data in the database!");
  console.log("   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("🔄 Resetting database...\n");

  try {
    // List of tables in dependency order (delete children first)
    const tables = [
      "bookings",
      "employee_services",
      "shifts",
      "opening_hours",
      "customers",
      "employees",
      "services",
      "profiles",
      "salons",
    ];

    for (const table of tables) {
      console.log(`🗑️  Deleting all rows from ${table}...`);
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        console.warn(`⚠️  Warning: Could not delete from ${table}:`, error.message);
      } else {
        console.log(`✅ Deleted all rows from ${table}`);
      }
    }

    console.log("\n✨ Database reset completed!");
    console.log("💡 Run 'npm run seed' to populate with test data");
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

resetDatabase();

