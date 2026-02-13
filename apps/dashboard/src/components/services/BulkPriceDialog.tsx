"use client";

import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { formatPrice as _formatPrice } from "@/lib/utils/services/services-utils";
import type { Service } from "@/lib/types";

type BulkAction = "adjust_percent" | "round";

export interface BulkPriceDialogTranslations {
  title: string;
  appliesTo: string;
  appliesToSelected: string;
  appliesToAll: string;
  adjustPercent: string;
  roundOff: string;
  percentLabel: string;
  roundToNearest: string;
  serviceName: string;
  before: string;
  after: string;
  cancel: string;
  apply: string;
  applying: string;
  locale: string;
}

interface BulkPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  selectedIds: string[];
  onApply: (
    serviceIds: string[],
    transform: (priceCents: number) => number,
  ) => Promise<void>;
  translations?: BulkPriceDialogTranslations;
}

const defaultTranslations: BulkPriceDialogTranslations = {
  title: "Adjust prices",
  appliesTo: "Applies to",
  appliesToSelected: "selected services",
  appliesToAll: "all services",
  adjustPercent: "Adjust by %",
  roundOff: "Round off",
  percentLabel: "Percent:",
  roundToNearest: "Round to nearest:",
  serviceName: "Service",
  before: "Before",
  after: "After",
  cancel: "Cancel",
  apply: "Apply changes",
  applying: "Applying...",
  locale: "en",
};

export function BulkPriceDialog({
  open,
  onOpenChange,
  services,
  selectedIds,
  onApply,
  translations,
}: BulkPriceDialogProps) {
  const t = { ...defaultTranslations, ...translations };
  const formatPrice = (cents: number) => _formatPrice(cents, t.locale);

  const [action, setAction] = useState<BulkAction>("adjust_percent");
  const [percent, setPercent] = useState("10");
  const [roundTo, setRoundTo] = useState("10");
  const [saving, setSaving] = useState(false);

  const affectedServices = useMemo(
    () =>
      services.filter((s) =>
        selectedIds.length > 0 ? selectedIds.includes(s.id) : true,
      ),
    [services, selectedIds],
  );

  const getTransform = (): ((priceCents: number) => number) => {
    if (action === "adjust_percent") {
      const p = parseFloat(percent) / 100;
      return (c) => Math.round(c * (1 + p));
    }
    const r = parseInt(roundTo, 10) * 100;
    return (c) => Math.round(c / r) * r;
  };

  const preview = useMemo(() => {
    const transform = getTransform();
    return affectedServices.map((s) => ({
      id: s.id,
      name: s.name,
      before: s.price_cents,
      after: transform(s.price_cents),
    }));
  }, [affectedServices, action, percent, roundTo]);

  const handleApply = async () => {
    setSaving(true);
    const ids = affectedServices.map((s) => s.id);
    await onApply(ids, getTransform());
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>
            {selectedIds.length > 0
              ? `${t.appliesTo} ${selectedIds.length} ${t.appliesToSelected}`
              : `${t.appliesTo} ${affectedServices.length} ${t.appliesToAll}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={action === "adjust_percent" ? "default" : "outline"}
              size="sm"
              onClick={() => setAction("adjust_percent")}
            >
              {t.adjustPercent}
            </Button>
            <Button
              variant={action === "round" ? "default" : "outline"}
              size="sm"
              onClick={() => setAction("round")}
            >
              {t.roundOff}
            </Button>
          </div>

          {action === "adjust_percent" && (
            <div className="flex items-center gap-2">
              <Label className="text-sm">{t.percentLabel}</Label>
              <Input
                type="number"
                className="h-8 w-24"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          )}

          {action === "round" && (
            <div className="flex items-center gap-2">
              <Label className="text-sm">{t.roundToNearest}</Label>
              <select
                className="h-8 rounded-md border bg-background px-2 text-sm"
                value={roundTo}
                onChange={(e) => setRoundTo(e.target.value)}
              >
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          )}

          <div className="max-h-[40vh] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    {t.serviceName}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                    {t.before}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                    {t.after}
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {formatPrice(row.before)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatPrice(row.after)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleApply} disabled={saving}>
            {saving ? t.applying : t.apply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
