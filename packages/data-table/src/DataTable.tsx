"use client";

import {
  cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Checkbox, Button,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@teqbook/ui";
import { ArrowUp, ArrowDown, MoreVertical } from "lucide-react";
import type { DataTableProps, MobileRowContract } from "./types";
import { useDataTable } from "./use-data-table";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

function MobileCardView<T>({
  data, rowKey, mobileRow, onRowClick,
}: {
  data: T[];
  rowKey: (row: T) => string;
  mobileRow: MobileRowContract<T>;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {data.map((row) => {
        const key = rowKey(row);
        const meta = mobileRow.meta?.(row);
        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border bg-card p-3 text-sm",
              onRowClick && "cursor-pointer hover:bg-accent/50 transition-colors",
            )}
            onClick={() => onRowClick?.(row)}
          >
            <p className="font-medium text-foreground">{mobileRow.title(row)}</p>
            {mobileRow.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{mobileRow.subtitle(row)}</p>
            )}
            {meta && meta.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {meta.map((m) => (
                  <span key={m.label} className="text-xs text-muted-foreground">
                    <span className="font-medium">{m.label}:</span> {m.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DataTable<T>({
  columns, data, totalCount, rowKey,
  page = 0, pageSize = 10, onPageChange,
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSortChange, searchQuery = "", onSearchChange,
  searchPlaceholder, serverSearch = false, rowActions, getRowActions, onRowClick,
  bulkSelectable = false, onBulkSelectionChange, bulkActions,
  storageKey, loading = false, emptyMessage = "No data found",
  headerContent, toolbarEndContent, density = "comfortable", className,
  getRowClassName, mobileRow,
}: DataTableProps<T>) {
  const effectivePageSize = Math.min(pageSize, 10);
  const shouldUseServerSearch =
    serverSearch || Boolean(onPageChange && typeof totalCount === "number" && totalCount > data.length);

  const dt = useDataTable({
    columns, data, totalCount, rowKey, page, pageSize: effectivePageSize,
    controlledSortColumn, controlledSortDirection,
    onSortChange, searchQuery, onSearchChange,
    serverSearch: shouldUseServerSearch,
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

      {mobileRow && !loading && dt.pagedData.length > 0 && (
        <MobileCardView
          data={dt.pagedData}
          rowKey={rowKey}
          mobileRow={mobileRow}
          onRowClick={onRowClick}
        />
      )}

      <div className={cn("rounded-lg border overflow-hidden", mobileRow && "hidden md:block")}>
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
                Array.from({ length: Math.min(effectivePageSize, 5) }).map((_, i) => (
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
              ) : dt.pagedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={dt.visibleColumns.length + (bulkSelectable ? 1 : 0) + (hasRowActions ? 1 : 0)}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                dt.pagedData.map((row) => {
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
          pageSize={effectivePageSize}
          total={dt.total}
          totalPages={dt.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
