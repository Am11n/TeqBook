"use client";

import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ArrowUp, ArrowDown, MoreVertical } from "lucide-react";
import type { DataTableProps } from "./types";
import { useDataTable } from "./use-data-table";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

export function DataTable<T>({
  columns, data, totalCount, rowKey,
  page = 0, pageSize = 25, onPageChange,
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSortChange, searchQuery = "", onSearchChange,
  searchPlaceholder, rowActions, getRowActions, onRowClick,
  bulkSelectable = false, onBulkSelectionChange, bulkActions,
  storageKey, loading = false, emptyMessage = "No data found",
  headerContent, toolbarEndContent, density = "comfortable", className,
  getRowClassName,
}: DataTableProps<T>) {
  const dt = useDataTable({
    columns, data, totalCount, rowKey, pageSize,
    controlledSortColumn, controlledSortDirection,
    onSortChange, searchQuery, onSearchChange,
    onBulkSelectionChange, storageKey,
  });

  const hasRowActions = !!(rowActions && rowActions.length > 0) || !!getRowActions;

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        headerContent={headerContent}
        toolbarEndContent={toolbarEndContent}
        columns={columns}
        columnVisibility={dt.columnVisibility}
        setColumnVisibility={dt.setColumnVisibility}
        storageKey={storageKey}
        savedViews={dt.savedViews}
        newViewName={dt.newViewName}
        setNewViewName={dt.setNewViewName}
        onSaveView={dt.handleSaveView}
        onApplyView={dt.handleApplyView}
        onDeleteView={dt.handleDeleteView}
        bulkSelectable={bulkSelectable}
        selectedKeys={dt.selectedKeys}
        setSelectedKeys={dt.setSelectedKeys}
        bulkActions={bulkActions}
        onBulkSelectionChange={onBulkSelectionChange}
      />

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {bulkSelectable && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={dt.allSelected}
                      ref={(el) => {
                        if (el) (el as unknown as HTMLInputElement).indeterminate = dt.someSelected;
                      }}
                      onCheckedChange={dt.toggleAll}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}
                {dt.visibleColumns.map((col) => {
                  const isSortable = col.sortable !== false;
                  const isActiveSort = dt.sortColumn === col.id;
                  return (
                    <TableHead
                      key={col.id}
                      className={cn(
                        col.minWidth,
                        col.sticky && "sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]",
                        isSortable && "cursor-pointer select-none group/sort",
                      )}
                      onClick={isSortable ? () => dt.handleSort(col.id) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {isSortable && isActiveSort ? (
                          dt.sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-primary" />
                          )
                        ) : isSortable ? (
                          <ArrowUp className="h-3 w-3 text-muted-foreground/0 group-hover/sort:text-muted-foreground/40 transition-colors" />
                        ) : null}
                      </div>
                    </TableHead>
                  );
                })}
                {hasRowActions && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {bulkSelectable && (
                      <TableCell><div className="h-4 w-4 rounded bg-muted animate-pulse" /></TableCell>
                    )}
                    {dt.visibleColumns.map((col) => (
                      <TableCell key={col.id}><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
                    ))}
                    {hasRowActions && (
                      <TableCell><div className="h-4 w-4 rounded bg-muted animate-pulse" /></TableCell>
                    )}
                  </TableRow>
                ))
              ) : dt.sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={dt.visibleColumns.length + (bulkSelectable ? 1 : 0) + (hasRowActions ? 1 : 0)}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                dt.sortedData.map((row) => {
                  const key = rowKey(row);
                  const isSelected = dt.selectedKeys.has(key);
                  const actions = getRowActions ? getRowActions(row) : rowActions;
                  return (
                    <TableRow
                      key={key}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(
                        onRowClick && "cursor-pointer",
                        density === "compact" ? "h-9" : "h-12",
                        getRowClassName?.(row),
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {bulkSelectable && (
                        <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => dt.toggleRow(key)}
                            aria-label={`Select row ${key}`}
                          />
                        </TableCell>
                      )}
                      {dt.visibleColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          className={cn(
                            col.sticky && "sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]",
                          )}
                        >
                          {col.cell(row)}
                        </TableCell>
                      ))}
                      {actions && actions.length > 0 && (
                        <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Row actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action, i) => (
                                <span key={i}>
                                  {action.separator && i > 0 && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    onClick={() => action.onClick(row)}
                                    className={cn(
                                      action.variant === "destructive" && "text-destructive focus:text-destructive",
                                    )}
                                  >
                                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                                    {action.label}
                                  </DropdownMenuItem>
                                </span>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {onPageChange && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          total={dt.total}
          totalPages={dt.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
