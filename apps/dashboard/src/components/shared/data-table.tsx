"use client";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Search,
  Columns3,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortDirection = "asc" | "desc";

export type ColumnDef<T> = {
  /** Unique key matching a property on T (or a computed key) */
  id: string;
  /** Column header label */
  header: string;
  /** Render function for cell content */
  cell: (row: T) => ReactNode;
  /** Extract a sortable value from the row. If not provided, uses row[id]. */
  getValue?: (row: T) => unknown;
  /** Whether this column is sortable (default: true) */
  sortable?: boolean;
  /** Whether this column is visible by default (default: true) */
  defaultVisible?: boolean;
  /** Whether this column can be hidden (default: true) */
  hideable?: boolean;
  /** Min width CSS class */
  minWidth?: string;
  /** Whether to make this column sticky (first column) */
  sticky?: boolean;
};

export type RowAction<T> = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  /** Variant for visual differentiation */
  variant?: "default" | "destructive";
  /** Whether to show a separator before this action */
  separator?: boolean;
};

export type SavedView = {
  id: string;
  name: string;
  visibleColumns: string[];
  sortColumn?: string;
  sortDirection?: SortDirection;
  searchQuery?: string;
};

type DataTableProps<T> = {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Data rows */
  data: T[];
  /** Total count for pagination (if different from data.length, e.g., server-side) */
  totalCount?: number;
  /** Unique key extractor per row */
  rowKey: (row: T) => string;
  /** Current page (0-based) */
  page?: number;
  /** Page size */
  pageSize?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Current sort column */
  sortColumn?: string;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Callback when sort changes */
  onSortChange?: (column: string, direction: SortDirection) => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Row actions (dropdown menu per row) */
  rowActions?: RowAction<T>[];
  /** Dynamic row actions (computed per row) */
  getRowActions?: (row: T) => RowAction<T>[];
  /** Callback when row is clicked */
  onRowClick?: (row: T) => void;
  /** Whether to show bulk selection checkboxes */
  bulkSelectable?: boolean;
  /** Callback when bulk selection changes */
  onBulkSelectionChange?: (selectedKeys: string[]) => void;
  /** Bulk action buttons (shown when items are selected) */
  bulkActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedKeys: string[]) => void;
    variant?: "default" | "destructive" | "outline";
  }>;
  /** Storage key for persisting column visibility & saved views */
  storageKey?: string;
  /** Whether data is loading */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional header content (filters etc.) – rendered left of the toolbar */
  headerContent?: ReactNode;
  /** Content rendered on the right side of the toolbar, next to Views/Columns buttons */
  toolbarEndContent?: ReactNode;
  /** Table density: compact = smaller rows, comfortable = default */
  density?: "compact" | "comfortable";
  /** Additional CSS classes */
  className?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadSavedViews(storageKey: string): SavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`dt-views-${storageKey}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSavedViews(storageKey: string, views: SavedView[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`dt-views-${storageKey}`, JSON.stringify(views));
  } catch {
    // Ignore storage errors
  }
}

function loadColumnVisibility(
  storageKey: string,
  columns: ColumnDef<unknown>[]
): Record<string, boolean> {
  if (typeof window === "undefined") {
    return Object.fromEntries(
      columns.map((col) => [col.id, col.defaultVisible !== false])
    );
  }
  try {
    const stored = localStorage.getItem(`dt-cols-${storageKey}`);
    if (stored) return JSON.parse(stored);
  } catch {
    // Fall through to defaults
  }
  return Object.fromEntries(
    columns.map((col) => [col.id, col.defaultVisible !== false])
  );
}

function saveColumnVisibility(
  storageKey: string,
  visibility: Record<string, boolean>
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`dt-cols-${storageKey}`, JSON.stringify(visibility));
  } catch {
    // Ignore
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<T>({
  columns,
  data,
  totalCount,
  rowKey,
  page = 0,
  pageSize = 25,
  onPageChange,
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSortChange,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  rowActions,
  getRowActions,
  onRowClick,
  bulkSelectable = false,
  onBulkSelectionChange,
  bulkActions,
  storageKey,
  loading = false,
  emptyMessage = "No data found",
  headerContent,
  density = "comfortable",
  toolbarEndContent,
  className,
}: DataTableProps<T>) {
  // Internal sort state (used when no onSortChange is provided – client-side sorting)
  const [internalSortColumn, setInternalSortColumn] = useState<string | undefined>(undefined);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>("asc");

  // Use controlled values when provided, otherwise use internal state
  const sortColumn = controlledSortColumn ?? internalSortColumn;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() =>
    storageKey
      ? loadColumnVisibility(storageKey, columns as ColumnDef<unknown>[])
      : Object.fromEntries(
          columns.map((col) => [col.id, col.defaultVisible !== false])
        )
  );

  // Bulk selection
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Saved views
  const [savedViews, setSavedViews] = useState<SavedView[]>(() =>
    storageKey ? loadSavedViews(storageKey) : []
  );
  const [newViewName, setNewViewName] = useState("");

  // Persist column visibility
  useEffect(() => {
    if (storageKey) {
      saveColumnVisibility(storageKey, columnVisibility);
    }
  }, [storageKey, columnVisibility]);

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => columnVisibility[col.id] !== false),
    [columns, columnVisibility]
  );

  // Pagination
  const total = totalCount ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Bulk selection handlers
  const allKeys = useMemo(
    () => new Set(data.map((row) => rowKey(row))),
    [data, rowKey]
  );

  const allSelected =
    allKeys.size > 0 && [...allKeys].every((k) => selectedKeys.has(k));
  const someSelected =
    selectedKeys.size > 0 && !allSelected;

  const toggleAll = useCallback(() => {
    const next = allSelected ? new Set<string>() : new Set(allKeys);
    setSelectedKeys(next);
    onBulkSelectionChange?.([...next]);
  }, [allSelected, allKeys, onBulkSelectionChange]);

  const toggleRow = useCallback(
    (key: string) => {
      const next = new Set(selectedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      setSelectedKeys(next);
      onBulkSelectionChange?.([...next]);
    },
    [selectedKeys, onBulkSelectionChange]
  );

  // Sort handler – works in both controlled (server-side) and uncontrolled (client-side) modes
  const handleSort = useCallback(
    (colId: string) => {
      const nextDir =
        sortColumn === colId
          ? sortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc";

      if (onSortChange) {
        // Controlled mode – let parent handle it
        onSortChange(colId, nextDir);
      }
      // Always update internal state so the arrow indicator shows
      setInternalSortColumn(colId);
      setInternalSortDirection(nextDir);
    },
    [sortColumn, sortDirection, onSortChange]
  );

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    const col = columns.find((c) => c.id === sortColumn);
    return [...data].sort((a, b) => {
      const aVal = col?.getValue ? col.getValue(a) : (a as Record<string, unknown>)[sortColumn];
      const bVal = col?.getValue ? col.getValue(b) : (b as Record<string, unknown>)[sortColumn];
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (aVal instanceof Date && bVal instanceof Date) {
        cmp = aVal.getTime() - bVal.getTime();
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        cmp = aVal === bVal ? 0 : aVal ? -1 : 1;
      } else {
        const aStr = String(aVal);
        const bStr = String(bVal);
        const aDate = Date.parse(aStr);
        const bDate = Date.parse(bStr);
        if (!isNaN(aDate) && !isNaN(bDate) && aStr.length > 8) {
          cmp = aDate - bDate;
        } else {
          cmp = aStr.localeCompare(bStr, undefined, { sensitivity: "base", numeric: true });
        }
      }
      return sortDirection === "desc" ? -cmp : cmp;
    });
  }, [data, sortColumn, sortDirection, columns]);

  // Save current view
  const handleSaveView = useCallback(() => {
    if (!storageKey || !newViewName.trim()) return;
    // Capture ALL columns — visible if columnVisibility[id] is not explicitly false
    const view: SavedView = {
      id: crypto.randomUUID(),
      name: newViewName.trim(),
      visibleColumns: columns
        .filter((col) => columnVisibility[col.id] !== false)
        .map((col) => col.id),
      sortColumn,
      sortDirection,
      searchQuery,
    };
    const updated = [...savedViews, view];
    setSavedViews(updated);
    saveSavedViews(storageKey, updated);
    setNewViewName("");
  }, [
    storageKey,
    newViewName,
    columns,
    columnVisibility,
    sortColumn,
    sortDirection,
    searchQuery,
    savedViews,
  ]);

  // Apply saved view
  const handleApplyView = useCallback(
    (view: SavedView) => {
      // Set visibility for every known column
      const vis: Record<string, boolean> = {};
      columns.forEach((col) => {
        vis[col.id] = view.visibleColumns.includes(col.id);
      });
      setColumnVisibility(vis);

      // Restore sort (internal state + external callback)
      if (view.sortColumn) {
        setInternalSortColumn(view.sortColumn);
        setInternalSortDirection(view.sortDirection ?? "asc");
        if (onSortChange) {
          onSortChange(view.sortColumn, view.sortDirection ?? "asc");
        }
      } else {
        setInternalSortColumn(undefined);
        setInternalSortDirection("asc");
      }

      if (view.searchQuery !== undefined && onSearchChange) {
        onSearchChange(view.searchQuery);
      }
    },
    [columns, onSortChange, onSearchChange]
  );

  // Delete saved view
  const handleDeleteView = useCallback(
    (viewId: string) => {
      const updated = savedViews.filter((v) => v.id !== viewId);
      setSavedViews(updated);
      if (storageKey) saveSavedViews(storageKey, updated);
    },
    [savedViews, storageKey]
  );

  // Determine if we have row actions
  const hasRowActions = !!(rowActions && rowActions.length > 0) || !!getRowActions;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        {onSearchChange && (
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 h-9"
            />
          </div>
        )}

        {/* Header content (filters) */}
        {headerContent}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Toolbar end content (filters etc.) */}
          {toolbarEndContent}

          {/* Saved Views */}
          {storageKey && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Saved Views
                  </p>
                  {savedViews.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No saved views yet
                    </p>
                  )}
                  {savedViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between gap-2 -mx-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleApplyView(view)}
                    >
                      <span className="text-sm truncate text-left">
                        {view.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view.id);
                        }}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex gap-1.5">
                      <Input
                        value={newViewName}
                        onChange={(e) => setNewViewName(e.target.value)}
                        placeholder="View name..."
                        className="h-7 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveView();
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={handleSaveView}
                        disabled={!newViewName.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Column Visibility */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Columns3 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Toggle Columns
                </p>
                {columns
                  .filter((col) => col.hideable !== false)
                  .map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={columnVisibility[col.id] !== false}
                        onCheckedChange={(checked) => {
                          setColumnVisibility((prev) => ({
                            ...prev,
                            [col.id]: !!checked,
                          }));
                        }}
                      />
                      {col.header}
                    </label>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Bulk action bar */}
      {bulkSelectable && selectedKeys.size > 0 && bulkActions && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">
            {selectedKeys.size} selected
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            {bulkActions.map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={i}
                  variant={action.variant ?? "outline"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => action.onClick([...selectedKeys])}
                >
                  {ActionIcon && <ActionIcon className="h-3 w-3" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs ml-auto"
            onClick={() => {
              setSelectedKeys(new Set());
              onBulkSelectionChange?.([]);
            }}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Bulk select all */}
                {bulkSelectable && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      ref={(el) => {
                        if (el) {
                          (el as unknown as HTMLInputElement).indeterminate = someSelected;
                        }
                      }}
                      onCheckedChange={toggleAll}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}

                {visibleColumns.map((col) => {
                  const isSortable = col.sortable !== false;
                  const isActiveSort = sortColumn === col.id;
                  return (
                    <TableHead
                      key={col.id}
                      className={cn(
                        col.minWidth,
                        col.sticky &&
                          "sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]",
                        isSortable && "cursor-pointer select-none group/sort"
                      )}
                      onClick={
                        isSortable ? () => handleSort(col.id) : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {isSortable && isActiveSort ? (
                          sortDirection === "asc" ? (
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

                {/* Row actions column */}
                {hasRowActions && (
                  <TableHead className="w-10" />
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {bulkSelectable && (
                      <TableCell>
                        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
                      <TableCell key={col.id}>
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      </TableCell>
                    ))}
                    {hasRowActions && (
                      <TableCell>
                        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      visibleColumns.length +
                      (bulkSelectable ? 1 : 0) +
                      (hasRowActions ? 1 : 0)
                    }
                    className="text-center py-12 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => {
                  const key = rowKey(row);
                  const isSelected = selectedKeys.has(key);
                  const actions = getRowActions ? getRowActions(row) : rowActions;
                  return (
                    <TableRow
                      key={key}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(
                        onRowClick && "cursor-pointer",
                        density === "compact" ? "h-9" : "h-12",
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {bulkSelectable && (
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                          className="w-10"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(key)}
                            aria-label={`Select row ${key}`}
                          />
                        </TableCell>
                      )}

                      {visibleColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          className={cn(
                            col.sticky &&
                              "sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                          )}
                        >
                          {col.cell(row)}
                        </TableCell>
                      ))}

                      {actions && actions.length > 0 && (
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                          className="w-10"
                        >
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
                                  {action.separator && i > 0 && (
                                    <DropdownMenuSeparator />
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => action.onClick(row)}
                                    className={cn(
                                      action.variant === "destructive" &&
                                        "text-destructive focus:text-destructive"
                                    )}
                                  >
                                    {action.icon && (
                                      <action.icon className="h-4 w-4 mr-2" />
                                    )}
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

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of{" "}
            {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
