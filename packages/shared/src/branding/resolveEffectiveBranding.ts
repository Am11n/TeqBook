import {
  PRO_NEUTRAL_DEFAULT,
  TEQBOOK_DEFAULT,
  type AllowedFont,
  type BrandingPackTokens,
  type BrandingPlan,
  type HeaderVariant,
  type MotionPreset,
  type RadiusScale,
  type ShadowScale,
} from "./defaults";
import { sanitizeColor, sanitizeFont, sanitizeLogoUrl, sanitizeOverridesForRender } from "./sanitize";
import { findThemePackById, type ThemePackDefinition } from "./themePacks";
import { validateThemeOverrides, type ThemeOverrides } from "./themeOverridesSchema";

export type LegacyTheme = {
  primary?: string;
  secondary?: string;
  font?: string;
  logo_url?: string;
  headerVariant?: HeaderVariant;
} | null;

export type ThemePackSnapshot = {
  id: string;
  version: number;
  hash: string;
  tokens: BrandingPackTokens;
} | null;

export type ResolveEffectiveBrandingInput = {
  plan: BrandingPlan | null | undefined;
  theme_pack_id?: string | null;
  theme_pack_version?: number | null;
  theme_pack_hash?: string | null;
  theme_pack_snapshot?: ThemePackSnapshot;
  theme_overrides?: ThemeOverrides | null;
  theme?: LegacyTheme;
};

export type EffectiveBrandingSource =
  | "teqbook-default"
  | "theme-pack-snapshot"
  | "theme-pack-library"
  | "legacy-theme"
  | "pro-neutral-default";

export type EffectiveBranding = {
  plan: BrandingPlan;
  source: EffectiveBrandingSource;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: AllowedFont | string;
  pageBackground: string;
  cardBackground: string;
  pageBackgroundMode: "solid" | "gradient";
  headerVariant: HeaderVariant;
  radiusScale: RadiusScale;
  shadowScale: ShadowScale;
  motionPreset: MotionPreset;
  themePackId?: string;
  themePackVersion?: number;
  themePackHash?: string;
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const item of Object.values(value as Record<string, unknown>)) {
      if (item && typeof item === "object" && !Object.isFrozen(item)) {
        deepFreeze(item);
      }
    }
  }
  return value;
}

function cloneTokens(tokens: BrandingPackTokens): BrandingPackTokens {
  return {
    primaryColor: tokens.primaryColor,
    secondaryColor: tokens.secondaryColor,
    fontFamily: tokens.fontFamily,
    radiusScale: tokens.radiusScale,
    shadowScale: tokens.shadowScale,
    headerVariant: tokens.headerVariant,
    motionPreset: tokens.motionPreset,
  };
}

function resolvePlan(plan: BrandingPlan | null | undefined): BrandingPlan {
  if (plan === "business" || plan === "pro") return plan;
  return "starter";
}

function mapLegacyToBase(theme: LegacyTheme): Partial<EffectiveBranding> {
  if (!theme) return {};
  return {
    primaryColor: sanitizeColor(theme.primary),
    secondaryColor: sanitizeColor(theme.secondary),
    fontFamily: sanitizeFont(theme.font),
    logoUrl: sanitizeLogoUrl(theme.logo_url),
    headerVariant: theme.headerVariant === "compact" ? "compact" : "standard",
  };
}

function createBaseFromPack(pack: ThemePackDefinition): EffectiveBranding {
  return {
    plan: "pro",
    source: "theme-pack-library",
    primaryColor: pack.tokens.primaryColor,
    secondaryColor: pack.tokens.secondaryColor,
    fontFamily: pack.tokens.fontFamily,
    pageBackground: "#f5f6f8",
    cardBackground: "#ffffff",
    pageBackgroundMode: "solid",
    headerVariant: pack.tokens.headerVariant,
    radiusScale: pack.tokens.radiusScale,
    shadowScale: pack.tokens.shadowScale,
    motionPreset: pack.tokens.motionPreset,
    themePackId: pack.id,
    themePackVersion: pack.version,
  };
}

function fallbackBranding(plan: BrandingPlan): EffectiveBranding {
  return {
    plan,
    source: "pro-neutral-default",
    primaryColor: PRO_NEUTRAL_DEFAULT.primaryColor,
    secondaryColor: PRO_NEUTRAL_DEFAULT.secondaryColor,
    fontFamily: PRO_NEUTRAL_DEFAULT.fontFamily,
    pageBackground: "#f5f6f8",
    cardBackground: "#ffffff",
    pageBackgroundMode: "solid",
    headerVariant: PRO_NEUTRAL_DEFAULT.headerVariant,
    radiusScale: PRO_NEUTRAL_DEFAULT.radiusScale,
    shadowScale: PRO_NEUTRAL_DEFAULT.shadowScale,
    motionPreset: PRO_NEUTRAL_DEFAULT.motionPreset,
  };
}

export function createThemePackHash(tokens: BrandingPackTokens): string {
  const serialized = JSON.stringify(tokens);
  let hash = 2166136261;
  for (let i = 0; i < serialized.length; i += 1) {
    hash ^= serialized.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `tb-${(hash >>> 0).toString(16)}`;
}

export function createThemePackSnapshot(pack: ThemePackDefinition): ThemePackSnapshot {
  const tokens = cloneTokens(pack.tokens);
  return {
    id: pack.id,
    version: pack.version,
    hash: createThemePackHash(tokens),
    tokens,
  };
}

export function resolveEffectiveBranding(input: ResolveEffectiveBrandingInput): Readonly<EffectiveBranding> {
  const plan = resolvePlan(input.plan);

  if (plan === "starter") {
    return deepFreeze({
      plan,
      source: "teqbook-default",
      primaryColor: TEQBOOK_DEFAULT.primaryColor,
      secondaryColor: TEQBOOK_DEFAULT.secondaryColor,
      fontFamily: TEQBOOK_DEFAULT.fontFamily,
      pageBackground: "#f5f6f8",
      cardBackground: "#ffffff",
      pageBackgroundMode: "solid",
      headerVariant: TEQBOOK_DEFAULT.headerVariant,
      radiusScale: TEQBOOK_DEFAULT.radiusScale,
      shadowScale: TEQBOOK_DEFAULT.shadowScale,
      motionPreset: TEQBOOK_DEFAULT.motionPreset,
    });
  }

  let base: EffectiveBranding;
  if (input.theme_pack_snapshot?.tokens) {
    base = {
      plan,
      source: "theme-pack-snapshot",
      primaryColor: input.theme_pack_snapshot.tokens.primaryColor,
      secondaryColor: input.theme_pack_snapshot.tokens.secondaryColor,
      fontFamily: input.theme_pack_snapshot.tokens.fontFamily,
      pageBackground: "#f5f6f8",
      cardBackground: "#ffffff",
      pageBackgroundMode: "solid",
      headerVariant: input.theme_pack_snapshot.tokens.headerVariant,
      radiusScale: input.theme_pack_snapshot.tokens.radiusScale,
      shadowScale: input.theme_pack_snapshot.tokens.shadowScale,
      motionPreset: input.theme_pack_snapshot.tokens.motionPreset,
      themePackId: input.theme_pack_snapshot.id,
      themePackVersion: input.theme_pack_snapshot.version,
      themePackHash: input.theme_pack_snapshot.hash,
    };
  } else {
    const pack = findThemePackById(input.theme_pack_id);
    if (pack) {
      base = {
        ...createBaseFromPack(pack),
        plan,
      };
    } else if (input.theme) {
      const legacy = mapLegacyToBase(input.theme);
      base = {
        ...fallbackBranding(plan),
        ...legacy,
        source: "legacy-theme",
      };
    } else {
      base = fallbackBranding(plan);
    }
  }

  const validatedOverrides = validateThemeOverrides(plan, input.theme_overrides);
  const safeOverrides = validatedOverrides.ok ? sanitizeOverridesForRender(plan, validatedOverrides.value) : {};

  const merged: EffectiveBranding = {
    ...base,
    plan,
    primaryColor: sanitizeColor(safeOverrides.colors?.primary) ?? sanitizeColor(base.primaryColor) ?? PRO_NEUTRAL_DEFAULT.primaryColor,
    secondaryColor: sanitizeColor(safeOverrides.colors?.secondary) ?? sanitizeColor(base.secondaryColor) ?? PRO_NEUTRAL_DEFAULT.secondaryColor,
    fontFamily: sanitizeFont(safeOverrides.typography?.fontFamily)
      ?? sanitizeFont(String(base.fontFamily))
      ?? PRO_NEUTRAL_DEFAULT.fontFamily,
    pageBackground:
      sanitizeColor(safeOverrides.appearance?.pageBackground)
      ?? sanitizeColor(base.pageBackground)
      ?? "#f5f6f8",
    cardBackground:
      sanitizeColor(safeOverrides.appearance?.cardBackground)
      ?? sanitizeColor(base.cardBackground)
      ?? "#ffffff",
    pageBackgroundMode: safeOverrides.appearance?.pageBackgroundMode ?? base.pageBackgroundMode ?? "solid",
    logoUrl: sanitizeLogoUrl(safeOverrides.logoUrl) ?? sanitizeLogoUrl(base.logoUrl),
    headerVariant: safeOverrides.components?.headerVariant ?? base.headerVariant,
    radiusScale: safeOverrides.radiusScale ?? base.radiusScale,
    shadowScale: safeOverrides.shadowScale ?? base.shadowScale,
    motionPreset: safeOverrides.motionPreset ?? base.motionPreset,
    themePackId: input.theme_pack_snapshot?.id ?? base.themePackId ?? input.theme_pack_id ?? undefined,
    themePackVersion:
      input.theme_pack_snapshot?.version
      ?? base.themePackVersion
      ?? input.theme_pack_version
      ?? undefined,
    themePackHash:
      input.theme_pack_snapshot?.hash
      ?? base.themePackHash
      ?? input.theme_pack_hash
      ?? undefined,
  };

  return deepFreeze(structuredClone(merged));
}
