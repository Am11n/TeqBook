import { useState, useCallback, useMemo, useEffect } from "react";
import type { ColumnDef, SavedView, SortDirection } from "./types";
import {
  loadSavedViews,
  saveSavedViews,
  loadColumnVisibility,
  saveColumnVisibility,
} from "./storage";

interface UseDataTableOptions<T> {
  columns: ColumnDef<T>[];
  data: T[];
  totalCount?: number;
  rowKey: (row: T) => string;
  page?: number;
  pageSize?: number;
  controlledSortColumn?: string;
  controlledSortDirection?: SortDirection;
  onSortChange?: (column: string, direction: SortDirection) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onBulkSelectionChange?: (keys: string[]) => void;
  storageKey?: string;
}

export function useDataTable<T>({
  columns,
  data,
  totalCount,
  rowKey,
  pageSize = 25,
  controlledSortColumn,
  controlledSortDirection,
  onSortChange,
  searchQuery = "",
  onSearchChange,
  onBulkSelectionChange,
  storageKey,
}: UseDataTableOptions<T>) {
  const [internalSortColumn, setInternalSortColumn] = useState<string | undefined>(undefined);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>("asc");
  const sortColumn = controlledSortColumn ?? internalSortColumn;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
    storageKey
      ? loadColumnVisibility(storageKey, columns as ColumnDef<unknown>[])
      : Object.fromEntries(columns.map((col) => [col.id, col.defaultVisible !== false])),
  );

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const [savedViews, setSavedViews] = useState<SavedView[]>(() =>
    storageKey ? loadSavedViews(storageKey) : [],
  );
  const [newViewName, setNewViewName] = useState("");

  useEffect(() => {
    if (storageKey) saveColumnVisibility(storageKey, columnVisibility);
  }, [storageKey, columnVisibility]);

  const visibleColumns = useMemo(
    () => columns.filter((col) => columnVisibility[col.id] !== false),
    [columns, columnVisibility],
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const rawValue = col.getValue
          ? col.getValue(row)
          : (row as Record<string, unknown>)[col.id];
        if (rawValue == null) return false;
        return String(rawValue).toLowerCase().includes(query);
      }),
    );
  }, [data, columns, searchQuery]);

  const hasLocalSearch = searchQuery.trim().length > 0;
  const total = hasLocalSearch ? filteredData.length : (totalCount ?? data.length);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const allKeys = useMemo(() => new Set(data.map((row) => rowKey(row))), [data, rowKey]);
  const allSelected = allKeys.size > 0 && [...allKeys].every((k) => selectedKeys.has(k));
  const someSelected = selectedKeys.size > 0 && !allSelected;

  const toggleAll = useCallback(() => {
    const next = allSelected ? new Set<string>() : new Set(allKeys);
    setSelectedKeys(next);
    onBulkSelectionChange?.([...next]);
  }, [allSelected, allKeys, onBulkSelectionChange]);

  const toggleRow = useCallback(
    (key: string) => {
      const next = new Set(selectedKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelectedKeys(next);
      onBulkSelectionChange?.([...next]);
    },
    [selectedKeys, onBulkSelectionChange],
  );

  const handleSort = useCallback(
    (colId: string) => {
      const nextDir = sortColumn === colId ? (sortDirection === "asc" ? "desc" : "asc") : "asc";
      if (onSortChange) onSortChange(colId, nextDir);
      setInternalSortColumn(colId);
      setInternalSortDirection(nextDir);
    },
    [sortColumn, sortDirection, onSortChange],
  );

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const col = columns.find((c) => c.id === sortColumn);
    return [...filteredData].sort((a, b) => {
      const aVal = col?.getValue ? col.getValue(a) : (a as Record<string, unknown>)[sortColumn];
      const bVal = col?.getValue ? col.getValue(b) : (b as Record<string, unknown>)[sortColumn];
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
  }, [filteredData, sortColumn, sortDirection, columns]);

  const handleSaveView = useCallback(() => {
    if (!storageKey || !newViewName.trim()) return;
    const view: SavedView = {
      id: crypto.randomUUID(),
      name: newViewName.trim(),
      visibleColumns: columns.filter((col) => columnVisibility[col.id] !== false).map((col) => col.id),
      sortColumn,
      sortDirection,
      searchQuery,
    };
    const updated = [...savedViews, view];
    setSavedViews(updated);
    saveSavedViews(storageKey, updated);
    setNewViewName("");
  }, [storageKey, newViewName, columns, columnVisibility, sortColumn, sortDirection, searchQuery, savedViews]);

  const handleApplyView = useCallback(
    (view: SavedView) => {
      const vis: Record<string, boolean> = {};
      columns.forEach((col) => {
        vis[col.id] = view.visibleColumns.includes(col.id);
      });
      setColumnVisibility(vis);
      if (view.sortColumn) {
        setInternalSortColumn(view.sortColumn);
        setInternalSortDirection(view.sortDirection ?? "asc");
        if (onSortChange) onSortChange(view.sortColumn, view.sortDirection ?? "asc");
      } else {
        setInternalSortColumn(undefined);
        setInternalSortDirection("asc");
      }
      if (view.searchQuery !== undefined && onSearchChange) onSearchChange(view.searchQuery);
    },
    [columns, onSortChange, onSearchChange],
  );

  const handleDeleteView = useCallback(
    (viewId: string) => {
      const updated = savedViews.filter((v) => v.id !== viewId);
      setSavedViews(updated);
      if (storageKey) saveSavedViews(storageKey, updated);
    },
    [savedViews, storageKey],
  );

  return {
    sortColumn, sortDirection, handleSort, sortedData,
    columnVisibility, setColumnVisibility, visibleColumns,
    selectedKeys, setSelectedKeys, allSelected, someSelected, toggleAll, toggleRow,
    savedViews, newViewName, setNewViewName, handleSaveView, handleApplyView, handleDeleteView,
    total, totalPages,
  };
}
