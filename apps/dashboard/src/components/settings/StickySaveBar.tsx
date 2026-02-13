"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertTriangle } from "lucide-react";

// =====================================================
// StickySaveBar -- sticky bottom bar for unsaved changes
// =====================================================

interface StickySaveBarProps {
  isDirty: boolean;
  isValid: boolean;
  saving: boolean;
  saveError: string | null;
  lastSavedAt: Date | null;
  onSave: () => void;
  onDiscard: () => void;
  onRetry?: () => void;
  translations?: {
    unsavedChanges?: string;
    discard?: string;
    save?: string;
    saving?: string;
    saved?: string;
    lastSaved?: string;
    saveError?: string;
    retry?: string;
  };
}

export function StickySaveBar({
  isDirty,
  isValid,
  saving,
  saveError,
  lastSavedAt,
  onSave,
  onDiscard,
  onRetry,
  translations: t,
}: StickySaveBarProps) {
  const [showSaved, setShowSaved] = useState(false);

  // Brief "Saved" flash after successful save
  useEffect(() => {
    if (lastSavedAt && !saving && !saveError && !isDirty) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [lastSavedAt, saving, saveError, isDirty]);

  // Cmd/Ctrl+S keyboard shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && isValid && !saving) {
          onSave();
        }
      }
    },
    [isDirty, isValid, saving, onSave],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // beforeunload guard
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const labels = {
    unsavedChanges: t?.unsavedChanges ?? "Unsaved changes",
    discard: t?.discard ?? "Discard",
    save: t?.save ?? "Save Changes",
    saving: t?.saving ?? "Saving...",
    saved: t?.saved ?? "Saved",
    lastSaved: t?.lastSaved ?? "Last saved",
    saveError: t?.saveError ?? "Could not save. Try again.",
    retry: t?.retry ?? "Retry",
  };

  // Nothing to show
  if (!isDirty && !showSaved && !saveError) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-6">
      <div className="rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          {/* Left side: status */}
          <div className="flex items-center gap-2 text-sm" aria-live="polite" aria-atomic="true">
            {saving && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">{labels.saving}</span>
              </>
            )}
            {!saving && saveError && (
              <>
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">{labels.saveError}</span>
              </>
            )}
            {!saving && !saveError && showSaved && (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">{labels.saved}</span>
                {lastSavedAt && (
                  <span className="text-muted-foreground tabular-nums">
                    {labels.lastSaved}{" "}
                    {lastSavedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </>
            )}
            {!saving && !saveError && !showSaved && isDirty && (
              <span className="font-medium">{labels.unsavedChanges}</span>
            )}
          </div>

          {/* Right side: actions */}
          <div className="flex items-center gap-2">
            {!saving && saveError && onRetry && (
              <Button variant="default" size="sm" onClick={onRetry}>
                {labels.retry}
              </Button>
            )}
            {isDirty && !saving && (
              <>
                <Button variant="ghost" size="sm" onClick={onDiscard}>
                  {labels.discard}
                </Button>
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={!isValid || saving}
                >
                  {labels.save}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
