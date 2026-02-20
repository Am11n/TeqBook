export function MobileSkeleton({ slotCount, slotHeight }: { slotCount: number; slotHeight: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: slotCount }, (_, i) => (
        <div
          key={i}
          className="flex border-b border-border/20"
          style={{ minHeight: `${slotHeight}px` }}
        >
          <div className="w-12 shrink-0 pt-1 pr-2 text-right">
            {i % 2 === 0 && (
              <div className="ml-auto h-3 w-8 rounded bg-muted" />
            )}
          </div>
          <div className="flex-1 py-0.5 pr-2">
            {i % 3 === 1 && (
              <div className="h-9 rounded-lg bg-muted/60" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
