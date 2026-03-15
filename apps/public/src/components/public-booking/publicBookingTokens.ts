"use client";

import type { CSSProperties } from "react";
import type { PublicBookingTokens } from "./types";

export function buildPublicBookingCssVars(tokens: PublicBookingTokens): CSSProperties {
  const secondaryBg = `color-mix(in srgb, ${tokens.colors.pageBackgroundBase} 76%, ${tokens.colors.cardBackground} 24%)`;
  const secondaryBorder = `color-mix(in srgb, ${tokens.colors.border} 78%, ${tokens.colors.pageBackgroundBase} 22%)`;
  const secondaryText = `color-mix(in srgb, ${tokens.colors.text} 90%, ${tokens.colors.pageBackgroundBase} 10%)`;
  const chipBg = `color-mix(in srgb, ${tokens.colors.pageBackgroundBase} 68%, ${tokens.colors.cardBackground} 32%)`;
  const chipBorder = `color-mix(in srgb, ${tokens.colors.border} 72%, ${tokens.colors.pageBackgroundBase} 28%)`;
  const chipText = `color-mix(in srgb, ${tokens.colors.mutedText} 92%, ${tokens.colors.text} 8%)`;
  const strongBorder = `color-mix(in srgb, ${tokens.colors.border} 84%, ${tokens.colors.text} 16%)`;

  return {
    "--pb-primary": tokens.colors.primary,
    "--pb-primary-hover": tokens.colors.primaryHover,
    "--pb-primary-text": tokens.colors.primaryText,
    "--pb-page-bg": tokens.colors.pageBackground,
    "--pb-bg": tokens.colors.pageBackgroundBase,
    "--pb-card-bg": tokens.colors.cardBackground,
    "--pb-surface": tokens.colors.surface,
    "--pb-surface-muted": tokens.colors.surface2,
    "--pb-border": tokens.colors.border,
    "--pb-text": tokens.colors.text,
    "--pb-muted": tokens.colors.mutedText,
    "--pb-success-bg": tokens.colors.successBg,
    "--pb-success-text": tokens.colors.successText,
    "--pb-error-bg": tokens.colors.errorBg,
    "--pb-error-text": tokens.colors.errorText,
    "--pb-warning-bg": tokens.colors.warningBg,
    "--pb-warning-text": tokens.colors.warningText,
    "--pb-bg-page": tokens.colors.pageBackground,
    "--pb-bg-surface": tokens.colors.surface,
    "--pb-bg-surface-subtle": tokens.colors.surface2,
    "--pb-text-primary": tokens.colors.text,
    "--pb-text-secondary": secondaryText,
    "--pb-text-muted": tokens.colors.mutedText,
    "--pb-border-soft": tokens.colors.border,
    "--pb-border-strong": strongBorder,
    "--pb-accent-primary": tokens.colors.primary,
    "--pb-accent-primary-hover": tokens.colors.primaryHover,
    "--pb-secondary-bg": secondaryBg,
    "--pb-secondary-border": secondaryBorder,
    "--pb-secondary-text": secondaryText,
    "--pb-chip-bg": chipBg,
    "--pb-chip-border": chipBorder,
    "--pb-chip-text": chipText,
    "--pb-status-open-bg": tokens.colors.successBg,
    "--pb-status-open-text": tokens.colors.successText,
    "--pb-status-closed-bg": tokens.colors.errorBg,
    "--pb-status-closed-text": tokens.colors.errorText,
    "--pb-divider": `color-mix(in srgb, ${tokens.colors.border} 82%, ${tokens.colors.pageBackgroundBase} 18%)`,
    "--pb-overlay": "rgba(30, 26, 23, 0.30)",
    "--pb-focus": tokens.focusRing.color,
    "--pb-focus-width": tokens.focusRing.width,
    "--pb-shadow-1": tokens.shadow.level1,
    "--pb-shadow-2": tokens.shadow.level2,
    "--pb-shadow-card": tokens.shadow.card,
    "--pb-shadow-focus": tokens.shadow.focus,
    "--pb-radius-sm": tokens.radius.sm,
    "--pb-radius-md": tokens.radius.md,
    "--pb-radius-lg": tokens.radius.lg,
    "--pb-space-xs": tokens.spacing.xs,
    "--pb-space-sm": tokens.spacing.sm,
    "--pb-space-md": tokens.spacing.md,
    "--pb-space-lg": tokens.spacing.lg,
    "--pb-space-xl": tokens.spacing.xl,
    "--pb-motion-fast": tokens.motion.durationFast,
    "--pb-motion-standard": tokens.motion.durationStandard,
    "--pb-motion-hover": tokens.motion.durationFast,
    "--pb-ease-out": tokens.motion.easeOut,
    "--pb-ease-in-out": tokens.motion.easeInOut,
    "--pb-cta-ready-pulse": tokens.motion.ctaReadyPulse,
    "--pb-button-radius": tokens.button.radius,
    "--pb-button-shadow": tokens.button.shadow,
    "--pb-button-hover-lift": tokens.button.hoverLift,
    "--pb-slot-radius": tokens.slot.radius,
    "--pb-slot-shadow": tokens.slot.baseShadow,
    "--pb-slot-selected-shadow": tokens.slot.selectedShadow,
    "--pb-slot-selected-bg": tokens.slot.selectedBg,
    "--pb-slot-selected-text": tokens.slot.selectedText,
    "--pb-slot-selected-border": tokens.slot.selectedBorder,
    "--pb-header-logo-size": tokens.header.logoSize,
    "--pb-header-vertical-padding": tokens.header.verticalPadding,
    "--pb-header-accent-opacity": `${tokens.header.accentOpacity}`,
    // System-locked in v1: consistent readability overlay across all branded backgrounds.
    "--pb-header-overlay-opacity": "0.04",
    "--pb-header-min-height-compact": "8.5rem",
    "--pb-header-min-height-standard": "10.25rem",
    "--pb-header-min-height-branded": "11.5rem",
  } as CSSProperties;
}
