"use client";

import type { ReactNode } from "react";

// =====================================================
// SettingsGrid -- 2-column responsive layout with optional aside rail
// =====================================================

interface SettingsGridProps {
  /** Main settings content (left column) */
  children: ReactNode;
  /** Aside content (right column): help text, previews, limits */
  aside?: ReactNode;
}

export function SettingsGrid({ children, aside }: SettingsGridProps) {
  if (!aside) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-6">{children}</div>
      <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">{aside}</div>
    </div>
  );
}
