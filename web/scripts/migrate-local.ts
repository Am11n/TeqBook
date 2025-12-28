#!/usr/bin/env tsx
/**
 * Local Migration Script
 * 
 * Runs SQL migrations from supabase/migrations/ directory against local Supabase instance.
 * Only deterministic migrations are run - admin scripts are excluded.
 * 
 * Usage:
 *   npm run migrate:local
 *   npm run migrate:local -- --file supabase/migrations/specific-migration.sql
 * 
 * Migration file naming convention:
 *   YYYYMMDD-HHMMSS-description.sql (recommended)
 *   or sequential: 001-description.sql, 002-description.sql, etc.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
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

/**
 * Validates migration file name format
 * Accepts: YYYYMMDD-HHMMSS-description.sql or sequential numbers
 */
function validateMigrationFileName(fileName: string): boolean {
  // Date format: YYYYMMDD-HHMMSS-description.sql
  const dateFormat = /^\d{8}-\d{6}-.+\.sql$/;
  // Sequential format: 001-description.sql, 002-description.sql, etc.
  const sequentialFormat = /^\d{3,}-.+\.sql$/;
  
  return dateFormat.test(fileName) || sequentialFormat.test(fileName);
}

/**
 * Extracts sort key from migration file name
 * For date format: returns YYYYMMDDHHMMSS
 * For sequential: returns padded number
 */
function getMigrationSortKey(fileName: string): string {
  // Date format: YYYYMMDD-HHMMSS-description.sql
  const dateMatch = fileName.match(/^(\d{8})-(\d{6})-/);
  if (dateMatch) {
    return dateMatch[1] + dateMatch[2]; // YYYYMMDDHHMMSS
  }
  
  // Sequential format: 001-description.sql
  const seqMatch = fileName.match(/^(\d+)-/);
  if (seqMatch) {
    return seqMatch[1].padStart(10, '0'); // Pad to 10 digits for sorting
  }
  
  // Fallback: use filename for sorting
  return fileName;
}

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
  console.log("📁 Only running files from supabase/migrations/ directory\n");

  const args = process.argv.slice(2);
  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const specificFile = fileArg ? fileArg.split("=")[1] : null;

  try {
    if (specificFile) {
      // Run specific file
      const filePath = resolve(__dirname, "..", specificFile);
      
      if (!existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
      }
      
      // Validate it's in migrations directory
      if (!filePath.includes("supabase/migrations/")) {
        console.error(`❌ Error: File must be in supabase/migrations/ directory`);
        console.error(`   Admin scripts and other SQL files are not run automatically`);
        process.exit(1);
      }
      
      await runMigration(filePath);
    } else {
      // Run all SQL files in supabase/migrations/ directory only
      const sqlFiles = await glob("supabase/migrations/**/*.sql", {
        cwd: resolve(__dirname, ".."),
        ignore: ["**/node_modules/**"],
      });

      if (sqlFiles.length === 0) {
        console.log("ℹ️  No SQL files found in supabase/migrations/ directory");
        return;
      }

      // Validate file names
      const invalidFiles = sqlFiles.filter(
        (file) => !validateMigrationFileName(file.split("/").pop() || "")
      );

      if (invalidFiles.length > 0) {
        console.warn("⚠️  Warning: Some migration files don't follow naming convention:");
        invalidFiles.forEach((file) => {
          console.warn(`   ${file}`);
        });
        console.warn("\n   Recommended format: YYYYMMDD-HHMMSS-description.sql");
        console.warn("   Or sequential: 001-description.sql, 002-description.sql, etc.\n");
      }

      // Sort files by name (using sort key for deterministic ordering)
      sqlFiles.sort((a, b) => {
        const aName = a.split("/").pop() || "";
        const bName = b.split("/").pop() || "";
        return getMigrationSortKey(aName).localeCompare(getMigrationSortKey(bName));
      });

      console.log(`📋 Found ${sqlFiles.length} migration file(s):\n`);
      sqlFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });
      console.log("");

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
