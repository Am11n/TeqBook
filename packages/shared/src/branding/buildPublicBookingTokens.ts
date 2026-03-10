import type { EffectiveBranding } from "./resolveEffectiveBranding";

const PRIMARY_TEXT_LIGHT = "#ffffff";
const PRIMARY_TEXT_DARK = "#101828";

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [lr, lg, lb] = [channelToLinear(r), channelToLinear(g), channelToLinear(b)];
  return (0.2126 * lr) + (0.7152 * lg) + (0.0722 * lb);
}

function contrastRatio(a: string, b: string): number {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

function pickPrimaryTextColor(primaryHex: string): string {
  const lightContrast = contrastRatio(primaryHex, PRIMARY_TEXT_LIGHT);
  const darkContrast = contrastRatio(primaryHex, PRIMARY_TEXT_DARK);
  return lightContrast >= darkContrast ? PRIMARY_TEXT_LIGHT : PRIMARY_TEXT_DARK;
}

function mix(hex: string, baseHex: string, weight: number): string {
  const rgb = hexToRgb(hex);
  const base = hexToRgb(baseHex);
  const ratio = Math.max(0, Math.min(1, weight));
  const mixChannel = (a: number, b: number) => Math.round((a * (1 - ratio)) + (b * ratio));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(mixChannel(rgb.r, base.r))}${toHex(mixChannel(rgb.g, base.g))}${toHex(mixChannel(rgb.b, base.b))}`;
}

function darken(hex: string, amount = 0.12): string {
  return mix(hex, "#000000", amount);
}

export type PublicBookingTokens = {
  colors: {
    primary: string;
    primaryHover: string;
    primaryText: string;
    pageBackground: string;
    pageBackgroundBase: string;
    cardBackground: string;
    text: string;
    surface: string;
    surface2: string;
    border: string;
    mutedText: string;
    successBg: string;
    successText: string;
    errorBg: string;
    errorText: string;
    warningBg: string;
    warningText: string;
  };
  typography: {
    fontFamily: string;
    fontSizeScale: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      semibold: number;
    };
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadow: {
    level1: string;
    level2: string;
    card: string;
    focus: string;
  };
  button: {
    radius: string;
    shadow: string;
    hoverLift: string;
  };
  slot: {
    radius: string;
    baseShadow: string;
    selectedShadow: string;
    selectedBg: string;
    selectedText: string;
    selectedBorder: string;
  };
  header: {
    logoSize: string;
    verticalPadding: string;
    accentOpacity: number;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  focusRing: {
    color: string;
    width: string;
  };
  motion: {
    durationFast: string;
    durationStandard: string;
    easeOut: string;
    easeInOut: string;
    ctaReadyPulse: string;
  };
};

export function buildPublicBookingTokens(branding: EffectiveBranding): PublicBookingTokens {
  const primary = branding.primaryColor;
  const primaryText = pickPrimaryTextColor(primary);
  const primaryHover = darken(primary, 0.14);
  const focusColor = rgba(primary, 0.35);
  const pageBackgroundBase = branding.backgroundColor || branding.pageBackground || "#f5f6f8";
  // Keep all booking cards on white surface for consistent contrast.
  const cardBackground = "#ffffff";
  const gradientStart = branding.gradientStart || mix(primary, pageBackgroundBase, 0.84);
  const gradientEnd = branding.gradientEnd || pageBackgroundBase;
  const gradientModeEnabled =
    branding.backgroundMode === "soft_gradient" || branding.pageBackgroundMode === "gradient";
  const pageBackground = gradientModeEnabled
    ? `linear-gradient(${branding.gradientAngle}deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
    : pageBackgroundBase;

  const radiusBySurface = branding.surfaceStyle === "elevated"
    ? { sm: "0.75rem", md: "1rem", lg: "1.25rem" }
    : branding.surfaceStyle === "flat"
      ? { sm: "0.5rem", md: "0.625rem", lg: "0.75rem" }
      : { sm: "0.625rem", md: "0.75rem", lg: "1rem" };
  const radius =
    branding.radiusScale === "rounded"
      ? { sm: "0.75rem", md: "1rem", lg: "1.25rem" }
      : radiusBySurface;

  const shadow =
    branding.surfaceStyle === "flat"
      ? {
          level1: "none",
          level2: "none",
          card: "none",
        }
      : branding.shadowScale === "medium" || branding.surfaceStyle === "elevated"
      ? {
          level1: "0 10px 26px rgba(16,24,40,0.08)",
          level2: "0 20px 40px rgba(16,24,40,0.12)",
          card: "0 10px 26px rgba(16,24,40,0.08)",
        }
      : {
          level1: "0 8px 24px rgba(16,24,40,0.06)",
          level2: "0 16px 34px rgba(16,24,40,0.08)",
          card: "0 8px 24px rgba(16,24,40,0.06)",
        };

  const motion =
    branding.motionPreset === "calm"
      ? {
          durationFast: "180ms",
          durationStandard: "220ms",
          easeOut: "cubic-bezier(0, 0, 0.2, 1)",
          easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
          ctaReadyPulse: "pb-ready-pulse 2200ms ease-in-out infinite",
        }
      : {
          durationFast: "120ms",
          durationStandard: "170ms",
          easeOut: "cubic-bezier(0, 0, 0.2, 1)",
          easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
          ctaReadyPulse: "pb-ready-pulse 1400ms ease-in-out infinite",
        };

  const button =
    branding.buttonStyle === "rounded"
      ? { radius: "9999px", shadow: "var(--pb-shadow-1)", hoverLift: "translateY(-1px)" }
      : branding.buttonStyle === "sharp"
        ? { radius: "0.375rem", shadow: "none", hoverLift: "translateY(0)" }
        : { radius: "0.75rem", shadow: "0 6px 16px rgba(16,24,40,0.08)", hoverLift: "translateY(-1px)" };

  const slot =
    branding.slotStyle === "pill"
      ? {
          radius: "9999px",
          baseShadow: "none",
          selectedShadow: "0 0 0 2px color-mix(in srgb, var(--pb-primary) 70%, #ffffff 30%), var(--pb-shadow-1)",
          selectedBg: "var(--pb-primary)",
          selectedText: "var(--pb-primary-text)",
          selectedBorder: "var(--pb-primary)",
        }
      : branding.slotStyle === "card"
        ? {
            radius: "0.875rem",
            baseShadow: "var(--pb-shadow-1)",
            selectedShadow: "0 0 0 2px color-mix(in srgb, var(--pb-primary) 70%, #ffffff 30%), var(--pb-shadow-2)",
            selectedBg: "var(--pb-primary)",
            selectedText: "var(--pb-primary-text)",
            selectedBorder: "var(--pb-primary)",
          }
        : {
            radius: "0.625rem",
            baseShadow: "none",
            selectedShadow: "0 0 0 2px color-mix(in srgb, var(--pb-primary) 70%, #ffffff 30%), var(--pb-shadow-1)",
            selectedBg: "var(--pb-primary)",
            selectedText: "var(--pb-primary-text)",
            selectedBorder: "var(--pb-primary)",
          };

  const header =
    branding.headerStyle === "compact"
      ? { logoSize: "32px", verticalPadding: "0.75rem", accentOpacity: 0.2 }
      : branding.headerStyle === "branded"
        ? { logoSize: "52px", verticalPadding: "1rem", accentOpacity: 0.55 }
        : { logoSize: "40px", verticalPadding: "1rem", accentOpacity: 0.35 };

  return {
    colors: {
      primary,
      primaryHover,
      primaryText,
      pageBackground,
      pageBackgroundBase,
      cardBackground,
      text: "#0f172a",
      surface: cardBackground,
      surface2: mix(cardBackground, pageBackgroundBase, 0.45),
      border: "#e2e8f0",
      mutedText: "#64748b",
      successBg: "#ecfdf3",
      successText: "#166534",
      errorBg: "#fef2f2",
      errorText: "#b91c1c",
      warningBg: "#fff7ed",
      warningText: "#c2410c",
    },
    typography: {
      fontFamily: branding.fontFamily,
      fontSizeScale: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.5rem",
      },
      fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
      },
    },
    radius,
    shadow: {
      ...shadow,
      focus: `0 0 0 3px ${focusColor}`,
    },
    button,
    slot,
    header,
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.5rem",
    },
    focusRing: {
      color: focusColor,
      width: "3px",
    },
    motion,
  };
}
