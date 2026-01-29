import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  { ignores: ["**/node_modules/**", "**/dist/**", "*.d.ts"] },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: {},
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {},
  },
];
