import { Suspense } from "react";
import Login2FAPageClient from "./page-client";

export default function AdminLogin2FAPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4 text-sm text-slate-600">
          Loading…
        </div>
      }
    >
      <Login2FAPageClient />
    </Suspense>
  );
}
