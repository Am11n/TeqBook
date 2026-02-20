"use client";

import { Fragment } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { PLAN_TYPES, FEATURE_LIMITS, type PlanType } from "@/lib/config/feature-limits";
import type { FeatureRow, MatrixState } from "./types";
import { PlanColumnHeader } from "./PlanColumnHeader";

interface FeatureMatrixTableProps {
  matrix: MatrixState;
  originalMatrix: MatrixState;
  features: FeatureRow[];
  filteredCategories: { category: string; features: FeatureRow[] }[];
  salonCounts: Record<PlanType, number>;
  search: string;
  onToggleCell: (featureId: string, plan: PlanType) => void;
  onSetLimit: (featureId: string, plan: PlanType, value: number | null) => void;
  onEnableAll: (plan: PlanType) => void;
  onDisableAll: (plan: PlanType) => void;
  onCopyFrom: (source: PlanType, target: PlanType) => void;
}

export function FeatureMatrixTable({
  matrix,
  originalMatrix,
  features,
  filteredCategories,
  salonCounts,
  search,
  onToggleCell,
  onSetLimit,
  onEnableAll,
  onDisableAll,
  onCopyFrom,
}: FeatureMatrixTableProps) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 font-medium sticky left-0 bg-muted/50 min-w-[240px] z-10">
              Feature
            </th>
            {PLAN_TYPES.map((plan) => (
              <th key={plan} className="px-4 py-3 text-center min-w-[160px]">
                <PlanColumnHeader
                  plan={plan}
                  matrix={matrix}
                  featureCount={features.length}
                  salonCount={salonCounts[plan]}
                  onEnableAll={onEnableAll}
                  onDisableAll={onDisableAll}
                  onCopyFrom={onCopyFrom}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map(({ category, features: catFeatures }) => (
            <Fragment key={category}>
              <tr className="bg-muted/30">
                <td
                  colSpan={4}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {category}
                </td>
              </tr>
              {catFeatures.map((feature) => {
                const limitConfig = FEATURE_LIMITS[feature.key];
                return (
                  <tr
                    key={feature.id}
                    className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 sticky left-0 bg-background z-10">
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {feature.description ?? feature.key}
                        </p>
                      </div>
                    </td>
                    {PLAN_TYPES.map((plan) => {
                      const cell = matrix[feature.id]?.[plan];
                      if (!cell) return <td key={plan} className="px-4 py-3" />;

                      const origCell = originalMatrix[feature.id]?.[plan];
                      const changed =
                        cell.enabled !== (origCell?.enabled ?? false) ||
                        (cell.enabled &&
                          origCell?.enabled &&
                          cell.limitValue !== origCell.limitValue);

                      return (
                        <td
                          key={plan}
                          className={`px-4 py-3 text-center ${
                            changed ? "bg-amber-50/50" : ""
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <Checkbox
                              checked={cell.enabled}
                              onCheckedChange={() => onToggleCell(feature.id, plan)}
                            />
                            {cell.enabled &&
                              limitConfig?.limitType === "numeric" && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    value={cell.limitValue ?? ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      onSetLimit(
                                        feature.id,
                                        plan,
                                        v === "" ? null : Number(v)
                                      );
                                    }}
                                    placeholder="∞"
                                    className="h-7 w-16 rounded border border-input bg-background px-2 text-xs text-center outline-none focus:ring-1 focus:ring-ring"
                                  />
                                  {limitConfig.unit && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {limitConfig.unit}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </Fragment>
          ))}
          {filteredCategories.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-8 text-center text-muted-foreground"
              >
                No features found matching &quot;{search}&quot;
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
