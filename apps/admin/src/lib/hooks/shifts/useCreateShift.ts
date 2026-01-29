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
}

export function useCreateShift({
  shifts,
  onShiftCreated,
  translations,
}: UseCreateShiftOptions) {
  const { salon } = useCurrentSalon();
  const [employeeId, setEmployeeId] = useState("");
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
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
    
    // Reset form
    setEmployeeId("");
    setWeekday(1);
    setStartTime("09:00");
    setEndTime("17:00");
    setSaving(false);
  };

  const reset = () => {
    setEmployeeId("");
    setWeekday(1);
    setStartTime("09:00");
    setEndTime("17:00");
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
  };
}

