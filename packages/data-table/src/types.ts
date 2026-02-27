import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type ColumnDef<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  getValue?: (row: T) => unknown;
  sortable?: boolean;
  defaultVisible?: boolean;
  hideable?: boolean;
  minWidth?: string;
  sticky?: boolean;
};

export type RowAction<T> = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
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

export type BulkAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (selectedKeys: string[]) => void;
  variant?: "default" | "destructive" | "outline";
};

export type MobileRowContract<T> = {
  title: (row: T) => string;
  subtitle?: (row: T) => string;
  meta?: (row: T) => { label: string; value: string }[];
};

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  totalCount?: number;
  rowKey: (row: T) => string;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSortChange?: (column: string, direction: SortDirection) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  serverSearch?: boolean;
  rowActions?: RowAction<T>[];
  getRowActions?: (row: T) => RowAction<T>[];
  onRowClick?: (row: T) => void;
  bulkSelectable?: boolean;
  onBulkSelectionChange?: (selectedKeys: string[]) => void;
  bulkActions?: BulkAction[];
  storageKey?: string;
  loading?: boolean;
  emptyMessage?: string;
  headerContent?: ReactNode;
  toolbarEndContent?: ReactNode;
  density?: "compact" | "comfortable";
  className?: string;
  getRowClassName?: (row: T) => string;
  mobileRow?: MobileRowContract<T>;
};
