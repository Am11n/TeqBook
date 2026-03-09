"use client";

import type { ReactNode } from "react";

type PublicBookingLayoutProps = {
  left: ReactNode;
  right: ReactNode;
  top?: ReactNode;
};

export function PublicBookingLayout({ left, right, top }: PublicBookingLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
      {top}
      <div
        className="grid gap-8 rounded-[var(--pb-radius-lg)] border p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start"
        style={{
          borderColor: "var(--pb-border)",
          backgroundColor: "color-mix(in srgb, var(--pb-surface) 94%, var(--pb-surface-muted) 6%)",
          boxShadow: "var(--pb-shadow-1)",
        }}
      >
        <div className="min-w-0 border-b pb-2 lg:border-b-0 lg:border-r lg:pr-5" style={{ borderColor: "var(--pb-border)" }}>{left}</div>
        <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block">{right}</aside>
      </div>
    </div>
  );
}
