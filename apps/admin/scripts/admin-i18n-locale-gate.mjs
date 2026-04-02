import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const file = path.join(root, "src/i18n/admin-console/index.ts");
const content = fs.readFileSync(file, "utf8");
const locales = ["nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi"];
const missing = locales.filter((l) => !new RegExp(`^\\s*${l}\\s*:`, "m").test(content));
if (missing.length) {
  console.error("Missing locale entries in src/i18n/admin-console/index.ts:", missing.join(", "));
  process.exit(1);
}
