import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-50 to-blue-50/30 px-4">
      <h1 className="text-4xl font-semibold text-slate-800">404</h1>
      <p className="max-w-md text-center text-slate-600">
        This page could not be found. Here are some useful links:
      </p>
      <nav className="flex flex-wrap justify-center gap-4" aria-label="Relevant pages">
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Home
        </Link>
        <Link
          href="/landing"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Product overview
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Log in
        </Link>
      </nav>
    </div>
  );
}
