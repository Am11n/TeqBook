"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, FileText, ArrowRight, Loader2 } from "lucide-react";

interface BulkActionsBarProps {
  onCopyWeek: () => Promise<{ count: number; error: string | null }>;
  onUseTemplate: () => Promise<{ count: number; error: string | null }>;
  onCopyMondayToWeek: () => Promise<{ count: number; error: string | null }>;
  translations: {
    copyWeek: string;
    useTemplate: string;
    copyMondayToWeek: string;
  };
}

export function BulkActionsBar({
  onCopyWeek,
  onUseTemplate,
  onCopyMondayToWeek,
  translations: t,
}: BulkActionsBarProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = async (
    key: string,
    action: () => Promise<{ count: number; error: string | null }>
  ) => {
    setBusy(key);
    setFeedback(null);

    const result = await action();

    setBusy(null);
    if (result.error) {
      setFeedback(result.error);
    } else if (result.count > 0) {
      setFeedback(`${result.count} opprettet`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => handleAction("copy", onCopyWeek)}
        className="gap-1.5"
      >
        {busy === "copy" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {t.copyWeek}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => handleAction("template", onUseTemplate)}
        className="gap-1.5"
      >
        {busy === "template" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        {t.useTemplate}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => handleAction("monday", onCopyMondayToWeek)}
        className="gap-1.5"
      >
        {busy === "monday" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ArrowRight className="h-3.5 w-3.5" />
        )}
        {t.copyMondayToWeek}
      </Button>

      {feedback && (
        <span className="text-xs text-muted-foreground animate-in fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}
