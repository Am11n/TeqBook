import { glob } from "glob";
import { readFileSync } from "fs";

const DEEP_IMPORT_PATTERNS = [
  /@teqbook\/[\w-]+\/src\//,
  /@teqbook\/[\w-]+\/[\w-]+\//,
];

const ALLOWED_DEEP = [
  "@teqbook/shared-data/server",
  "@teqbook/shared-data/services/rate-limit",
];

async function main() {
  const files = await glob("apps/**/src/**/*.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/.next/**"],
  });

  const violations: { file: string; line: number; text: string }[] = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes("@teqbook/")) continue;

      const importMatch = line.match(
        /from\s+["'](@teqbook\/[^"']+)["']|import\s*\(["'](@teqbook\/[^"']+)["']\)/
      );
      if (!importMatch) continue;

      const importPath = importMatch[1] || importMatch[2];
      if (ALLOWED_DEEP.includes(importPath)) continue;

      for (const pattern of DEEP_IMPORT_PATTERNS) {
        if (pattern.test(importPath)) {
          violations.push({ file, line: i + 1, text: importPath });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error("Deep package imports detected:\n");
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line} -> ${v.text}`);
    }
    console.error(
      `\n${violations.length} violation(s). Import from package root only, e.g. @teqbook/feedback`
    );
    process.exit(1);
  }

  console.log("Deep import check passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
