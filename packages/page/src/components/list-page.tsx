"use client";

import type { ReactNode } from "react";
import { cn, Button, Skeleton } from "@teqbook/ui";
import { PageHeader } from "@teqbook/layout";
import { DataTable, type DataTableProps } from "@teqbook/data-table";
import { ErrorMessage, EmptyState } from "@teqbook/feedback";
import { StatsBar } from "./stats-bar";
import { FilterChips } from "./filter-chips";
import { renderActions } from "./action-renderer";
import type { PageAction, PageState, StatItem, ChipDef } from "../types";

type ListPageProps<T> = {
  title: string;
  description?: string;
  actions?: PageAction[];
  stats?: StatItem[];
  filterChips?: ChipDef[];
  activeFilters?: string[];
  onFiltersChange?: (filters: string[]) => void;
  banner?: ReactNode;
  tableProps?: DataTableProps<T>;
  children?: ReactNode;
  state: PageState;
  className?: string;
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListPage<T>({
  title,
  description,
  actions,
  stats,
  filterChips,
  activeFilters,
  onFiltersChange,
  banner,
  tableProps,
  children,
  state,
  className,
}: ListPageProps<T>) {
  const renderedActions = renderActions(actions);

  return (
    <div className={cn("space-y-0", className)}>
      <PageHeader
        title={title}
        description={description}
        actions={renderedActions}
      />

      <div className="mt-6 space-y-4">
        {state.status === "error" && (
          <ErrorMessage
            message={state.message}
            onDismiss={state.retry}
            variant="destructive"
          />
        )}

        {banner}

        {state.status === "ready" && stats && stats.length > 0 && (
          <StatsBar items={stats} />
        )}

        {state.status === "ready" && filterChips && activeFilters && onFiltersChange && (
          <FilterChips
            chips={filterChips}
            value={activeFilters}
            onChange={onFiltersChange}
          />
        )}

        {state.status === "loading" ? (
          <LoadingSkeleton />
        ) : state.status === "empty" ? (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <EmptyState
              title={state.title}
              description={state.description}
              primaryAction={state.action}
              quickStartItems={state.quickStart}
            />
          </div>
        ) : state.status === "ready" ? (
          children ? (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              {children}
            </div>
          ) : tableProps ? (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <DataTable {...tableProps} />
            </div>
          ) : null
        ) : null}
      </div>
    </div>
  );
}
