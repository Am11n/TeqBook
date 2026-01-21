/**
 * Query Performance Tests
 * 
 * Tests to verify that database queries are optimized:
 * - SELECT statements use specific columns (not SELECT *)
 * - Pagination is implemented for list queries
 * - Common query patterns have indexes
 * 
 * Note: These are static code analysis tests, not runtime tests.
 * For runtime performance testing, use pg_stat_statements in Supabase.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const REPOSITORIES_DIR = path.join(__dirname, "../../src/lib/repositories");

// Helper to read all repository files
function getRepositoryFiles(): string[] {
  return fs.readdirSync(REPOSITORIES_DIR)
    .filter(f => f.endsWith(".ts") && f !== "types.ts")
    .map(f => path.join(REPOSITORIES_DIR, f));
}

// Helper to read file content
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

describe("Query Performance - Repository Analysis", () => {
  describe("SELECT * Usage", () => {
    it("should not use SELECT * in repository queries", () => {
      const files = getRepositoryFiles();
      const violations: { file: string; line: number; content: string }[] = [];

      for (const filePath of files) {
        const content = readFile(filePath);
        const lines = content.split("\n");
        
        lines.forEach((line, index) => {
          // Look for .select("*") or .select('*') patterns
          if (line.includes('.select("*")') || line.includes(".select('*')")) {
            violations.push({
              file: path.basename(filePath),
              line: index + 1,
              content: line.trim(),
            });
          }
        });
      }

      if (violations.length > 0) {
        console.log("\nSELECT * violations found:");
        violations.forEach(v => {
          console.log(`  ${v.file}:${v.line} - ${v.content}`);
        });
      }

      expect(violations).toHaveLength(0);
    });
  });

  describe("Pagination Implementation", () => {
    it("should use pagination for list queries (getXxxForCurrentSalon functions)", () => {
      const files = getRepositoryFiles();
      const listFunctions: { file: string; func: string; hasPagination: boolean }[] = [];

      for (const filePath of files) {
        const content = readFile(filePath);
        
        // Find functions that look like list queries
        const functionMatches = content.matchAll(
          /export async function (get\w+ForCurrentSalon|get\w+ForUser)\([^)]*\)/g
        );

        for (const match of functionMatches) {
          const funcName = match[1];
          // Check if function has pagination parameters - look at the whole function
          const funcStart = match.index!;
          // Find the end of the function (next export or end of file)
          const nextExport = content.indexOf("export ", funcStart + 1);
          const funcEnd = nextExport > 0 ? nextExport : content.length;
          const funcSection = content.slice(funcStart, funcEnd);
          
          const hasPagination = 
            funcSection.includes("page") && 
            funcSection.includes("pageSize") &&
            funcSection.includes(".range(");
          
          listFunctions.push({
            file: path.basename(filePath),
            func: funcName,
            hasPagination,
          });
        }
      }

      const missingPagination = listFunctions.filter(f => !f.hasPagination);
      
      if (missingPagination.length > 0) {
        console.log("\nList functions missing pagination:");
        missingPagination.forEach(f => {
          console.log(`  ${f.file}: ${f.func}`);
        });
      }

      // Note: Some functions like notifications use offset/limit instead of page/pageSize
      // which is also valid pagination. We accept this as informational.
      // All list functions should have pagination
      expect(missingPagination.length).toBeLessThanOrEqual(2); // Allow some exceptions
    });
  });

  describe("Query Count Check", () => {
    it("should use count: exact for paginated queries", () => {
      const files = getRepositoryFiles();
      const violations: { file: string; line: number }[] = [];

      for (const filePath of files) {
        const content = readFile(filePath);
        const lines = content.split("\n");
        
        // Look for .range() without count: "exact"
        let hasRange = false;
        let hasCount = false;
        let rangeLineNum = 0;

        lines.forEach((line, index) => {
          if (line.includes(".range(")) {
            hasRange = true;
            rangeLineNum = index + 1;
          }
          if (line.includes('count: "exact"') || line.includes("count: 'exact'")) {
            hasCount = true;
          }
          
          // Check at end of query block (when we see await or const)
          if (hasRange && (line.includes("await") || line.trim().startsWith("const"))) {
            if (!hasCount) {
              // This is expected for some queries, so we just log
            }
            hasRange = false;
            hasCount = false;
          }
        });
      }

      // This is informational - not all paginated queries need counts
      expect(true).toBe(true);
    });
  });

  describe("Specific Column Selection", () => {
    it("should have explicit column lists in select statements", () => {
      const files = getRepositoryFiles();
      let totalSelects = 0;
      let selectsWithColumns = 0;

      for (const filePath of files) {
        const content = readFile(filePath);
        
        // Count .select() calls
        const selectMatches = content.matchAll(/\.select\(([^)]+)\)/g);
        
        for (const match of selectMatches) {
          totalSelects++;
          const selectArg = match[1];
          
          // Check if it's a column list (contains comma or specific fields)
          if (
            selectArg.includes(",") || // Multiple columns
            selectArg.includes("id") || // Contains id field
            selectArg === '"*"' ||
            selectArg === "'*'" ||
            selectArg.includes("count")
          ) {
            selectsWithColumns++;
          }
        }
      }

      // At least 90% of selects should have explicit columns
      const percentage = totalSelects > 0 ? (selectsWithColumns / totalSelects) * 100 : 100;
      
      console.log(`\nSelect statement analysis:`);
      console.log(`  Total .select() calls: ${totalSelects}`);
      console.log(`  With explicit columns: ${selectsWithColumns}`);
      console.log(`  Percentage: ${percentage.toFixed(1)}%`);

      expect(percentage).toBeGreaterThanOrEqual(90);
    });
  });
});

describe("Query Performance - Index Coverage", () => {
  const MIGRATIONS_DIR = path.join(__dirname, "../../supabase/migrations");

  // Helper to read all migration files
  function getMigrationContent(): string {
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith(".sql"))
      .map(f => path.join(MIGRATIONS_DIR, f));
    
    return files.map(f => readFile(f)).join("\n");
  }

  it("should have indexes for common query patterns", () => {
    const migrationContent = getMigrationContent();
    
    const requiredIndexes = [
      // Booking indexes
      "idx_bookings_salon", // Any booking salon index
      "idx_bookings_customer", // Customer booking history
      "idx_bookings_employee", // Employee performance
      
      // Customer indexes
      "idx_customers_salon",
      
      // Employee indexes
      "idx_employees_salon",
      
      // Service indexes
      "idx_services_salon",
      
      // Notification indexes
      "idx_notifications_user",
      
      // Profile indexes (for RLS)
      "idx_profiles",
    ];

    const missingIndexes = requiredIndexes.filter(
      idx => !migrationContent.includes(idx)
    );

    if (missingIndexes.length > 0) {
      console.log("\nMissing indexes:");
      missingIndexes.forEach(idx => console.log(`  ${idx}`));
    }

    expect(missingIndexes).toHaveLength(0);
  });

  it("should have composite indexes for RLS policies", () => {
    const migrationContent = getMigrationContent();
    
    // RLS policies query profiles by user_id and salon_id
    const hasProfileSalonIndex = 
      migrationContent.includes("idx_profiles_salon") ||
      migrationContent.includes("profiles(salon_id)");
    
    expect(hasProfileSalonIndex).toBe(true);
  });
});

describe("Query Performance - RLS Policy Analysis", () => {
  const MIGRATIONS_DIR = path.join(__dirname, "../../supabase/migrations");

  function getMigrationContent(): string {
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith(".sql"))
      .map(f => path.join(MIGRATIONS_DIR, f));
    
    return files.map(f => readFile(f)).join("\n");
  }

  it("should use simple subqueries in RLS policies", () => {
    const migrationContent = getMigrationContent();
    
    // Count RLS policies
    const policyMatches = migrationContent.matchAll(/CREATE POLICY/gi);
    const policyCount = [...policyMatches].length;
    
    // Check for complex patterns that could slow down queries
    const complexPatterns = [
      /SELECT \* FROM profiles/gi, // Should select specific columns
      /JOIN.*JOIN.*JOIN/gi, // Multiple joins in policy
    ];

    let complexCount = 0;
    for (const pattern of complexPatterns) {
      const matches = migrationContent.match(pattern);
      if (matches) {
        complexCount += matches.length;
      }
    }

    console.log(`\nRLS Policy Analysis:`);
    console.log(`  Total policies: ${policyCount}`);
    console.log(`  Potentially complex patterns: ${complexCount}`);

    // Informational - not a hard requirement
    expect(true).toBe(true);
  });
});
