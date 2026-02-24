"use client";

import { useState } from "react";
import { Check, Minus, ChevronDown } from "lucide-react";

export type ComparisonColumn = {
  id: string;
  label: string;
  highlighted?: boolean;
};

export type ComparisonRow = {
  category: string;
  feature: string;
  values: Record<string, string | boolean | number>;
};

export type ComparisonMeta = {
  planId: string;
  bestFor: string;
  teamSize: string;
};

type ComparisonTableProps = {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  categories: string[];
  planMeta?: ComparisonMeta[];
};

function CellValue({ value }: { value: string | boolean | number }) {
  if (value === true) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center text-slate-300">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-slate-700">{String(value)}</span>
  );
}

export function ComparisonTable({
  columns,
  rows,
  categories,
  planMeta,
}: ComparisonTableProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    return new Set(categories.length > 0 ? [categories[0]] : []);
  });

  function toggleCategory(category: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full min-w-[600px] text-sm">
        <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_theme(colors.slate.200)]">
          <tr>
            <th className="sticky left-0 z-30 bg-white py-4 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:pl-0 sm:min-w-[240px]">
              Feature
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className={`px-4 py-4 text-center text-sm font-semibold ${
                  col.highlighted
                    ? "text-blue-600"
                    : "text-slate-900"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* "Who is this for?" meta rows */}
          {planMeta && planMeta.length > 0 && (
            <>
              <tr className="border-b border-slate-100">
                <td className="sticky left-0 z-10 bg-white py-3 pl-4 pr-3 text-sm font-medium text-slate-700 sm:pl-0">
                  Best for
                </td>
                {columns.map((col) => {
                  const meta = planMeta.find((m) => m.planId === col.id);
                  return (
                    <td key={col.id} className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${col.highlighted ? "text-blue-600" : "text-slate-700"}`}>
                        {meta?.bestFor ?? "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-slate-200">
                <td className="sticky left-0 z-10 bg-white py-3 pl-4 pr-3 text-sm font-medium text-slate-700 sm:pl-0">
                  Typical team size
                </td>
                {columns.map((col) => {
                  const meta = planMeta.find((m) => m.planId === col.id);
                  return (
                    <td key={col.id} className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-slate-700">
                        {meta?.teamSize ?? "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </>
          )}

          {/* Collapsible category groups */}
          {categories.map((category) => {
            const categoryRows = rows.filter((r) => r.category === category);
            if (categoryRows.length === 0) return null;
            const isOpen = openCategories.has(category);

            return (
              <CollapsibleCategory
                key={category}
                category={category}
                rows={categoryRows}
                columns={columns}
                isOpen={isOpen}
                onToggle={() => toggleCategory(category)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CollapsibleCategory({
  category,
  rows,
  columns,
  isOpen,
  onToggle,
}: {
  category: string;
  rows: ComparisonRow[];
  columns: ComparisonColumn[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer select-none transition-colors hover:bg-slate-100/60"
        onClick={onToggle}
      >
        <td
          colSpan={columns.length + 1}
          className="bg-slate-100/80 py-3 pl-4 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:pl-0"
        >
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span>{category}</span>
            <span className="text-[10px] font-normal normal-case text-slate-400">
              {rows.length} {rows.length === 1 ? "feature" : "features"}
            </span>
          </div>
        </td>
      </tr>
      {isOpen &&
        rows.map((row) => (
          <tr
            key={row.feature}
            className="border-b border-slate-100 last:border-b-0 animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            <td className="sticky left-0 z-10 bg-white py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">
              {row.feature}
            </td>
            {columns.map((col) => (
              <td key={col.id} className="px-4 py-3 text-center">
                <CellValue value={row.values[col.id] ?? false} />
              </td>
            ))}
          </tr>
        ))}
    </>
  );
}
