"use client";

import type { CSSProperties } from "react";
import type { PublicBookingTokens } from "./types";

export function buildPublicBookingCssVars(tokens: PublicBookingTokens): CSSProperties {
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
    "--pb-focus": tokens.focusRing.color,
    "--pb-shadow-1": tokens.shadow.level1,
    "--pb-shadow-2": tokens.shadow.level2,
    "--pb-radius-sm": "8px",
    "--pb-radius-md": "12px",
    "--pb-radius-lg": "16px",
    "--pb-space-xs": tokens.spacing.xs,
    "--pb-space-sm": tokens.spacing.sm,
    "--pb-space-md": tokens.spacing.md,
    "--pb-space-lg": tokens.spacing.lg,
    "--pb-space-xl": tokens.spacing.xl,
    "--pb-motion-fast": tokens.motion.durationFast,
    "--pb-motion-standard": tokens.motion.durationStandard,
    "--pb-ease-out": tokens.motion.easeOut,
    "--pb-ease-in-out": tokens.motion.easeInOut,
    "--pb-cta-ready-pulse": tokens.motion.ctaReadyPulse,
  } as CSSProperties;
}
