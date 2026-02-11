"use client";

import { useState, useEffect } from "react";
import { User, Check, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { validateBookingChange } from "@/lib/repositories/schedule-segments";
import { updateBooking } from "@/lib/services/bookings-service";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import type { CalendarBooking } from "@/lib/types";

interface ChangeEmployeeModalProps {
  booking: CalendarBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

type EmployeeAvailability = {
  id: string;
  full_name: string;
  available: boolean | null;
  conflicts?: string[];
};

export function ChangeEmployeeModal({ booking, open, onOpenChange, onChanged }: ChangeEmployeeModalProps) {
  const { salon } = useCurrentSalon();
  const [employees, setEmployees] = useState<EmployeeAvailability[]>([]);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salon?.id || !open || !booking) return;
    async function checkAll() {
      setChecking(true);
      setError(null);

      const { data: allEmployees } = await getEmployeesForCurrentSalon(salon!.id);
      if (!allEmployees) { setChecking(false); return; }

      const currentEmpId = booking!.employees?.id;
      const otherEmployees = allEmployees
        .filter((e) => e.id !== currentEmpId && e.is_active)
        .map((e) => ({ id: e.id, full_name: e.full_name }));

      const results: EmployeeAvailability[] = [];
      for (const emp of otherEmployees) {
        const { data } = await validateBookingChange(booking!.id, emp.id, null, null);
        results.push({
          id: emp.id,
          full_name: emp.full_name,
          available: data?.is_valid ?? null,
          conflicts: data?.conflicts?.map((c) => c.message_code) ?? [],
        });
      }

      results.sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return a.full_name.localeCompare(b.full_name);
      });

      setEmployees(results);
      setChecking(false);
    }
    checkAll();
  }, [salon?.id, open, booking]);

  if (!booking) return null;

  const handleSelect = async (employeeId: string) => {
    if (!salon?.id) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await updateBooking(salon.id, booking.id, { employee_id: employeeId });
    if (updateError) { setError(updateError); setSaving(false); return; }
    setSaving(false);
    onChanged();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Change Employee
          </DialogTitle>
          <DialogDescription>
            Current: {booking.employees?.full_name || "None"} &middot; {booking.services?.name}
          </DialogDescription>
        </DialogHeader>

        {checking && (
          <p className="text-sm text-muted-foreground text-center py-6">Checking employee availability...</p>
        )}

        {!checking && employees.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No other employees available.</p>
        )}

        {!checking && employees.length > 0 && (
          <div className="space-y-1 max-h-[40vh] overflow-y-auto">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => emp.available && handleSelect(emp.id)}
                disabled={!emp.available || saving}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                  emp.available ? "hover:bg-accent cursor-pointer" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-2">
                  {emp.available ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                  )}
                  <span>{emp.full_name}</span>
                </div>
                {emp.available ? (
                  <span className="text-[10px] text-green-600">Available</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Busy</span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
