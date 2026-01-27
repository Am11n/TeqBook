import { useState, FormEvent } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateShift } from "@/lib/repositories/shifts";
import { hasOverlappingShifts } from "@/lib/utils/shifts/shifts-utils";
import type { Shift } from "@/lib/types";

interface UseEditShiftOptions {
  shifts: Shift[];
  onShiftUpdated: (shift: Shift) => void;
}

export function useEditShift({
  shifts,
  onShiftUpdated,
}: UseEditShiftOptions) {
  const { salon } = useCurrentSalon();
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editWeekday, setEditWeekday] = useState<number>(1);
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editEndTime, setEditEndTime] = useState("17:00");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setEditEmployeeId(shift.employee_id);
    setEditWeekday(shift.weekday);
    setEditStartTime(shift.start_time?.slice(0, 5) || "09:00");
    setEditEndTime(shift.end_time?.slice(0, 5) || "17:00");
    setIsDialogOpen(true);
    setError(null);
  };

  const closeEditModal = () => {
    setIsDialogOpen(false);
    setEditingShift(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !editingShift) return;

    setSaving(true);
    setError(null);

    // Validate no overlap
    if (
      hasOverlappingShifts(
        shifts,
        editEmployeeId,
        editWeekday,
        editStartTime,
        editEndTime,
        editingShift.id
      )
    ) {
      setError("This shift overlaps with another shift for the same employee on the same day");
      setSaving(false);
      return;
    }

    const { data, error: updateError } = await updateShift(salon.id, editingShift.id, {
      employee_id: editEmployeeId,
      weekday: editWeekday,
      start_time: editStartTime,
      end_time: editEndTime,
    });

    if (updateError || !data) {
      setError(updateError ?? "Failed to update shift");
      setSaving(false);
      return;
    }

    onShiftUpdated(data);
    setSaving(false);
    closeEditModal();
  };

  return {
    editingShift,
    editEmployeeId,
    setEditEmployeeId,
    editWeekday,
    setEditWeekday,
    editStartTime,
    setEditStartTime,
    editEndTime,
    setEditEndTime,
    isDialogOpen,
    saving,
    error,
    setError,
    openEditModal,
    closeEditModal,
    handleSubmit,
  };
}

