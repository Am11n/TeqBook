#!/usr/bin/env tsx
import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { readJsonFile } from "./lib/db-env";

type Manifest = {
  version: number;
  baseline: string;
  postBaseline: string[];
};

type Checksums = {
  baseline: { file: string; sha256: string };
  postBaseline: Array<{ file: string; sha256: string }>;
};

const MANIFEST_PATH = "supabase/supabase/migration-manifest.json";
const CHECKSUM_PATH = "supabase/supabase/migration-checksums.json";

function sha256ForFile(filePath: string): string {
  const fullPath = resolve(process.cwd(), filePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Missing file referenced by manifest: ${filePath}`);
  }
  const content = readFileSync(fullPath);
  return createHash("sha256").update(content).digest("hex");
}

function buildChecksums(manifest: Manifest): Checksums {
  return {
    baseline: {
      file: manifest.baseline,
      sha256: sha256ForFile(manifest.baseline),
    },
    postBaseline: manifest.postBaseline.map((file) => ({
      file,
      sha256: sha256ForFile(file),
    })),
  };
}

function sortAndValidateManifest(manifest: Manifest) {
  const sorted = [...manifest.postBaseline].sort((a, b) => a.localeCompare(b));
  for (let i = 0; i < sorted.length; i += 1) {
    if (manifest.postBaseline[i] !== sorted[i]) {
      throw new Error(
        "postBaseline entries are not in canonical order. Update migration-manifest.json order explicitly.",
      );
    }
  }
}

function lock() {
  const manifest = readJsonFile<Manifest>(MANIFEST_PATH);
  sortAndValidateManifest(manifest);
  const checksums = buildChecksums(manifest);
  writeFileSync(resolve(process.cwd(), CHECKSUM_PATH), `${JSON.stringify(checksums, null, 2)}\n`);
  console.log(`Wrote checksums to ${CHECKSUM_PATH}`);
}

function verify() {
  const manifest = readJsonFile<Manifest>(MANIFEST_PATH);
  sortAndValidateManifest(manifest);
  const expected = readJsonFile<Checksums>(CHECKSUM_PATH);
  const actual = buildChecksums(manifest);
  const expectedRaw = JSON.stringify(expected);
  const actualRaw = JSON.stringify(actual);
  if (expectedRaw !== actualRaw) {
    throw new Error(
      [
        "Manifest checksum verification failed.",
        "Run `pnpm run db:manifest:lock` after intentional migration file updates.",
      ].join(" "),
    );
  }
  console.log("Manifest checksums verified.");
}

function main() {
  const mode = process.argv[2];
  if (!mode || !["lock", "verify"].includes(mode)) {
    console.error("Usage: pnpm run db:manifest:lock | pnpm run db:manifest:verify");
    process.exit(1);
  }
  if (mode === "lock") {
    lock();
    return;
  }
  verify();
}

main();

