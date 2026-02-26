import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNavClient } from "./MobileNavClient";

export function MarketingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-transparent">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="hidden w-full items-center justify-center sm:flex">
          <div className="flex w-full max-w-4xl items-center justify-between rounded-full border border-white/60 bg-white/55 px-4 py-2 text-slate-900 shadow-lg shadow-slate-900/15 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-1 transition-opacity hover:opacity-90">
              <Image
                src="/Favikon.svg"
                alt="TeqBook"
                width={120}
                height={32}
                className="h-9 w-auto"
              />
              <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                TeqBook
              </span>
            </Link>

            <nav className="flex items-center gap-2" aria-label="Primary navigation">
              <Link
                href="/pricing"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-100/80 hover:text-slate-900"
              >
                Pricing
              </Link>
              <Link
                href="/security"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-100/80 hover:text-slate-900"
              >
                Security
              </Link>
              <Link
                href="/contact"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-100/80 hover:text-slate-900"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between rounded-full border border-white/60 bg-white/55 px-3 py-2 shadow-md shadow-slate-900/10 backdrop-blur-xl sm:hidden">
          <Link href="/" className="flex items-center gap-1 transition-opacity hover:opacity-80">
            <Image
              src="/Favikon.svg"
              alt="TeqBook"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              TeqBook
            </span>
          </Link>
          <MobileNavClient />
        </div>
      </div>
    </header>
  );
}
