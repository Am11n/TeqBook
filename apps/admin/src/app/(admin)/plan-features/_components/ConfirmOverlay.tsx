"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { PlanType } from "@/lib/config/feature-limits";

interface ConfirmOverlayProps {
  show: boolean;
  saving: boolean;
  insertCount: number;
  deleteCount: number;
  updateCount: number;
  affectedPlans: PlanType[];
  affectedSalonCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmOverlay({
  show,
  saving,
  insertCount,
  deleteCount,
  updateCount,
  affectedPlans,
  affectedSalonCount,
  onCancel,
  onConfirm,
}: ConfirmOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Confirm changes</h3>
          </div>
          <div className="text-sm space-y-1">
            {insertCount > 0 && (
              <p className="text-emerald-600">
                + {insertCount} feature{insertCount !== 1 ? "s" : ""} added
              </p>
            )}
            {deleteCount > 0 && (
              <p className="text-red-600">
                - {deleteCount} feature{deleteCount !== 1 ? "s" : ""} removed
              </p>
            )}
            {updateCount > 0 && (
              <p className="text-blue-600">
                ~ {updateCount} limit{updateCount !== 1 ? "s" : ""} changed
              </p>
            )}
            {affectedSalonCount > 0 && (
              <p className="text-muted-foreground mt-2">
                This affects {affectedSalonCount} salon
                {affectedSalonCount !== 1 ? "s" : ""} across{" "}
                {affectedPlans.join(", ")} plan
                {affectedPlans.length !== 1 ? "s" : ""}.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={onConfirm} disabled={saving}>
              {saving ? "Saving..." : "Confirm & Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
