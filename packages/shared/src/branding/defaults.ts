export type BrandingPlan = "starter" | "pro" | "business";
export type HeaderVariant = "standard" | "compact";
export type RadiusScale = "standard" | "rounded";
export type ShadowScale = "soft" | "medium";
export type MotionPreset = "standard" | "calm";
export type BackgroundMode = "default" | "solid" | "soft_gradient";
export type SurfaceStyle = "soft" | "elevated" | "flat";
export type ButtonStyle = "rounded" | "soft" | "sharp";
export type SlotStyle = "minimal" | "pill" | "card";
export type HeaderStyle = "compact" | "standard" | "branded";

export type BrandingPackTokens = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  radiusScale: RadiusScale;
  shadowScale: ShadowScale;
  headerVariant: HeaderVariant;
  motionPreset: MotionPreset;
};

export const TEQBOOK_DEFAULT: Readonly<BrandingPackTokens> = Object.freeze({
  primaryColor: "#2563eb",
  secondaryColor: "#93c5fd",
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
  radiusScale: "standard",
  shadowScale: "soft",
  headerVariant: "standard",
  motionPreset: "standard",
});

export const PRO_NEUTRAL_DEFAULT: Readonly<BrandingPackTokens> = Object.freeze({
  primaryColor: "#2563eb",
  secondaryColor: "#dbeafe",
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
  radiusScale: "standard",
  shadowScale: "soft",
  headerVariant: "standard",
  motionPreset: "standard",
});

export const FONT_ALLOWLIST = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
] as const;

export type AllowedFont = (typeof FONT_ALLOWLIST)[number];

export const TEQBOOK_LOGO = "/Favikon.svg";
