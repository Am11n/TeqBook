"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/50 bg-white/60 backdrop-blur-lg transition-colors hover:bg-white/80"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={menuId}
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
            className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div
            id={menuId}
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pb-4 pt-2"
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-[24px] border border-white/50 bg-slate-50/95 p-3 shadow-2xl shadow-slate-900/30 backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1.5">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/Favikon.svg"
                    alt="TeqBook"
                    width={100}
                    height={28}
                    className="h-6 w-auto"
                  />
                  <span className="text-sm font-semibold tracking-tight text-slate-900">
                    TeqBook
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>

              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="border-b border-slate-200 pb-2">
                  <p className="text-xl font-semibold tracking-tight text-slate-900">Menu</p>
                </div>

                <nav className="space-y-0.5" aria-label="Primary mobile links">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-1.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    Home
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-1.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/security"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-1.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    Security
                  </Link>
                </nav>
              </div>

              <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-center text-sm font-semibold text-white"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm font-semibold text-slate-700"
                  >
                    Log in
                  </Link>
                </div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Language
                </p>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
