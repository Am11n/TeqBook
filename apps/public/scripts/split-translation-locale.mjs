/**
 * Splits apps/public/src/i18n/<locale>.ts into locale-parts/<locale>/{a,b,c,d}.ts
 * Chunking matches TranslationNamespaces top-level keys (stable order).
 */
import fs from "fs";
import path from "path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const I18N = path.join(ROOT, "src", "i18n");
const PARTS_DIR = path.join(I18N, "locale-parts");

const CHUNKS = [
  ["publicBooking"],
  ["login", "signup", "onboarding", "dashboard", "home"],
  ["calendar", "employees", "services", "customers"],
  ["bookings", "shifts", "settings", "admin", "products", "notifications"],
];

const LABELS = ["a", "b", "c", "d"];

function getLocaleObject(source, exportName) {
  for (const stmt of source.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== exportName) continue;
      if (decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
        return decl.initializer;
      }
    }
  }
  return null;
}

function extractPropertyNode(obj, key) {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (ts.isIdentifier(prop.name) && prop.name.text === key) return prop;
    if (ts.isStringLiteral(prop.name) && prop.name.text === key) return prop;
  }
  return null;
}

function sliceText(content, node) {
  return content.slice(node.getStart(), node.getEnd());
}

function splitLocale(locale) {
  const filePath = path.join(I18N, `${locale}.ts`);
  const content = fs.readFileSync(filePath, "utf8");
  const source = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const rootObj = getLocaleObject(source, locale);
  if (!rootObj) {
    console.error(`No export const ${locale} in ${filePath}`);
    process.exit(1);
  }

  const outDir = path.join(PARTS_DIR, locale);
  fs.mkdirSync(outDir, { recursive: true });

  const imports = `import type { TranslationNamespaces } from "../../translations";\n\n`;

  for (let i = 0; i < CHUNKS.length; i++) {
    const keys = CHUNKS[i];
    const label = LABELS[i];
    const props = keys
      .map((k) => {
        const p = extractPropertyNode(rootObj, k);
        if (!p) {
          console.error(`Missing key ${k} in ${locale}`);
          process.exit(1);
        }
        return sliceText(content, p);
      })
      .join(",\n");

    const typeParams = keys.map((k) => `"${k}"`).join(" | ");
    const pick = `Pick<TranslationNamespaces, ${typeParams}>`;

    const body = `${imports}export const ${locale}Part${label.toUpperCase()} = {\n  ${props},\n} satisfies ${pick};\n`;
    fs.writeFileSync(path.join(outDir, `${label}.ts`), body);
  }

  const indexer = `${imports}${LABELS.map((l, i) => `import { ${locale}Part${l.toUpperCase()} } from "./${l}";`).join("\n")}

export const ${locale}: TranslationNamespaces = {
  ...${locale}PartA,
  ...${locale}PartB,
  ...${locale}PartC,
  ...${locale}PartD,
};
`;
  fs.writeFileSync(path.join(outDir, "index.ts"), indexer);

  const barrel = `export { ${locale} } from "./locale-parts/${locale}";\n`;
  fs.writeFileSync(filePath, barrel);
}

const locales = ["en", "nb", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi"];

for (const loc of locales) splitLocale(loc);
console.log("Split complete for", locales.join(", "));
