"use client";

import type { CSSProperties } from "react";
import type { PublicBookingTokens } from "./types";

export function buildPublicBookingCssVars(tokens: PublicBookingTokens): CSSProperties {
  return {
    "--pb-primary": tokens.colors.primary,
    "--pb-primary-hover": tokens.colors.primaryHover,
    "--pb-primary-text": tokens.colors.primaryText,
    "--pb-bg": tokens.colors.surface2,
    "--pb-surface": tokens.colors.surface,
    "--pb-surface-muted": tokens.colors.surface2,
    "--pb-border": tokens.colors.border,
    "--pb-text": "#0f172a",
    "--pb-muted": tokens.colors.mutedText,
    "--pb-success-bg": tokens.colors.successBg,
    "--pb-success-text": tokens.colors.successText,
    "--pb-error-bg": tokens.colors.errorBg,
    "--pb-error-text": tokens.colors.errorText,
    "--pb-warning-bg": tokens.colors.warningBg,
    "--pb-warning-text": tokens.colors.warningText,
    "--pb-focus": tokens.focusRing.color,
    "--pb-shadow-1": "0 8px 24px rgba(15, 23, 42, 0.06)",
    "--pb-shadow-2": "0 16px 34px rgba(15, 23, 42, 0.08)",
    "--pb-radius-sm": "8px",
    "--pb-radius-md": "12px",
    "--pb-radius-lg": "16px",
    "--pb-space-xs": tokens.spacing.xs,
    "--pb-space-sm": tokens.spacing.sm,
    "--pb-space-md": tokens.spacing.md,
    "--pb-space-lg": tokens.spacing.lg,
    "--pb-space-xl": tokens.spacing.xl,
  } as CSSProperties;
}
