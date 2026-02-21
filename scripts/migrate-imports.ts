import { glob } from "glob";
import { readFileSync, writeFileSync } from "fs";

/**
 * Bulk-replace old app-local import paths with new @teqbook/* package imports.
 * Run: pnpm tsx scripts/migrate-imports.ts [--dry-run]
 */

type Rule = {
  from: RegExp;
  to: string;
  namedExports?: Record<string, string>;
};

const RULES: Rule[] = [
  {
    from: /^@\/components\/error-boundary$/,
    to: "@teqbook/feedback",
  },
  {
    from: /^@\/components\/feedback\/error-message$/,
    to: "@teqbook/feedback",
  },
  {
    from: /^@\/components\/empty-state$/,
    to: "@teqbook/feedback",
  },
  {
    from: /^@\/components\/shared\/data-table$/,
    to: "@teqbook/data-table",
  },
  {
    from: /^@\/components\/shared\/data-table\/.+$/,
    to: "@teqbook/data-table",
  },
  {
    from: /^@\/components\/layout\/page-layout$/,
    to: "@teqbook/page",
  },
  {
    from: /^@\/components\/stats-bar$/,
    to: "@teqbook/page",
  },
  {
    from: /^@\/components\/filter-chips$/,
    to: "@teqbook/page",
  },
  {
    from: /^@\/components\/layout\/tab-toolbar$/,
    to: "@teqbook/page",
  },
];

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const files = await glob("apps/**/src/**/*.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/.next/**"],
  });

  let totalChanges = 0;
  const manualReview: string[] = [];

  for (const file of files) {
    const original = readFileSync(file, "utf-8");
    let content = original;

    for (const rule of RULES) {
      const importRegex = new RegExp(
        `(from\\s+["'])${rule.from.source}(["'])`,
        "g"
      );
      content = content.replace(importRegex, `$1${rule.to}$2`);
    }

    if (content !== original) {
      totalChanges++;
      console.log(`${dryRun ? "[DRY RUN] " : ""}Updated: ${file}`);
      if (!dryRun) {
        writeFileSync(file, content, "utf-8");
      }
    }

    if (/from\s+["']@\/components\/shared\//.test(content)) {
      manualReview.push(file);
    }
  }

  console.log(`\n${totalChanges} file(s) ${dryRun ? "would be " : ""}updated.`);

  if (manualReview.length > 0) {
    console.log("\nFiles requiring manual review (@/components/shared/ imports):");
    for (const f of manualReview) {
      console.log(`  ${f}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
