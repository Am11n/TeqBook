/**
 * RLS Test Utilities
 * Task Group 25: RLS Policy Tests
 * 
 * Utilities for testing Row Level Security policies.
 * These tests verify that data isolation between tenants works correctly.
 */

import { describe, it, expect } from "vitest";

// =====================================================
// Types
// =====================================================

export type RLSTable =
  | "bookings"
  | "customers"
  | "employees"
  | "services"
  | "shifts"
  | "salons"
  | "profiles"
  | "products"
  | "notifications"
  | "audit_log";

export type RLSOperation = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

export type RLSPolicy = {
  table: RLSTable;
  policyName: string;
  operation: RLSOperation;
  description: string;
};

export type RLSPolicyPattern = {
  name: string;
  description: string;
  pattern: string;
  useCases: string[];
};

// =====================================================
// Standard RLS Patterns
// =====================================================

/**
 * Standard RLS patterns used in TeqBook
 */
export const RLS_PATTERNS: RLSPolicyPattern[] = [
  {
    name: "Tenant Isolation (salon_id)",
    description: "Users can only access data belonging to their salon",
    pattern: `salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid())`,
    useCases: ["bookings", "customers", "employees", "services", "shifts", "products"],
  },
  {
    name: "Self-Access (user_id)",
    description: "Users can only access their own data",
    pattern: `user_id = auth.uid()`,
    useCases: ["profiles", "notifications"],
  },
  {
    name: "Superadmin Override",
    description: "Superadmins can access all data",
    pattern: `EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = TRUE)`,
    useCases: ["All tables for SELECT", "audit_log"],
  },
  {
    name: "Owner-Only Access",
    description: "Only salon owners can access sensitive data",
    pattern: `EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND salon_id = <table>.salon_id AND role = 'owner')`,
    useCases: ["billing data", "salon settings"],
  },
];

// =====================================================
// Expected Policies by Table
// =====================================================

/**
 * Expected RLS policies for each table
 */
export const EXPECTED_POLICIES: Record<RLSTable, RLSPolicy[]> = {
  bookings: [
    { table: "bookings", policyName: "Users can view bookings for their salon", operation: "SELECT", description: "Tenant isolation for viewing" },
    { table: "bookings", policyName: "Users can insert bookings for their salon", operation: "INSERT", description: "Tenant isolation for creating" },
    { table: "bookings", policyName: "Users can update bookings for their salon", operation: "UPDATE", description: "Tenant isolation for updating" },
    { table: "bookings", policyName: "Users can delete bookings for their salon", operation: "DELETE", description: "Tenant isolation for deleting" },
    { table: "bookings", policyName: "Superadmins can view all bookings", operation: "SELECT", description: "Superadmin override" },
  ],
  customers: [
    { table: "customers", policyName: "Users can view customers for their salon", operation: "SELECT", description: "Tenant isolation for viewing" },
    { table: "customers", policyName: "Users can insert customers for their salon", operation: "INSERT", description: "Tenant isolation for creating" },
    { table: "customers", policyName: "Users can update customers for their salon", operation: "UPDATE", description: "Tenant isolation for updating" },
    { table: "customers", policyName: "Users can delete customers for their salon", operation: "DELETE", description: "Tenant isolation for deleting" },
    { table: "customers", policyName: "Superadmins can view all customers", operation: "SELECT", description: "Superadmin override" },
  ],
  employees: [
    { table: "employees", policyName: "Users can view employees for their salon", operation: "SELECT", description: "Tenant isolation for viewing" },
    { table: "employees", policyName: "Users can insert employees for their salon", operation: "INSERT", description: "Tenant isolation for creating" },
    { table: "employees", policyName: "Users can update employees for their salon", operation: "UPDATE", description: "Tenant isolation for updating" },
    { table: "employees", policyName: "Users can delete employees for their salon", operation: "DELETE", description: "Tenant isolation for deleting" },
    { table: "employees", policyName: "Superadmins can view all employees", operation: "SELECT", description: "Superadmin override" },
  ],
  services: [
    { table: "services", policyName: "Users can view services for their salon", operation: "SELECT", description: "Tenant isolation for viewing" },
    { table: "services", policyName: "Users can insert services for their salon", operation: "INSERT", description: "Tenant isolation for creating" },
    { table: "services", policyName: "Users can update services for their salon", operation: "UPDATE", description: "Tenant isolation for updating" },
    { table: "services", policyName: "Users can delete services for their salon", operation: "DELETE", description: "Tenant isolation for deleting" },
    { table: "services", policyName: "Superadmins can view all services", operation: "SELECT", description: "Superadmin override" },
  ],
  shifts: [
    { table: "shifts", policyName: "Users can view shifts for their salon", operation: "SELECT", description: "Tenant isolation for viewing" },
    { table: "shifts", policyName: "Users can insert shifts for their salon", operation: "INSERT", description: "Tenant isolation for creating" },
    { table: "shifts", policyName: "Users can update shifts for their salon", operation: "UPDATE", description: "Tenant isolation for updating" },
    { table: "shifts", policyName: "Users can delete shifts for their salon", operation: "DELETE", description: "Tenant isolation for deleting" },
    { table: "shifts", policyName: "Superadmins can view all shifts", operation: "SELECT", description: "Superadmin override" },
  ],
  salons: [
    { table: "salons", policyName: "Users can view their own salon", operation: "SELECT", description: "Self-access for viewing" },
    { table: "salons", policyName: "Users can update their own salon", operation: "UPDATE", description: "Self-access for updating" },
    { table: "salons", policyName: "Superadmins can view all salons", operation: "SELECT", description: "Superadmin override" },
    { table: "salons", policyName: "Superadmins can update all salons", operation: "UPDATE", description: "Superadmin override" },
  ],
  profiles: [
    { table: "profiles", policyName: "Users can view their own profile", operation: "SELECT", description: "Self-access" },
    { table: "profiles", policyName: "Users can update their own profile", operation: "UPDATE", description: "Self-access" },
    { table: "profiles", policyName: "Users can insert their own profile", operation: "INSERT", description: "Self-access" },
  ],
  products: [
    { table: "products", policyName: "Users can view products for their salon", operation: "SELECT", description: "Tenant isolation for viewing" },
    { table: "products", policyName: "Users can insert products for their salon", operation: "INSERT", description: "Tenant isolation for creating" },
    { table: "products", policyName: "Users can update products for their salon", operation: "UPDATE", description: "Tenant isolation for updating" },
    { table: "products", policyName: "Users can delete products for their salon", operation: "DELETE", description: "Tenant isolation for deleting" },
    { table: "products", policyName: "Superadmins can view all products", operation: "SELECT", description: "Superadmin override" },
  ],
  notifications: [
    { table: "notifications", policyName: "Users can view their own notifications", operation: "SELECT", description: "Self-access" },
    { table: "notifications", policyName: "Users can update their own notifications", operation: "UPDATE", description: "Self-access" },
  ],
  audit_log: [
    { table: "audit_log", policyName: "Superadmins can view audit log", operation: "SELECT", description: "Superadmin only" },
  ],
};

// =====================================================
// Tables with Tenant Isolation
// =====================================================

/**
 * Tables that use salon_id for tenant isolation
 */
export const TENANT_ISOLATED_TABLES: RLSTable[] = [
  "bookings",
  "customers",
  "employees",
  "services",
  "shifts",
  "products",
];

/**
 * Tables that use user_id for self-access
 */
export const SELF_ACCESS_TABLES: RLSTable[] = [
  "profiles",
  "notifications",
];

/**
 * Tables with superadmin-only access
 */
export const SUPERADMIN_ONLY_TABLES: RLSTable[] = [
  "audit_log",
];

// =====================================================
// Verification Helpers
// =====================================================

/**
 * Check if a table should have tenant isolation
 */
export function shouldHaveTenantIsolation(table: RLSTable): boolean {
  return TENANT_ISOLATED_TABLES.includes(table);
}

/**
 * Check if a table should have self-access pattern
 */
export function shouldHaveSelfAccess(table: RLSTable): boolean {
  return SELF_ACCESS_TABLES.includes(table);
}

/**
 * Check if a table should have superadmin override
 */
export function shouldHaveSuperadminOverride(table: RLSTable): boolean {
  // Most tables should have superadmin SELECT override
  return !SELF_ACCESS_TABLES.includes(table);
}

/**
 * Get expected operations for a table
 */
export function getExpectedOperations(table: RLSTable): RLSOperation[] {
  if (table === "audit_log") {
    return ["SELECT"]; // Audit log is read-only
  }
  if (table === "salons") {
    return ["SELECT", "UPDATE"]; // INSERT via RPC
  }
  return ["SELECT", "INSERT", "UPDATE", "DELETE"];
}

/**
 * Get expected policies for a table
 */
export function getExpectedPolicies(table: RLSTable): RLSPolicy[] {
  return EXPECTED_POLICIES[table] || [];
}

// =====================================================
// Test Data Generators
// =====================================================

/**
 * Generate mock user context for RLS testing
 */
export function mockUserContext(options: {
  userId: string;
  salonId: string;
  isSuperadmin?: boolean;
  role?: "owner" | "manager" | "staff";
}) {
  return {
    userId: options.userId,
    salonId: options.salonId,
    isSuperadmin: options.isSuperadmin ?? false,
    role: options.role ?? "staff",
  };
}

/**
 * Generate mock data for a tenant-isolated table
 */
export function mockTenantData(table: RLSTable, salonId: string, id?: string) {
  const baseData = {
    id: id ?? `${table}-${Date.now()}`,
    salon_id: salonId,
    created_at: new Date().toISOString(),
  };

  switch (table) {
    case "bookings":
      return { ...baseData, status: "confirmed", start_time: new Date().toISOString() };
    case "customers":
      return { ...baseData, full_name: "Test Customer" };
    case "employees":
      return { ...baseData, full_name: "Test Employee" };
    case "services":
      return { ...baseData, name: "Test Service", duration_minutes: 30 };
    case "shifts":
      return { ...baseData, date: new Date().toISOString().split("T")[0] };
    case "products":
      return { ...baseData, name: "Test Product", price_cents: 1000 };
    default:
      return baseData;
  }
}

// =====================================================
// Policy Verification Messages
// =====================================================

/**
 * Get verification message for RLS test
 */
export function getVerificationMessage(
  scenario: "same_tenant" | "cross_tenant" | "superadmin" | "unauthenticated",
  table: RLSTable,
  operation: RLSOperation,
  shouldSucceed: boolean
): string {
  const scenarioMessages = {
    same_tenant: `User accessing their own salon's ${table}`,
    cross_tenant: `User trying to access another salon's ${table}`,
    superadmin: `Superadmin accessing ${table}`,
    unauthenticated: `Unauthenticated user trying to access ${table}`,
  };

  const expectation = shouldSucceed ? "should succeed" : "should be blocked";
  return `${scenarioMessages[scenario]} (${operation}) ${expectation}`;
}

// =====================================================
// Export all
// =====================================================

export const RLSTestUtils = {
  PATTERNS: RLS_PATTERNS,
  EXPECTED_POLICIES,
  TENANT_ISOLATED_TABLES,
  SELF_ACCESS_TABLES,
  SUPERADMIN_ONLY_TABLES,
  shouldHaveTenantIsolation,
  shouldHaveSelfAccess,
  shouldHaveSuperadminOverride,
  getExpectedOperations,
  getExpectedPolicies,
  mockUserContext,
  mockTenantData,
  getVerificationMessage,
};
