import fs from "fs";
import path from "path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const I18N_DIR = path.join(ROOT, "src", "i18n");
const PROFILE_I18N_DIR = path.join(ROOT, "src", "app", "salon", "[slug]", "profile-i18n");
const PROFILE_PAGE_BATCHES = [
  ["profile-locales-a.ts", "PROFILE_PAGE_LOCALES_A"],
  ["profile-locales-b.ts", "PROFILE_PAGE_LOCALES_B"],
  ["profile-locales-c.ts", "PROFILE_PAGE_LOCALES_C"],
  ["profile-locales-d.ts", "PROFILE_PAGE_LOCALES_D"],
  ["profile-locales-e.ts", "PROFILE_PAGE_LOCALES_E"],
];
const LOGIN_UI = path.join(I18N_DIR, "login-ui.ts");

const APP_LOCALES = ["nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi"];
const PLACEHOLDER_RE = /\{([a-zA-Z0-9_]+)\}/g;

function readSource(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function unwrapObjectLiteral(expr) {
  if (!expr) return null;
  if (ts.isObjectLiteralExpression(expr)) return expr;
  if (ts.isSatisfiesExpression(expr)) return unwrapObjectLiteral(expr.expression);
  return null;
}

function getConstObjectLiteral(source, constName) {
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

function findObjectProperty(obj, propName) {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (ts.isIdentifier(prop.name) && prop.name.text === propName) return prop.initializer;
    if (ts.isStringLiteral(prop.name) && prop.name.text === propName) return prop.initializer;
  }
  return null;
}

function collectObjectShape(objLiteral, sourceFile) {
  const keys = new Set();
  const placeholdersByKey = new Map();
  let hasSpread = false;

  for (const prop of objLiteral.properties) {
    if (ts.isSpreadAssignment(prop)) {
      hasSpread = true;
      continue;
    }
    if (!ts.isPropertyAssignment(prop)) continue;

    let key = null;
    if (ts.isIdentifier(prop.name)) key = prop.name.text;
    if (ts.isStringLiteral(prop.name)) key = prop.name.text;
    if (!key) continue;

    keys.add(key);
    if (ts.isStringLiteralLike(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
      const text = prop.initializer.text;
      const placeholders = new Set();
      for (const m of text.matchAll(PLACEHOLDER_RE)) placeholders.add(m[1]);
      placeholdersByKey.set(key, placeholders);
    }
  }

  return { keys, placeholdersByKey, hasSpread, file: sourceFile.fileName };
}

function setDiff(a, b) {
  const out = [];
  for (const v of a) if (!b.has(v)) out.push(v);
  return out.sort();
}

function compareShape(namespaceName, locale, refShape, localeShape, issues) {
  const missing = setDiff(refShape.keys, localeShape.keys);
  const extra = setDiff(localeShape.keys, refShape.keys);
  if (missing.length) issues.push(`${namespaceName}(${locale}): missing keys -> ${missing.join(", ")}`);
  if (extra.length) issues.push(`${namespaceName}(${locale}): extra keys -> ${extra.join(", ")}`);
  for (const key of refShape.keys) {
    if (!localeShape.keys.has(key)) continue;
    const refPlaceholders = refShape.placeholdersByKey.get(key) || new Set();
    const locPlaceholders = localeShape.placeholdersByKey.get(key) || new Set();
    const missingPh = setDiff(refPlaceholders, locPlaceholders);
    const extraPh = setDiff(locPlaceholders, refPlaceholders);
    if (missingPh.length || extraPh.length) {
      issues.push(
        `${namespaceName}(${locale}).${key}: placeholder mismatch missing=[${missingPh.join(", ")}] extra=[${extraPh.join(", ")}]`,
      );
    }
  }
}

function getPublicBookingPartSource(locale) {
  const partA = path.join(I18N_DIR, "locale-parts", locale, "a.ts");
  if (!fs.existsSync(partA)) return null;
  const source = readSource(partA);
  const partName = `${locale}PartA`;
  const partObj = getConstObjectLiteral(source, partName);
  if (!partObj) return null;
  const pb = findObjectProperty(partObj, "publicBooking");
  if (!pb || !ts.isObjectLiteralExpression(pb)) return null;
  return { source, expr: pb };
}

function checkPublicBooking(issues) {
  const enPb = getPublicBookingPartSource("en");
  if (!enPb) throw new Error("Could not locate en publicBooking in locale-parts/en/a.ts");
  const refShape = collectObjectShape(enPb.expr, enPb.source);

  for (const locale of APP_LOCALES) {
    if (locale === "en") continue;
    const found = getPublicBookingPartSource(locale);
    if (!found) {
      issues.push(`publicBooking(${locale}): locale part a not found`);
      continue;
    }
    const localeShape = collectObjectShape(found.expr, found.source);
    compareShape("publicBooking", locale, refShape, localeShape, issues);
  }
}

function findProfilePageLocaleExpr(locale) {
  for (const [fileName, constName] of PROFILE_PAGE_BATCHES) {
    const source = readSource(path.join(PROFILE_I18N_DIR, fileName));
    const batchObj = getConstObjectLiteral(source, constName);
    if (!batchObj) {
      throw new Error(`Could not locate ${constName} in ${fileName}.`);
    }
    const expr = findObjectProperty(batchObj, locale);
    if (expr && ts.isObjectLiteralExpression(expr)) return { expr, source };
  }
  return null;
}

function checkProfileI18n(issues) {
  const enPageSource = readSource(path.join(PROFILE_I18N_DIR, "profile-en.ts"));
  const pageRefObj = getConstObjectLiteral(enPageSource, "EN_PROFILE_PAGE_MESSAGES");
  if (!pageRefObj) throw new Error("Could not locate EN_PROFILE_PAGE_MESSAGES.");
  const refPageShape = collectObjectShape(pageRefObj, enPageSource);

  for (const locale of APP_LOCALES) {
    if (locale === "en") continue;
    const found = findProfilePageLocaleExpr(locale);
    if (!found) {
      issues.push(`profilePage(${locale}): object not found in locale batches`);
      continue;
    }
    const localeShape = collectObjectShape(found.expr, found.source);
    if (localeShape.hasSpread) {
      issues.push(`profilePage(${locale}): spread usage is not allowed (no ...EN fallback).`);
    }
    compareShape("profilePage", locale, refPageShape, localeShape, issues);
  }

  const teamSource = readSource(path.join(PROFILE_I18N_DIR, "team-dialog-messages.ts"));
  const teamDialogByLocale = getConstObjectLiteral(teamSource, "PROFILE_TEAM_DIALOG_MESSAGES");
  if (!teamDialogByLocale) throw new Error("Could not locate PROFILE_TEAM_DIALOG_MESSAGES.");
  const enTeamExpr = findObjectProperty(teamDialogByLocale, "en");
  if (!enTeamExpr || !ts.isObjectLiteralExpression(enTeamExpr)) {
    throw new Error("Could not locate PROFILE_TEAM_DIALOG_MESSAGES.en.");
  }
  const refTeamShape = collectObjectShape(enTeamExpr, teamSource);
  for (const locale of APP_LOCALES) {
    const expr = findObjectProperty(teamDialogByLocale, locale);
    if (!expr || !ts.isObjectLiteralExpression(expr)) {
      issues.push(`profileTeamDialog(${locale}): object not found`);
      continue;
    }
    const localeShape = collectObjectShape(expr, teamSource);
    compareShape("profileTeamDialog", locale, refTeamShape, localeShape, issues);
  }
}

function checkLoginUiLocales(issues) {
  const source = readSource(LOGIN_UI);
  const mapObj = (function getLoginMap() {
    for (const stmt of source.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const decl of stmt.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || decl.name.text !== "loginUiByLocale") continue;
        let init = decl.initializer;
        while (init && ts.isSatisfiesExpression(init)) init = init.expression;
        if (init && ts.isObjectLiteralExpression(init)) return init;
      }
    }
    return null;
  })();
  if (!mapObj) {
    issues.push("loginUiByLocale: object literal not found in login-ui.ts");
    return;
  }
  const keys = new Set();
  for (const prop of mapObj.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      keys.add(prop.name.text);
    } else if (ts.isShorthandPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      keys.add(prop.name.text);
    }
  }
  for (const locale of APP_LOCALES) {
    if (!keys.has(locale)) {
      issues.push(`loginUiByLocale: missing locale key "${locale}"`);
    }
  }
}

function main() {
  const issues = [];
  checkPublicBooking(issues);
  checkProfileI18n(issues);
  checkLoginUiLocales(issues);

  if (issues.length) {
    console.error("i18n parity check failed:");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log("i18n parity check passed.");
}

main();
