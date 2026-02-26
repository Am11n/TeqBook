"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
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
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-900/45 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div
            id={menuId}
            className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center px-4 pb-4 pt-2"
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="true"
          >
            <div
              ref={panelRef}
              className="w-full max-w-sm rounded-[24px] border border-white/50 bg-slate-50/95 p-3 shadow-2xl shadow-slate-900/30 backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-200"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <nav className="space-y-0.5 text-center" aria-label="Primary mobile links">
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
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-1.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    Contact
                  </Link>
                </nav>
                <div className="my-3 h-px bg-slate-200" />
                <div className="flex flex-col items-center gap-2">
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-w-28 items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-w-28 items-center justify-center rounded-lg border border-slate-300 px-4 py-1.5 text-center text-sm font-semibold text-slate-700"
                  >
                    Log in
                  </Link>
                </div>
                <p className="mb-1.5 mt-3 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Language
                </p>
                <div className="flex justify-center">
                  <LanguageSwitcher dropUp />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
