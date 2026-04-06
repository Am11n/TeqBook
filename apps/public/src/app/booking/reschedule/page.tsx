import { Suspense } from "react";
import BookingReschedulePageClient from "./page-client";

export default function BookingReschedulePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <p className="text-sm text-muted-foreground">…</p>
        </div>
      }
    >
      <BookingReschedulePageClient />
    </Suspense>
  );
}
