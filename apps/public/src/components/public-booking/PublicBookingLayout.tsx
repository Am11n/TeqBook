"use client";

import type { ReactNode } from "react";

type PublicBookingLayoutProps = {
  left: ReactNode;
  right: ReactNode;
  top?: ReactNode;
};

export function PublicBookingLayout({ left, right, top }: PublicBookingLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      {top}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">{left}</div>
        <aside className="min-w-0 lg:sticky lg:top-24">{right}</aside>
      </div>
    </div>
  );
}
