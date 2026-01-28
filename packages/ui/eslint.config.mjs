export default [
  { ignores: ["**/node_modules/**", "**/dist/**", "*.d.ts"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parserOptions: { ecmaVersion: "latest" } },
    rules: {},
  },
];
