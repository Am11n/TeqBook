"use client";

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import type { Product } from "@/lib/repositories/products";
import { formatCurrency } from "@/lib/utils/products/products-utils";
import { Edit, Trash2 } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  deletingId: string | null;
  translations: {
    name: string;
    price: string;
    stock: string;
    sku: string;
    status: string;
    actions: string;
    active: string;
    inactive: string;
  };
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  deletingId,
  translations: t,
}: ProductsTableProps) {
  const columns: ColumnDef<Product>[] = [
    {
      id: "name",
      header: t.name,
      cell: (product) => (
        <div className="font-medium">{product.name}</div>
      ),
      getValue: (product) => product.name,
    },
    {
      id: "price",
      header: t.price,
      cell: (product) => (
        <div className="text-xs text-muted-foreground">
          {formatCurrency(product.price_cents)}
        </div>
      ),
      getValue: (product) => product.price_cents,
    },
    {
      id: "stock",
      header: t.stock,
      cell: (product) => (
        <div className="text-xs text-muted-foreground">{product.stock}</div>
      ),
      getValue: (product) => product.stock,
    },
    {
      id: "sku",
      header: t.sku,
      cell: (product) => (
        <div className="text-xs text-muted-foreground">{product.sku || "-"}</div>
      ),
      getValue: (product) => product.sku ?? "",
    },
    {
      id: "status",
      header: t.status,
      cell: (product) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            product.is_active
              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {product.is_active ? t.active : t.inactive}
        </span>
      ),
      getValue: (product) => (product.is_active ? 1 : 0),
    },
  ];

  const getRowActions = (product: Product): RowAction<Product>[] => [
    {
      label: "Edit",
      icon: Edit,
      onClick: (p) => onEdit(p),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (p) => onDelete(p.id),
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      rowKey={(p) => p.id}
      getRowActions={getRowActions}
      storageKey="dashboard-products"
      emptyMessage="No products available"
    />
  );
}
