import { Button } from "@/components/ui/button";
import type { ImportBatch } from "@/lib/services/import-service";

interface ImportHistoryProps {
  history: ImportBatch[];
  loading: boolean;
  onRollback: (batchId: string) => void;
}

const STATUS_CLASSES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  rolled_back: "bg-gray-100 text-gray-500",
  failed: "bg-red-100 text-red-700",
};

export function ImportHistory({ history, loading, onRollback }: ImportHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Import History
      </h3>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="divide-y">
          {history.map((batch) => {
            const canRollback =
              batch.status === "completed" &&
              Date.now() - new Date(batch.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

            return (
              <div key={batch.id} className="flex items-center justify-between py-2 text-xs">
                <div>
                  <span className="font-medium capitalize">{batch.import_type}</span>
                  {batch.file_name && (
                    <span className="text-muted-foreground ml-2">{batch.file_name}</span>
                  )}
                  <span className="text-muted-foreground ml-2">
                    {new Date(batch.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600">{batch.success_count}</span>
                  {batch.failed_count > 0 && (
                    <span className="text-red-600">{batch.failed_count} failed</span>
                  )}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                      STATUS_CLASSES[batch.status] ?? "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {batch.status}
                  </span>
                  {canRollback && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-red-600"
                      onClick={() => onRollback(batch.id)}
                    >
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
