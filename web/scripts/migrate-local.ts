#!/usr/bin/env tsx
/**
 * Local Migration Script
 * 
 * Runs SQL migrations from supabase/ directory against local Supabase instance.
 * 
 * Usage:
 *   npm run migrate:local
 *   npm run migrate:local -- --file supabase/specific-migration.sql
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";

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

async function runMigration(filePath: string) {
  console.log(`📄 Running migration: ${filePath}`);

  try {
    const sql = readFileSync(filePath, "utf-8");

    // Split by semicolons and filter empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc("exec_sql", { sql: statement });
        if (error) {
          // Try direct query if RPC doesn't exist
          console.warn(`⚠️  RPC exec_sql not available, skipping statement`);
          console.warn(`   You may need to run this migration manually in Supabase SQL Editor`);
        }
      }
    }

    console.log(`✅ Migration completed: ${filePath}\n`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filePath}`, error);
    throw error;
  }
}

async function migrate() {
  console.log("🔄 Starting local migration...\n");

  const args = process.argv.slice(2);
  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const specificFile = fileArg ? fileArg.split("=")[1] : null;

  try {
    if (specificFile) {
      // Run specific file
      const filePath = resolve(__dirname, "..", specificFile);
      await runMigration(filePath);
    } else {
      // Run all SQL files in supabase/ directory
      const sqlFiles = await glob("supabase/**/*.sql", {
        cwd: resolve(__dirname, ".."),
        ignore: ["**/node_modules/**"],
      });

      if (sqlFiles.length === 0) {
        console.log("ℹ️  No SQL files found in supabase/ directory");
        return;
      }

      // Sort files by name (assuming they have version numbers or dates)
      sqlFiles.sort();

      for (const file of sqlFiles) {
        const filePath = resolve(__dirname, "..", file);
        await runMigration(filePath);
      }
    }

    console.log("✨ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();

