"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterChips } from "@/components/filter-chips";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { Search } from "lucide-react";
import type { Employee, Service } from "@/lib/types";

export interface AssignServicesDialogTranslations {
  title: string;
  description: string;
  searchPlaceholder: string;
  employeeColumn: string;
  selectAllVisible: string;
  cancel: string;
  save: string;
  saving: string;
  saveError: string;
}

interface AssignServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  services: Service[];
  employeeServicesMap: Record<string, Service[]>;
  onSaved: () => Promise<void>;
  translations?: AssignServicesDialogTranslations;
}

const defaultTranslations: AssignServicesDialogTranslations = {
  title: "Assign services",
  description: "Choose which services each staff member should offer.",
  searchPlaceholder: "Search services...",
  employeeColumn: "Staff",
  selectAllVisible: "Select all visible",
  cancel: "Cancel",
  save: "Save changes",
  saving: "Saving...",
  saveError: "Could not save changes",
};

export function AssignServicesDialog({
  open,
  onOpenChange,
  employees,
  services,
  employeeServicesMap,
  onSaved,
  translations,
}: AssignServicesDialogProps) {
  const t = { ...defaultTranslations, ...translations };
  const { salon } = useCurrentSalon();

  // Search & filter state for services (columns)
  const [serviceSearch, setServiceSearch] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  // Matrix state: employeeId -> Set<serviceId>
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize matrix from current data when dialog opens
  const initMatrix = useCallback(() => {
    const m: Record<string, Set<string>> = {};
    for (const emp of employees) {
      const svcIds = (employeeServicesMap[emp.id] ?? []).map((s) => s.id);
      m[emp.id] = new Set(svcIds);
    }
    setMatrix(m);
    setError(null);
  }, [employees, employeeServicesMap]);

  // Re-init when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) initMatrix();
    onOpenChange(nextOpen);
  };

  // Build category chips from services
  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    for (const svc of services) {
      const cat = svc.category ?? "other";
      cats.set(cat, (cats.get(cat) ?? 0) + 1);
    }
    return Array.from(cats.entries()).map(([id, count]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }));
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    let result = services.filter((s) => s.is_active);
    if (serviceSearch.trim()) {
      const q = serviceSearch.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (categoryFilters.length > 0) {
      result = result.filter((s) =>
        categoryFilters.includes(s.category ?? "other"),
      );
    }
    return result;
  }, [services, serviceSearch, categoryFilters]);

  const activeEmployees = employees.filter((e) => e.is_active);

  const toggleCell = (employeeId: string, serviceId: string) => {
    setMatrix((prev) => {
      const next = { ...prev };
      const set = new Set(next[employeeId] ?? []);
      if (set.has(serviceId)) {
        set.delete(serviceId);
      } else {
        set.add(serviceId);
      }
      next[employeeId] = set;
      return next;
    });
  };

  const selectAllVisible = () => {
    setMatrix((prev) => {
      const next = { ...prev };
      for (const emp of activeEmployees) {
        const set = new Set(next[emp.id] ?? []);
        for (const svc of filteredServices) {
          set.add(svc.id);
        }
        next[emp.id] = set;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!salon?.id) return;
    setSaving(true);
    setError(null);

    try {
      // For each employee, compute diff and apply
      for (const emp of employees) {
        const currentIds = new Set(
          (employeeServicesMap[emp.id] ?? []).map((s) => s.id),
        );
        const newIds = matrix[emp.id] ?? new Set();

        const toAdd = [...newIds].filter((id) => !currentIds.has(id));
        const toRemove = [...currentIds].filter((id) => !newIds.has(id));

        if (toRemove.length > 0) {
          await supabase
            .from("employee_services")
            .delete()
            .eq("employee_id", emp.id)
            .eq("salon_id", salon.id)
            .in("service_id", toRemove);
        }

        if (toAdd.length > 0) {
          const rows = toAdd.map((serviceId) => ({
            employee_id: emp.id,
            service_id: serviceId,
            salon_id: salon.id,
          }));
          await supabase.from("employee_services").insert(rows);
        }
      }

      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.saveError,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {/* Service search + category filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="pl-8 h-9"
            />
          </div>
          <FilterChips
            chips={categories}
            value={categoryFilters}
            onChange={setCategoryFilters}
          />
        </div>

        {/* Matrix */}
        <div className="max-h-[60vh] overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background border-b">
              <tr>
                <th className="sticky left-0 z-20 bg-background px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {t.employeeColumn}
                </th>
                {filteredServices.map((svc) => (
                  <th
                    key={svc.id}
                    className="px-2 py-2 text-center text-xs font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {svc.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeEmployees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-accent/30">
                  <td className="sticky left-0 bg-background px-3 py-2 font-medium whitespace-nowrap">
                    {emp.full_name}
                  </td>
                  {filteredServices.map((svc) => (
                    <td key={svc.id} className="px-2 py-2 text-center">
                      <Checkbox
                        checked={matrix[emp.id]?.has(svc.id) ?? false}
                        onCheckedChange={() => toggleCell(emp.id, svc.id)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="text-sm text-destructive" aria-live="polite">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" size="sm" onClick={selectAllVisible}>
            {t.selectAllVisible}
          </Button>
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? t.saving : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
