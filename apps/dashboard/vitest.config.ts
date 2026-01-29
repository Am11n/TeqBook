import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/tests/e2e/**",
      "**/e2e/**",
      "**/tests/integration/**",
      "**/tests/docs/**",
      "**/tests/rls/**",
      // Dashboard har ikke valideringsmoduler – behold ekskludert til de er lagt til
      "**/tests/unit/type-safety.test.ts",
      // Radix DropdownMenu åpnes ikke med fireEvent i jsdom – krever user-event eller E2E
      "**/tests/components/BookingsTable.test.tsx",
      "**/tests/components/table-system.test.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/lib/services/**/*.ts", "src/lib/repositories/**/*.ts"],
      exclude: [
        "**/*.d.ts",
        "**/node_modules/**",
        "**/.next/**",
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
