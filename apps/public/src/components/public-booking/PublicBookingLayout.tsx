"use client";

import type { ReactNode } from "react";

type PublicBookingLayoutProps = {
  left: ReactNode;
  right: ReactNode;
  top?: ReactNode;
};

export function PublicBookingLayout({ left, right, top }: PublicBookingLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-5 px-4 py-6 sm:px-6 md:py-8">
      {top}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0">{left}</div>
        <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block">{right}</aside>
      </div>
    </div>
  );
}
