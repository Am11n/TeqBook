import {
  type BackgroundMode,
  type ButtonStyle,
  type HeaderStyle,
  PRO_NEUTRAL_DEFAULT,
  type SlotStyle,
  type SurfaceStyle,
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
  context?: "public_booking" | "public_profile";
  plan: BrandingPlan | string | null | undefined;
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
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle: number;
  headerVariant: HeaderVariant;
  surfaceStyle: SurfaceStyle;
  buttonStyle: ButtonStyle;
  slotStyle: SlotStyle;
  headerStyle: HeaderStyle;
  radiusScale: RadiusScale;
  shadowScale: ShadowScale;
  motionPreset: MotionPreset;
  themePackId?: string;
  themePackVersion?: number;
  themePackHash?: string;
};

const PLATFORM_PROFILE_BACKGROUND = "#f6f3ee";
const PLATFORM_PROFILE_CARD = "#fffcf8";
const PLATFORM_PROFILE_PRIMARY = "#2457f5";

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

function resolvePlan(plan: BrandingPlan | string | null | undefined): BrandingPlan {
  if (typeof plan !== "string") return "starter";
  const normalized = plan.trim().toLowerCase();
  if (normalized === "business" || normalized.startsWith("business")) return "business";
  if (normalized === "pro" || normalized.startsWith("pro")) return "pro";
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
    backgroundMode: "default",
    backgroundColor: "#f5f6f8",
    gradientStart: undefined,
    gradientEnd: undefined,
    gradientAngle: 180,
    headerVariant: pack.tokens.headerVariant,
    surfaceStyle: "soft",
    buttonStyle: "soft",
    slotStyle: "minimal",
    headerStyle: pack.tokens.headerVariant === "compact" ? "compact" : "standard",
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
    backgroundMode: "default",
    backgroundColor: "#f5f6f8",
    gradientStart: undefined,
    gradientEnd: undefined,
    gradientAngle: 180,
    headerVariant: PRO_NEUTRAL_DEFAULT.headerVariant,
    surfaceStyle: "soft",
    buttonStyle: "soft",
    slotStyle: "minimal",
    headerStyle: "standard",
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
  const context = input.context ?? "public_booking";
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
      backgroundMode: "default",
      backgroundColor: "#f5f6f8",
      gradientStart: undefined,
      gradientEnd: undefined,
      gradientAngle: 180,
      headerVariant: TEQBOOK_DEFAULT.headerVariant,
      surfaceStyle: "soft",
      buttonStyle: "soft",
      slotStyle: "minimal",
      headerStyle: "standard",
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
      backgroundMode: "default",
      backgroundColor: "#f5f6f8",
      gradientStart: undefined,
      gradientEnd: undefined,
      gradientAngle: 180,
      headerVariant: input.theme_pack_snapshot.tokens.headerVariant,
      surfaceStyle: "soft",
      buttonStyle: "soft",
      slotStyle: "minimal",
      headerStyle: input.theme_pack_snapshot.tokens.headerVariant === "compact" ? "compact" : "standard",
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
  const safeOverrides = validatedOverrides.ok
    ? sanitizeOverridesForRender(plan, validatedOverrides.value)
    : sanitizeOverridesForRender(plan, input.theme_overrides as ThemeOverrides | null | undefined);
  const legacyFallback = mapLegacyToBase(input.theme ?? null);

  const merged: EffectiveBranding = {
    ...base,
    plan,
    primaryColor:
      sanitizeColor(safeOverrides.colors?.primary)
      ?? sanitizeColor(base.primaryColor)
      ?? sanitizeColor(legacyFallback.primaryColor)
      ?? PRO_NEUTRAL_DEFAULT.primaryColor,
    secondaryColor:
      sanitizeColor(safeOverrides.colors?.secondary)
      ?? sanitizeColor(base.secondaryColor)
      ?? sanitizeColor(legacyFallback.secondaryColor)
      ?? PRO_NEUTRAL_DEFAULT.secondaryColor,
    fontFamily: sanitizeFont(safeOverrides.typography?.fontFamily)
      ?? sanitizeFont(String(base.fontFamily))
      ?? sanitizeFont(String(legacyFallback.fontFamily))
      ?? PRO_NEUTRAL_DEFAULT.fontFamily,
    pageBackground:
      sanitizeColor(safeOverrides.appearance?.pageBackground)
      ?? sanitizeColor(base.pageBackground)
      ?? "#f5f6f8",
    // Public booking cards stay white across plans to preserve contrast/readability.
    cardBackground: "#ffffff",
    pageBackgroundMode: safeOverrides.appearance?.pageBackgroundMode ?? base.pageBackgroundMode ?? "solid",
    backgroundMode: safeOverrides.appearance?.backgroundMode ?? base.backgroundMode ?? "default",
    backgroundColor:
      sanitizeColor(safeOverrides.appearance?.backgroundColor)
      ?? sanitizeColor(base.backgroundColor)
      ?? "#f5f6f8",
    gradientStart:
      sanitizeColor(safeOverrides.appearance?.gradientStart)
      ?? sanitizeColor(base.gradientStart)
      ?? undefined,
    gradientEnd:
      sanitizeColor(safeOverrides.appearance?.gradientEnd)
      ?? sanitizeColor(base.gradientEnd)
      ?? undefined,
    gradientAngle: safeOverrides.appearance?.gradientAngle ?? base.gradientAngle ?? 180,
    logoUrl:
      sanitizeLogoUrl(safeOverrides.logoUrl)
      ?? sanitizeLogoUrl(base.logoUrl)
      ?? sanitizeLogoUrl(legacyFallback.logoUrl),
    headerVariant: safeOverrides.components?.headerVariant ?? base.headerVariant,
    surfaceStyle: safeOverrides.components?.surfaceStyle ?? base.surfaceStyle ?? "soft",
    buttonStyle: safeOverrides.components?.buttonStyle ?? base.buttonStyle ?? "soft",
    slotStyle: safeOverrides.components?.slotStyle ?? base.slotStyle ?? "minimal",
    headerStyle: safeOverrides.components?.headerStyle ?? base.headerStyle ?? "standard",
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
  if (context === "public_profile") {
    merged.pageBackground = PLATFORM_PROFILE_BACKGROUND;
    merged.pageBackgroundMode = "solid";
    merged.backgroundMode = "default";
    merged.backgroundColor = PLATFORM_PROFILE_BACKGROUND;
    merged.gradientStart = undefined;
    merged.gradientEnd = undefined;
    merged.gradientAngle = 180;
    // Profile surface language is platform-owned to keep consistency.
    merged.primaryColor = PLATFORM_PROFILE_PRIMARY;
    merged.cardBackground = PLATFORM_PROFILE_CARD;
    merged.surfaceStyle = "soft";
    merged.buttonStyle = "soft";
    merged.slotStyle = "minimal";
    merged.headerStyle = "standard";
  }

  return deepFreeze(structuredClone(merged));
}
