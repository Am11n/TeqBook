import fs from "fs";
import path from "path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const MAX = 300;

/** Globs as roots to scan for *.ts (not recursive into node_modules) */
const SCAN_DIRS = [
  ["src", "i18n"],
  ["src", "app", "salon", "[slug]", "profile-i18n"],
  ["src", "components", "landing", "landing-copy"],
];

function walkTsFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkTsFiles(full, out);
    else if (name.endsWith(".ts")) out.push(full);
  }
}

function main() {
  const bad = [];
  for (const parts of SCAN_DIRS) {
    const dir = path.join(ROOT, ...parts);
    const files = [];
    walkTsFiles(dir, files);
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      const lines = text.split("\n").length;
      if (lines > MAX) bad.push({ file: path.relative(ROOT, file), lines });
    }
  }
  if (bad.length) {
    console.error(`i18n max-lines check failed (max ${MAX} lines):`);
    for (const { file, lines } of bad.sort((a, b) => b.lines - a.lines)) {
      console.error(`- ${file}: ${lines} lines`);
    }
    process.exit(1);
  }
  console.log(`i18n max-lines check passed (≤${MAX} in scanned trees).`);
}

main();
