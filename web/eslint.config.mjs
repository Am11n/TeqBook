import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Prevent direct Supabase imports in UI layer (scripts are allowed)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/supabase-client", "@supabase/supabase-js"],
              message:
                "Direct Supabase imports are not allowed in UI layer. Use services instead: import from '@/lib/services/*'",
              importNames: undefined,
            },
          ],
          paths: [
            {
              name: "@/lib/supabase-client",
              message:
                "Direct Supabase imports are not allowed in UI layer. Use services instead: import from '@/lib/services/*'",
              importNames: undefined,
            },
            {
              name: "@supabase/supabase-js",
              message:
                "Direct Supabase imports are not allowed in UI layer. Use services instead: import from '@/lib/services/*'",
              importNames: undefined,
            },
          ],
        },
      ],
      // Forbid direct <label> usage in feature code - must use <Field /> component
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXElement[openingElement.name.name='label']",
          message:
            "Direct <label> usage is not allowed in feature code. Use <Field /> component from '@/components/form/Field' instead. Labels are only allowed inside 'components/form/**' directory.",
        },
      ],
    },
    // Apply rules only to UI layer files (except form components directory)
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "!src/components/form/**/*.{ts,tsx}",
    ],
  },
  // Allow scripts to use Supabase directly
  {
    rules: {
      "no-restricted-imports": "off",
    },
    files: ["scripts/**/*.{ts,tsx}"],
  },
]);

export default eslintConfig;
