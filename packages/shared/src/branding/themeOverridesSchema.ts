import { z } from "zod";
import type { BrandingPlan, HeaderVariant, MotionPreset, RadiusScale, ShadowScale } from "./defaults";

const ColorsSchema = z.object({
  primary: z.string().optional(),
  secondary: z.string().optional(),
}).partial();

const TypographySchema = z.object({
  fontFamily: z.string().optional(),
}).partial();

const ComponentsSchema = z.object({
  headerVariant: z.enum(["standard", "compact"]).optional(),
  surfaceStyle: z.enum(["soft", "elevated", "flat"]).optional(),
  buttonStyle: z.enum(["rounded", "soft", "sharp"]).optional(),
  slotStyle: z.enum(["minimal", "pill", "card"]).optional(),
  headerStyle: z.enum(["compact", "standard", "branded"]).optional(),
}).partial();

const AppearanceSchema = z.object({
  pageBackground: z.string().optional(),
  cardBackground: z.string().optional(),
  pageBackgroundMode: z.enum(["solid", "gradient"]).optional(),
  backgroundMode: z.enum(["default", "solid", "soft_gradient"]).optional(),
  backgroundColor: z.string().optional(),
  gradientStart: z.string().optional(),
  gradientEnd: z.string().optional(),
  gradientAngle: z.number().int().min(0).max(360).optional(),
}).partial();

export const ThemeOverridesSchema = z.object({
  logoUrl: z.string().optional(),
  colors: ColorsSchema.optional(),
  typography: TypographySchema.optional(),
  components: ComponentsSchema.optional(),
  appearance: AppearanceSchema.optional(),
  radiusScale: z.enum(["standard", "rounded"]).optional(),
  shadowScale: z.enum(["soft", "medium"]).optional(),
  motionPreset: z.enum(["standard", "calm"]).optional(),
}).strict();

export type ThemeOverrides = z.infer<typeof ThemeOverridesSchema>;

const PRO_ALLOWED_PATHS = new Set<string>([
  "logoUrl",
  "colors",
  "colors.primary",
  "typography",
  "typography.fontFamily",
  "appearance",
  "appearance.pageBackground",
  "appearance.cardBackground",
  "appearance.pageBackgroundMode",
  "appearance.backgroundMode",
  "appearance.backgroundColor",
  "appearance.gradientStart",
  "appearance.gradientEnd",
  "appearance.gradientAngle",
  "components",
  "components.surfaceStyle",
  "components.buttonStyle",
  "components.slotStyle",
  "components.headerStyle",
]);

const BUSINESS_ONLY_PATHS = new Set<string>([
  "colors.secondary",
  "components.headerVariant",
  "radiusScale",
  "shadowScale",
  "motionPreset",
]);

type ValidationResult = {
  ok: boolean;
  value?: ThemeOverrides;
  issues?: string[];
};

function pathExists(overrides: ThemeOverrides, path: string): boolean {
  const parts = path.split(".");
  let node: unknown = overrides;
  for (const part of parts) {
    if (!node || typeof node !== "object" || !(part in node)) return false;
    node = (node as Record<string, unknown>)[part];
  }
  return node !== undefined;
}

export function validateThemeOverrides(
  plan: BrandingPlan,
  candidate: unknown
): ValidationResult {
  if (plan === "starter") {
    return { ok: true, value: {} };
  }

  if (!candidate) return { ok: true, value: {} };

  const parsed = ThemeOverridesSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const overrides = parsed.data;
  if (plan === "business") return { ok: true, value: overrides };

  const issues: string[] = [];
  for (const path of BUSINESS_ONLY_PATHS) {
    if (pathExists(overrides, path)) {
      issues.push(`Override "${path}" requires Business plan.`);
    }
  }

  for (const key of Object.keys(overrides)) {
    if (!PRO_ALLOWED_PATHS.has(key)) {
      if (key === "colors" && overrides.colors?.primary !== undefined) continue;
      if (key === "typography" && overrides.typography?.fontFamily !== undefined) continue;
      if (key === "logoUrl") continue;
      if (!BUSINESS_ONLY_PATHS.has(key)) {
        issues.push(`Override "${key}" is not allowed on Pro.`);
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: overrides };
}

export type BrandingOverrideDimensions = {
  headerVariant: HeaderVariant;
  radiusScale: RadiusScale;
  shadowScale: ShadowScale;
  motionPreset: MotionPreset;
};
