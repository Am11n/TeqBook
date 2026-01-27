import { Suspense } from "react";
import Login2FAPageClient from "./page-client";

// Disable static generation for this page since it uses search params
export const dynamic = 'force-dynamic';

export default function Login2FAPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <Login2FAPageClient />
    </Suspense>
  );
}
