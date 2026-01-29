/**
 * API Documentation Tests
 * Task Group 26: API Documentation
 * 
 * Tests to verify API documentation accuracy and completeness.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";

// Paths
const DOCS_DIR = join(process.cwd(), "docs", "api");
const OPENAPI_PATH = join(DOCS_DIR, "openapi.yaml");

// Edge Functions
const EDGE_FUNCTIONS_DIR = join(process.cwd(), "supabase", "functions");

// API Routes
const API_ROUTES_DIR = join(process.cwd(), "src", "app", "api");

describe("API Documentation", () => {
  describe("Documentation Files Exist", () => {
    it("should have openapi.yaml", () => {
      expect(existsSync(OPENAPI_PATH)).toBe(true);
    });

    it("should have README.md", () => {
      expect(existsSync(join(DOCS_DIR, "README.md"))).toBe(true);
    });

    it("should have internal-apis.md", () => {
      expect(existsSync(join(DOCS_DIR, "internal-apis.md"))).toBe(true);
    });

    it("should have examples.md", () => {
      expect(existsSync(join(DOCS_DIR, "examples.md"))).toBe(true);
    });
  });

  describe("OpenAPI Specification", () => {
    let openapi: Record<string, unknown>;

    it("should be valid YAML", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      openapi = parseYaml(content);
      expect(openapi).toBeDefined();
    });

    it("should have required OpenAPI fields", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      openapi = parseYaml(content);

      expect(openapi.openapi).toBeDefined();
      expect(openapi.info).toBeDefined();
      expect(openapi.paths).toBeDefined();
    });

    it("should have valid version", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      openapi = parseYaml(content);

      expect(String(openapi.openapi).startsWith("3.")).toBe(true);
    });

    it("should have API info", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      openapi = parseYaml(content);
      const info = openapi.info as Record<string, unknown>;

      expect(info.title).toBeDefined();
      expect(info.description).toBeDefined();
      expect(info.version).toBeDefined();
    });

    it("should have security scheme defined", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      openapi = parseYaml(content);
      const components = openapi.components as Record<string, unknown>;
      const securitySchemes = components?.securitySchemes as Record<string, unknown>;

      expect(securitySchemes?.bearerAuth).toBeDefined();
    });

    it("should have common response schemas", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      openapi = parseYaml(content);
      const components = openapi.components as Record<string, unknown>;
      const responses = components?.responses as Record<string, unknown>;

      expect(responses?.Unauthorized).toBeDefined();
      expect(responses?.BadRequest).toBeDefined();
      expect(responses?.RateLimited).toBeDefined();
    });
  });

  describe("Documented Edge Functions", () => {
    const expectedEdgeFunctions = [
      "billing-create-customer",
      "billing-create-subscription",
      "billing-update-plan",
      "billing-cancel-subscription",
      "billing-update-payment-method",
      "billing-webhook",
      "process-reminders",
      "rate-limit-check",
    ];

    it.each(expectedEdgeFunctions)("should document %s endpoint", (fnName) => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, unknown>;

      // Check if path exists (with or without leading slash)
      const pathKey = `/${fnName}`;
      expect(paths[pathKey]).toBeDefined();
    });

    it("should have edge functions directory", () => {
      expect(existsSync(EDGE_FUNCTIONS_DIR)).toBe(true);
    });
  });

  describe("Documented API Routes", () => {
    const expectedApiRoutes = [
      "/notifications",
      "/notifications/{id}/read",
      "/notifications/mark-all-read",
      "/notifications/unread-count",
      "/bookings/send-notifications",
      "/bookings/send-cancellation",
    ];

    it.each(expectedApiRoutes)("should document %s route", (route) => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, unknown>;

      expect(paths[route]).toBeDefined();
    });
  });

  describe("Documentation Content Quality", () => {
    it("should have authentication section in README", () => {
      const readme = readFileSync(join(DOCS_DIR, "README.md"), "utf-8");
      expect(readme.toLowerCase()).toContain("authentication");
    });

    it("should have rate limiting section in README", () => {
      const readme = readFileSync(join(DOCS_DIR, "README.md"), "utf-8");
      expect(readme.toLowerCase()).toContain("rate limit");
    });

    it("should have error handling section in README", () => {
      const readme = readFileSync(join(DOCS_DIR, "README.md"), "utf-8");
      expect(readme.toLowerCase()).toContain("error");
    });

    it("should have TypeScript examples in examples.md", () => {
      const examples = readFileSync(join(DOCS_DIR, "examples.md"), "utf-8");
      expect(examples).toContain("```typescript");
    });

    it("should have curl examples in examples.md", () => {
      const examples = readFileSync(join(DOCS_DIR, "examples.md"), "utf-8");
      expect(examples.toLowerCase()).toContain("curl");
    });

    it("should document repositories in internal-apis.md", () => {
      const internal = readFileSync(join(DOCS_DIR, "internal-apis.md"), "utf-8");
      expect(internal.toLowerCase()).toContain("repositories");
    });

    it("should document services in internal-apis.md", () => {
      const internal = readFileSync(join(DOCS_DIR, "internal-apis.md"), "utf-8");
      expect(internal.toLowerCase()).toContain("services");
    });

    it("should document hooks in internal-apis.md", () => {
      const internal = readFileSync(join(DOCS_DIR, "internal-apis.md"), "utf-8");
      expect(internal.toLowerCase()).toContain("hooks");
    });
  });

  describe("OpenAPI Path Details", () => {
    it("should have HTTP methods for each path", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, Record<string, unknown>>;

      for (const [path, pathItem] of Object.entries(paths)) {
        const methods = Object.keys(pathItem);
        const httpMethods = methods.filter((m) =>
          ["get", "post", "put", "patch", "delete"].includes(m)
        );
        expect(httpMethods.length).toBeGreaterThan(0);
      }
    });

    it("should have responses for each endpoint", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, Record<string, unknown>>;

      for (const [path, pathItem] of Object.entries(paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (["get", "post", "put", "patch", "delete"].includes(method)) {
            const op = operation as Record<string, unknown>;
            expect(op.responses).toBeDefined();
          }
        }
      }
    });

    it("should have tags for organization", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, Record<string, unknown>>;

      let hasTaggedEndpoints = false;
      for (const [path, pathItem] of Object.entries(paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (["get", "post", "put", "patch", "delete"].includes(method)) {
            const op = operation as Record<string, unknown>;
            if (op.tags) {
              hasTaggedEndpoints = true;
            }
          }
        }
      }
      expect(hasTaggedEndpoints).toBe(true);
    });
  });

  describe("Billing Endpoints Schema", () => {
    it("should require salon_id for billing operations", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, Record<string, unknown>>;

      const createSub = paths["/billing-create-subscription"]?.post as Record<string, unknown>;
      expect(createSub).toBeDefined();

      const requestBody = createSub.requestBody as Record<string, unknown>;
      const jsonContent = (requestBody.content as Record<string, unknown>)?.["application/json"] as Record<string, unknown>;
      const schema = jsonContent?.schema as Record<string, unknown>;
      const required = schema?.required as string[];

      expect(required).toContain("salon_id");
    });

    it("should validate plan values", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, Record<string, unknown>>;

      const createSub = paths["/billing-create-subscription"]?.post as Record<string, unknown>;
      const requestBody = createSub.requestBody as Record<string, unknown>;
      const jsonContent = (requestBody.content as Record<string, unknown>)?.["application/json"] as Record<string, unknown>;
      const schema = jsonContent?.schema as Record<string, unknown>;
      const properties = schema?.properties as Record<string, Record<string, unknown>>;
      const planEnum = properties?.plan?.enum as string[];

      expect(planEnum).toContain("starter");
      expect(planEnum).toContain("pro");
      expect(planEnum).toContain("business");
    });
  });

  describe("Notification Endpoints Schema", () => {
    it("should have pagination parameters for GET /notifications", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const paths = openapi.paths as Record<string, Record<string, unknown>>;

      const getNotifications = paths["/notifications"]?.get as Record<string, unknown>;
      expect(getNotifications).toBeDefined();

      const parameters = getNotifications.parameters as Array<Record<string, unknown>>;
      const paramNames = parameters?.map((p) => p.name);

      expect(paramNames).toContain("limit");
      expect(paramNames).toContain("offset");
    });

    it("should have Notification schema", () => {
      const content = readFileSync(OPENAPI_PATH, "utf-8");
      const openapi = parseYaml(content);
      const components = openapi.components as Record<string, unknown>;
      const schemas = components?.schemas as Record<string, unknown>;

      expect(schemas?.Notification).toBeDefined();
    });
  });
});
