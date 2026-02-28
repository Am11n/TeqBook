"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CommissionRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: { id: string; full_name: string }[];
  currency: string;
  onSave: (rule: {
    employeeId: string; type: "percentage" | "fixed_per_booking";
    rate: number; appliesTo: "services" | "products" | "both";
  }) => Promise<{ error?: string | null }>;
}

export function CommissionRuleDialog({
  open, onOpenChange, employees, currency, onSave,
}: CommissionRuleDialogProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<"percentage" | "fixed_per_booking">("percentage");
  const [rate, setRate] = useState("");
  const [appliesTo, setAppliesTo] = useState<"services" | "products" | "both">("services");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = type === "percentage" ? parseFloat(rate) : parseInt(rate, 10);
    if (isNaN(parsed)) return;
    if (type === "fixed_per_booking" && parsed < 0) return;

    // UI uses whole currency units; convert to minor units for storage.
    const normalizedRate = type === "fixed_per_booking" ? parsed * 100 : parsed;
    setSaving(true);
    await onSave({ employeeId, type, rate: normalizedRate, appliesTo });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Commission Rule</DialogTitle>
          <DialogDescription>Set commission rate for an employee or salon default.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm">
              <option value="">Salon default (all employees)</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm">
              <option value="percentage">Percentage of revenue</option>
              <option value="fixed_per_booking">Fixed amount per booking</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">
              {type === "percentage" ? "Rate (decimal, e.g. 0.30 = 30%)" : `Amount per booking (${currency})`}
            </label>
            <input type="number" step={type === "percentage" ? "0.01" : "1"} min="0" value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={type === "percentage" ? "0.30" : "500"}
              className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
          </div>
          <div>
            <label className="text-xs font-medium">Applies to</label>
            <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as typeof appliesTo)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm">
              <option value="services">Services only</option>
              <option value="products">Products only</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !rate.trim()}>
            {saving ? "Saving..." : "Save Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
