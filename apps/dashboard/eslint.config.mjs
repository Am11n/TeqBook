import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["**/web", "**/web/**"],
              "message": "Importing from legacy web/ is not allowed. Use packages/ or app-local code.",
            },
            {
              "group": ["@teqbook/*/src/*"],
              "message": "Import from package root only, e.g. @teqbook/feedback",
            },
            {
              "group": ["../../apps/*"],
              "message": "Cross-app imports are forbidden. Use a shared package.",
            },
          ],
        },
      ],
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/immutability": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "prefer-const": "warn",
      "react-compiler/react-compiler": "off",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);
