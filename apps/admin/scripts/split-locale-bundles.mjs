/**
 * Split apps/admin/src/i18n/{locale}.ts into bundles/{locale}/{ns}.ts (string-aware).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const I18N_ROOT = path.join(__dirname, "../src/i18n");
const LOCALES = [
  "nb", "en", "so", "ar", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi",
];

function findMatchingBrace(src, openIdx) {
  let depth = 1;
  let i = openIdx + 1;
  let str = null;
  while (i < src.length && depth > 0) {
    const c = src[i];
    if (str) {
      if (c === "\\" && (str === '"' || str === "'" || str === "`")) {
        i += 2;
        continue;
      }
      if (c === str) {
        str = null;
        i++;
        continue;
      }
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      str = c;
      i++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") depth--;
    i++;
  }
  return i - 1;
}

function extractNamespaces(src, exportName) {
  const needle = `export const ${exportName}: TranslationNamespaces = `;
  const start = src.indexOf(needle);
  if (start === -1) throw new Error(`Missing export ${exportName}`);
  let i = start + needle.length;
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] !== "{") throw new Error(`Expected { after =`);
  const rootOpen = i;
  i++;
  const keys = [];
  while (i < src.length) {
    while (i < src.length && /\s|,/.test(src[i])) i++;
    if (src[i] === "}") break;
    const rest = src.slice(i);
    const km = /^(\w+)\s*:\s*\{/.exec(rest);
    if (!km) throw new Error(`Expected key at offset ${i}: ${rest.slice(0, 60)}`);
    const key = km[1];
    i += km[0].length;
    const innerOpen = i - 1;
    const closeIdx = findMatchingBrace(src, innerOpen);
    const inner = src.slice(i, closeIdx).trimEnd();
    keys.push({ key, content: inner });
    i = closeIdx + 1;
  }
  const rootClose = findMatchingBrace(src, rootOpen);
  if (rootClose !== src.lastIndexOf("}") || src.trimEnd().endsWith("};") === false) {
    /* best-effort */
  }
  return keys;
}

for (const loc of LOCALES) {
  const filePath = path.join(I18N_ROOT, `${loc}.ts`);
  if (!fs.existsSync(filePath)) {
    console.warn("skip missing", filePath);
    continue;
  }
  const src = fs.readFileSync(filePath, "utf8");
  const parts = extractNamespaces(src, loc);
  const outDir = path.join(I18N_ROOT, "bundles", loc);
  fs.mkdirSync(outDir, { recursive: true });
  const imports = [];
  const spreads = [];
  for (const { key, content } of parts) {
    const chunkFile = path.join(outDir, `${key}.ts`);
    const chunkBody = `import type { TranslationNamespaces } from "../../types/namespaces";\n\nexport const ${key}: TranslationNamespaces["${key}"] = {\n${content}\n};\n`;
    fs.writeFileSync(chunkFile, chunkBody);
    imports.push(`import { ${key} } from "./${key}";`);
    spreads.push(`  ${key},`);
  }
  const indexContent = `${imports.join("\n")}\n\nimport type { TranslationNamespaces } from "../../types/namespaces";\n\nexport const ${loc}: TranslationNamespaces = {\n${spreads.join("\n")}\n};\n`;
  fs.writeFileSync(path.join(outDir, "index.ts"), indexContent);
  console.log(loc, parts.length, "chunks");
}
