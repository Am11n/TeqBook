import { Suspense } from "react";
import Login2FAPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default function Login2FAPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <Login2FAPageClient />
    </Suspense>
  );
}
