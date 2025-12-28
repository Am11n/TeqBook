"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import type { Product } from "@/lib/repositories/products";
import { formatCurrency } from "@/lib/utils/products/products-utils";

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
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.name}</TableHead>
            <TableHead>{t.price}</TableHead>
            <TableHead>{t.stock}</TableHead>
            <TableHead>{t.sku}</TableHead>
            <TableHead>{t.status}</TableHead>
            <TableHead className="text-right">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{formatCurrency(product.price_cents)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    product.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {product.is_active ? t.active : t.inactive}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

