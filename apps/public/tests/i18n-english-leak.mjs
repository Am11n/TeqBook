/**
 * Fails when non-en locales reuse the exact same English string as `en`
 * for high-visibility namespaces (publicBooking, login UI, profile page, contact page, profile team dialog).
 * Uses length threshold + allowlist to limit false positives.
 */
import fs from "fs";
import path from "path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const I18N_DIR = path.join(ROOT, "src", "i18n");
const PROFILE_DIR = path.join(ROOT, "src", "app", "salon", "[slug]", "profile-i18n");

const LOCALES = ["nb", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi"];
const MIN_LEN = 12;

/** Exact English values that may legitimately match across locales */
const ALLOW_VALUES = new Set([
  "Instagram",
  "Facebook",
  "TikTok",
  "Website",
  "X (Twitter)",
  "Google Maps",
  "TeqBook",
  "Email",
  "min",
]);

function unwrapObjectLiteral(expr) {
  if (!expr) return null;
  if (ts.isObjectLiteralExpression(expr)) return expr;
  if (ts.isSatisfiesExpression(expr)) return unwrapObjectLiteral(expr.expression);
  return null;
}

function getAnyConstObject(source, constName) {
  for (const stmt of source.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== constName) continue;
      const inner = unwrapObjectLiteral(decl.initializer);
      if (inner) return inner;
    }
  }
  return null;
}

function getExportedObject(source, constName) {
  return getAnyConstObject(source, constName);
}

function readSource(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function collectLeafStrings(objLit, prefix, out) {
  if (!objLit?.properties) return;
  for (const prop of objLit.properties) {
    if (ts.isSpreadAssignment(prop)) continue;
    if (!ts.isPropertyAssignment(prop)) continue;
    let key = null;
    if (ts.isIdentifier(prop.name)) key = prop.name.text;
    if (ts.isStringLiteral(prop.name)) key = prop.name.text;
    if (!key) continue;
    const p = prefix ? `${prefix}.${key}` : key;
    const init = prop.initializer;
    if (ts.isStringLiteralLike(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
      out[p] = init.text;
    } else {
      const inner = unwrapObjectLiteral(init);
      if (inner) collectLeafStrings(inner, p, out);
    }
  }
}

function findProperty(obj, name) {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (ts.isIdentifier(prop.name) && prop.name.text === name) return prop.initializer;
    if (ts.isStringLiteral(prop.name) && prop.name.text === name) return prop.initializer;
  }
  return null;
}

function resolveObjectValue(expr, source) {
  const lit = unwrapObjectLiteral(expr);
  if (lit) return lit;
  if (expr && ts.isIdentifier(expr)) return getAnyConstObject(source, expr.text);
  return null;
}

function checkPublicBookingLeaks(issues) {
  const enPath = path.join(I18N_DIR, "locale-parts", "en", "a.ts");
  const enSource = readSource(enPath);
  const enPart = getExportedObject(enSource, "enPartA");
  if (!enPart) throw new Error("enPartA not found");
  const enPbExpr = findProperty(enPart, "publicBooking");
  const enPb = unwrapObjectLiteral(enPbExpr);
  if (!enPb) throw new Error("en publicBooking missing");
  const ref = {};
  collectLeafStrings(enPb, "", ref);

  for (const locale of LOCALES) {
    const locPath = path.join(I18N_DIR, "locale-parts", locale, "a.ts");
    if (!fs.existsSync(locPath)) continue;
    const locSource = readSource(locPath);
    const partName = `${locale}PartA`;
    const locPart = getExportedObject(locSource, partName);
    if (!locPart) continue;
    const locPbExpr = findProperty(locPart, "publicBooking");
    const locPb = unwrapObjectLiteral(locPbExpr);
    if (!locPb) continue;
    const locMap = {};
    collectLeafStrings(locPb, "", locMap);
    for (const k of Object.keys(ref)) {
      if (k === "emailPlaceholder" || k === "phonePlaceholder") continue;
      const a = ref[k];
      const b = locMap[k];
      if (b === undefined) continue;
      if (a === b && a.length >= MIN_LEN && !ALLOW_VALUES.has(a)) {
        issues.push(`englishLeak publicBooking(${locale}).${k}: identical to en (len ${a.length})`);
      }
    }
  }
}

function checkLoginUiLeaks(issues) {
  const filePath = path.join(I18N_DIR, "login-ui.ts");
  const source = readSource(filePath);
  const mapObj = getAnyConstObject(source, "loginUiByLocale");
  if (!mapObj) throw new Error("loginUiByLocale not found");
  const enBlock =
    resolveObjectValue(findProperty(mapObj, "en"), source) || getAnyConstObject(source, "en");
  if (!enBlock) throw new Error("login-ui en reference not found");
  const ref = {};
  collectLeafStrings(enBlock, "", ref);
  for (const locale of LOCALES) {
    const block = resolveObjectValue(findProperty(mapObj, locale), source);
    if (!block) {
      issues.push(`loginUi(${locale}): missing block`);
      continue;
    }
    const locMap = {};
    collectLeafStrings(block, "", locMap);
    for (const k of Object.keys(ref)) {
      const a = ref[k];
      const b = locMap[k];
      if (a === b && a.length >= MIN_LEN && !ALLOW_VALUES.has(a)) {
        issues.push(`englishLeak loginUi(${locale}).${k}: identical to en`);
      }
    }
  }
}

function checkProfilePageLeaks(issues) {
  const enPath = path.join(PROFILE_DIR, "profile-en.ts");
  const enSource = readSource(enPath);
  const enObj = getExportedObject(enSource, "EN_PROFILE_PAGE_MESSAGES");
  if (!enObj) throw new Error("EN_PROFILE_PAGE_MESSAGES not found");
  const ref = {};
  collectLeafStrings(enObj, "", ref);

  const batches = [
    ["profile-locales-a.ts", "PROFILE_PAGE_LOCALES_A"],
    ["profile-locales-b.ts", "PROFILE_PAGE_LOCALES_B"],
    ["profile-locales-c.ts", "PROFILE_PAGE_LOCALES_C"],
    ["profile-locales-d.ts", "PROFILE_PAGE_LOCALES_D"],
    ["profile-locales-e.ts", "PROFILE_PAGE_LOCALES_E"],
  ];
  for (const locale of LOCALES) {
    let found = null;
    for (const [fname, cname] of batches) {
      const fp = path.join(PROFILE_DIR, fname);
      const src = readSource(fp);
      const batch = getExportedObject(src, cname);
      if (!batch) continue;
      const inner = unwrapObjectLiteral(findProperty(batch, locale));
      if (inner) {
        found = inner;
        break;
      }
    }
    if (!found) {
      issues.push(`englishLeak profilePage(${locale}): block not found`);
      continue;
    }
    const locMap = {};
    collectLeafStrings(found, "", locMap);
    for (const k of Object.keys(ref)) {
      const a = ref[k];
      const b = locMap[k];
      if (a === b && a.length >= MIN_LEN && !ALLOW_VALUES.has(a)) {
        issues.push(`englishLeak profilePage(${locale}).${k}: identical to en`);
      }
    }
  }
}

function checkContactPageLeaks(issues) {
  const part1Path = path.join(I18N_DIR, "contact-page-copy-part1.ts");
  const part2Path = path.join(I18N_DIR, "contact-page-copy-part2.ts");
  const part1Source = readSource(part1Path);
  const part2Source = readSource(part2Path);
  const part1Obj = getExportedObject(part1Source, "contactPageCopyPart1");
  const part2Obj = getExportedObject(part2Source, "contactPageCopyPart2");
  if (!part1Obj || !part2Obj) throw new Error("contact page copy parts not found");

  const enBlock = unwrapObjectLiteral(findProperty(part1Obj, "en"));
  if (!enBlock) throw new Error("contact page en block missing");
  const ref = {};
  collectLeafStrings(enBlock, "", ref);

  const part1Locales = new Set(["nb", "ar", "so", "ti", "am", "tr"]);
  const part2Locales = new Set(["pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi"]);
  const skipKeys = new Set(["emailPlaceholder", "officeLocation"]);

  for (const locale of LOCALES) {
    const container = part1Locales.has(locale)
      ? part1Obj
      : part2Locales.has(locale)
        ? part2Obj
        : null;
    if (!container) {
      issues.push(`englishLeak contactPage(${locale}): locale not in part1/part2`);
      continue;
    }
    const block = unwrapObjectLiteral(findProperty(container, locale));
    if (!block) {
      issues.push(`englishLeak contactPage(${locale}): block missing`);
      continue;
    }
    const locMap = {};
    collectLeafStrings(block, "", locMap);
    for (const k of Object.keys(ref)) {
      if (skipKeys.has(k)) continue;
      const a = ref[k];
      const b = locMap[k];
      if (b === undefined) continue;
      if (a === b && a.length >= MIN_LEN && !ALLOW_VALUES.has(a)) {
        issues.push(`englishLeak contactPage(${locale}).${k}: identical to en`);
      }
    }
  }
}

function checkTeamDialogLeaks(issues) {
  const fp = path.join(PROFILE_DIR, "team-dialog-messages.ts");
  const source = readSource(fp);
  const mapObj = getExportedObject(source, "PROFILE_TEAM_DIALOG_MESSAGES");
  if (!mapObj) throw new Error("PROFILE_TEAM_DIALOG_MESSAGES not found");
  const enBlock = unwrapObjectLiteral(findProperty(mapObj, "en"));
  const ref = {};
  collectLeafStrings(enBlock, "", ref);
  for (const locale of LOCALES) {
    const block = unwrapObjectLiteral(findProperty(mapObj, locale));
    if (!block) {
      issues.push(`profileTeamDialog(${locale}): missing`);
      continue;
    }
    const locMap = {};
    collectLeafStrings(block, "", locMap);
    for (const k of Object.keys(ref)) {
      const a = ref[k];
      const b = locMap[k];
      if (a === b && a.length >= MIN_LEN && !ALLOW_VALUES.has(a)) {
        issues.push(`englishLeak profileTeamDialog(${locale}).${k}: identical to en`);
      }
    }
  }
}

function main() {
  const issues = [];
  checkPublicBookingLeaks(issues);
  checkLoginUiLeaks(issues);
  checkProfilePageLeaks(issues);
  checkContactPageLeaks(issues);
  checkTeamDialogLeaks(issues);

  if (issues.length) {
    console.error(`i18n english-leak check failed (${issues.length} issue(s)):`);
    for (const i of issues.slice(0, 80)) console.error(`- ${i}`);
    if (issues.length > 80) console.error(`- ... and ${issues.length - 80} more`);
    process.exit(1);
  }
  console.log("i18n english-leak check passed.");
}

main();
