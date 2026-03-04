import { FONT_ALLOWLIST, type AllowedFont, type BrandingPlan } from "./defaults";
import type { ThemeOverrides } from "./themeOverridesSchema";

const MAX_LOGO_URL_LENGTH = 2048;

type RGB = { r: number; g: number; b: number };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toHexChannel(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

function rgbToHex(rgb: RGB): string {
  return `#${toHexChannel(rgb.r)}${toHexChannel(rgb.g)}${toHexChannel(rgb.b)}`;
}

function parseHex(input: string): string | null {
  const full = /^#([a-fA-F0-9]{6})$/;
  const short = /^#([a-fA-F0-9]{3})$/;
  if (full.test(input)) return input.toLowerCase();
  const shortMatch = input.match(short);
  if (!shortMatch) return null;
  const [r, g, b] = shortMatch[1].split("");
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

function parseRgb(input: string): string | null {
  const match = input.match(/^rgba?\((.+)\)$/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;
  const [r, g, b] = parts.slice(0, 3).map((part) => Number.parseFloat(part));
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;
  return rgbToHex({ r, g, b });
}

function hueToRgb(p: number, q: number, t: number): number {
  let adjusted = t;
  if (adjusted < 0) adjusted += 1;
  if (adjusted > 1) adjusted -= 1;
  if (adjusted < 1 / 6) return p + ((q - p) * 6 * adjusted);
  if (adjusted < 1 / 2) return q;
  if (adjusted < 2 / 3) return p + ((q - p) * (2 / 3 - adjusted) * 6);
  return p;
}

function parseHsl(input: string): string | null {
  const match = input.match(/^hsla?\((.+)\)$/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim().replace("%", ""));
  if (parts.length < 3) return null;
  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1]) / 100;
  const l = Number.parseFloat(parts[2]) / 100;
  if ([h, s, l].some((value) => Number.isNaN(value))) return null;
  const hue = ((h % 360) + 360) % 360 / 360;

  if (s === 0) {
    const grayscale = l * 255;
    return rgbToHex({ r: grayscale, g: grayscale, b: grayscale });
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - (l * s);
  const p = (2 * l) - q;
  const r = hueToRgb(p, q, hue + (1 / 3)) * 255;
  const g = hueToRgb(p, q, hue) * 255;
  const b = hueToRgb(p, q, hue - (1 / 3)) * 255;
  return rgbToHex({ r, g, b });
}

export function sanitizeColor(input: string | null | undefined): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (trimmed.toLowerCase() === "transparent") return undefined;
  if (trimmed.startsWith("var(")) return undefined;
  return parseHex(trimmed) ?? parseRgb(trimmed) ?? parseHsl(trimmed) ?? undefined;
}

export function sanitizeFont(input: string | null | undefined): AllowedFont | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  const match = FONT_ALLOWLIST.find((font) => font === trimmed);
  return match;
}

export function sanitizeLogoUrl(input: string | null | undefined): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_LOGO_URL_LENGTH) return undefined;
  if (/^data:/i.test(trimmed)) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function sanitizeOverridesForRender(
  plan: BrandingPlan,
  overrides: ThemeOverrides | null | undefined
): ThemeOverrides {
  if (!overrides || plan === "starter") return {};
  return {
    logoUrl: sanitizeLogoUrl(overrides.logoUrl),
    colors: {
      primary: sanitizeColor(overrides.colors?.primary),
      secondary: sanitizeColor(overrides.colors?.secondary),
    },
    typography: {
      fontFamily: sanitizeFont(overrides.typography?.fontFamily),
    },
    components: {
      headerVariant: overrides.components?.headerVariant,
    },
    radiusScale: overrides.radiusScale,
    shadowScale: overrides.shadowScale,
    motionPreset: overrides.motionPreset,
  };
}
