import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen scroll-smooth overflow-x-hidden pb-24 pt-18 sm:pb-0">
        {children}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/90 p-3 backdrop-blur-lg sm:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Link
            href="/signup"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Start free
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Contact
          </Link>
        </div>
      </div>
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
        <MarketingFooter />
      </div>
    </>
  );
}
