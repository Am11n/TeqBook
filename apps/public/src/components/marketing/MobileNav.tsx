"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/60"
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col gap-6 border-r bg-white px-5 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 w-8 flex items-center justify-center"
                aria-label="Close"
              >
                <span className="text-lg">&times;</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700"
              >
                Log in
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
