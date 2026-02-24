import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/signup", label: "Sign up" },
  { href: "/login", label: "Log in" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-blue-200/50 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:justify-between sm:px-6">
        <span suppressHydrationWarning>
          &copy; {new Date().getFullYear()} TeqBook.
        </span>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-slate-900 underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="text-center sm:text-left">
          Helping salons stay organized, confident and fully booked &mdash; globally.
        </span>
      </div>
    </footer>
  );
}
