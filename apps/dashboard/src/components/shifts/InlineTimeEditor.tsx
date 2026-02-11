"use client";

import { useRef, useEffect, useCallback } from "react";
import { Check } from "lucide-react";

interface InlineTimeEditorProps {
  startTime: string;
  endTime: string;
  saving: boolean;
  onChange: (field: "startTime" | "endTime", value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Inline time editor for shift cells.
 * - Two <input type="time"> fields for start/end
 * - Auto-focuses start on mount
 * - Enter saves, Escape cancels
 * - Blur only saves when focus leaves the entire editor (not when moving between inputs)
 */
export function InlineTimeEditor({
  startTime,
  endTime,
  saving,
  onChange,
  onSave,
  onCancel,
}: InlineTimeEditorProps) {
  const startRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startRef.current?.focus();
    startRef.current?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
    [onSave, onCancel]
  );

  /**
   * Only trigger save when focus truly leaves the editor container.
   * `relatedTarget` is the element receiving focus — if it's still
   * inside our container, the user is just switching between inputs.
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      const movingTo = e.relatedTarget as Node | null;
      if (containerRef.current && movingTo && containerRef.current.contains(movingTo)) {
        // Focus moved to the other input inside our editor — do nothing
        return;
      }
      // Focus left the editor entirely — save
      onSave();
    },
    [onSave]
  );

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={startRef}
        type="time"
        value={startTime}
        onChange={(e) => onChange("startTime", e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-6 w-[72px] rounded border border-input bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        disabled={saving}
      />
      <span className="text-xs text-muted-foreground">–</span>
      <input
        type="time"
        value={endTime}
        onChange={(e) => onChange("endTime", e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-6 w-[72px] rounded border border-input bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        disabled={saving}
      />
      {saving && (
        <Check className="h-3 w-3 animate-pulse text-muted-foreground" />
      )}
    </div>
  );
}
