import { useState, FormEvent } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { createShift } from "@/lib/repositories/shifts";
import { hasOverlappingShifts } from "@/lib/utils/shifts/shifts-utils";
import type { Shift } from "@/lib/types";

interface UseCreateShiftOptions {
  shifts: Shift[];
  onShiftCreated: (shift: Shift) => void;
  translations: {
    addError: string;
  };
  /** Pre-select employee when opening from a specific employee section */
  initialEmployeeId?: string;
  /** Smart default start time (e.g. salon opening hours). Falls back to "09:00" */
  initialStartTime?: string;
  /** Smart default end time (e.g. salon closing hours). Falls back to "17:00" */
  initialEndTime?: string;
}

export function useCreateShift({
  shifts,
  onShiftCreated,
  translations,
  initialEmployeeId = "",
  initialStartTime = "09:00",
  initialEndTime = "17:00",
}: UseCreateShiftOptions) {
  const { salon } = useCurrentSalon();
  const [employeeId, setEmployeeId] = useState(initialEmployeeId);
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !employeeId) return;

    setSaving(true);
    setError(null);

    // Validate no overlap
    if (hasOverlappingShifts(shifts, employeeId, weekday, startTime, endTime)) {
      setError("This shift overlaps with another shift for the same employee on the same day");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await createShift({
      salon_id: salon.id,
      employee_id: employeeId,
      weekday,
      start_time: startTime,
      end_time: endTime,
    });

    if (insertError || !data) {
      setError(insertError ?? translations.addError);
      setSaving(false);
      return;
    }

    onShiftCreated(data);
    
    // Reset form to initial defaults
    setEmployeeId(initialEmployeeId);
    setWeekday(1);
    setStartTime(initialStartTime);
    setEndTime(initialEndTime);
    setSaving(false);
  };

  const reset = () => {
    setEmployeeId(initialEmployeeId);
    setWeekday(1);
    setStartTime(initialStartTime);
    setEndTime(initialEndTime);
    setError(null);
  };

  /** Pre-fill the form with a specific employee (called from quick-create CTAs) */
  const prefill = (empId: string) => {
    setEmployeeId(empId);
    setError(null);
  };

  return {
    employeeId,
    setEmployeeId,
    weekday,
    setWeekday,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    saving,
    error,
    setError,
    handleSubmit,
    reset,
    prefill,
  };
}

