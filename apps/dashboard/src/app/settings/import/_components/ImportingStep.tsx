import { Loader2 } from "lucide-react";

interface ImportingStepProps {
  progress: number;
  progressTotal: number;
}

export function ImportingStep({ progress, progressTotal }: ImportingStepProps) {
  const pct = progressTotal > 0 ? (progress / progressTotal) * 100 : 0;

  return (
    <div className="text-center py-8 space-y-4">
      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
      <p className="text-sm font-medium">Importing...</p>
      <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {progress} / {progressTotal} rows
      </p>
    </div>
  );
}
