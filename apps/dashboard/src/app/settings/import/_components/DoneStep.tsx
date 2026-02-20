import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImportBatch } from "@/lib/services/import-service";

interface DoneStepProps {
  batch: ImportBatch;
  onReset: () => void;
  onRollback: (batchId: string) => void;
}

export function DoneStep({ batch, onReset, onRollback }: DoneStepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-6 text-center">
        <CheckCircle2 className="h-10 w-10 mx-auto text-green-600 mb-3" />
        <p className="text-sm font-semibold">Import Complete</p>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <span className="text-green-600">{batch.success_count} imported</span>
          {batch.failed_count > 0 && (
            <span className="text-red-600">{batch.failed_count} failed</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onReset}>
          Import more
        </Button>
        <Button
          variant="ghost"
          className="text-red-600"
          onClick={() => onRollback(batch.id)}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Rollback
        </Button>
      </div>
    </div>
  );
}
