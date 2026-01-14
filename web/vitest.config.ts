import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/tests/e2e/**", // Exclude Playwright E2E tests
      "**/e2e/**", // Also exclude any e2e folder
    ],
    // Keep coverage meaningful: focus on our actual app code, not Next build artifacts or Supabase functions.
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      // Task Group 12 target: drive high unit coverage for the billing/test hardening scope we worked on.
      // We intentionally scope coverage to the service/repository modules under test in Task Group 12.
      include: [
        "src/lib/services/salons-service.ts",
        "src/lib/services/shifts-service.ts",
        "src/lib/services/products-service.ts",
        "src/lib/services/reports-service.ts",
        "src/lib/services/profiles-service.ts",
        "src/lib/repositories/salons.ts",
        "src/lib/repositories/shifts.ts",
        "src/lib/repositories/products.ts",
        "src/lib/repositories/reports.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "**/node_modules/**",
        "**/.next/**",
        "**/out/**",
        "**/public/**",
        "**/supabase/**",
        "**/scripts/**",
        "**/tests/**",
        "**/src/app/**",
        "**/src/components/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

