import { Skeleton } from "@teqbook/ui";

/**
 * Shown while the (admin) page segment loads (dev: on-demand compile + client navigation).
 * Does not remove real work; improves perceived responsiveness.
 */
export default function AdminSegmentLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-3 py-4 md:px-8 md:py-8" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  );
}
