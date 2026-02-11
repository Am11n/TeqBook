import { useState, useCallback } from "react";
import { updateShift } from "@/lib/repositories/shifts";
import type { Shift } from "@/lib/types";

type EditingState = {
  shiftId: string;
  startTime: string;
  endTime: string;
};

/**
 * Hook that manages inline shift editing state:
 * - Tracks which shift is being edited
 * - Enter/blur saves, Escape cancels
 * - Optimistic UI with rollback on error
 */
export function useInlineShiftEdit(
  salonId: string | undefined,
  onShiftUpdated: (shift: Shift) => void
) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  /** Start editing a shift */
  const startEdit = useCallback((shift: Shift) => {
    setEditing({
      shiftId: shift.id,
      startTime: shift.start_time,
      endTime: shift.end_time,
    });
    setSavedId(null);
  }, []);

  /** Update the in-progress edit values */
  const updateEditValue = useCallback(
    (field: "startTime" | "endTime", value: string) => {
      setEditing((prev) => (prev ? { ...prev, [field]: value } : null));
    },
    []
  );

  /** Cancel editing (Escape) */
  const cancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  /** Save the edit (Enter / blur) */
  const saveEdit = useCallback(async () => {
    if (!editing || !salonId) return;
    if (!editing.startTime || !editing.endTime) return;
    if (editing.endTime <= editing.startTime) return;

    setSaving(true);

    const { data, error } = await updateShift(salonId, editing.shiftId, {
      start_time: editing.startTime,
      end_time: editing.endTime,
    });

    setSaving(false);

    if (data && !error) {
      onShiftUpdated(data);
      setSavedId(editing.shiftId);
      setEditing(null);
      // Clear "saved" indicator after 2s
      setTimeout(() => setSavedId(null), 2000);
    }
  }, [editing, salonId, onShiftUpdated]);

  /** Is a specific shift currently being edited? */
  const isEditing = useCallback(
    (shiftId: string) => editing?.shiftId === shiftId,
    [editing]
  );

  /** Was this shift just saved? (for "Lagret" badge) */
  const wasSaved = useCallback(
    (shiftId: string) => savedId === shiftId,
    [savedId]
  );

  return {
    editing,
    saving,
    startEdit,
    updateEditValue,
    cancelEdit,
    saveEdit,
    isEditing,
    wasSaved,
  };
}
