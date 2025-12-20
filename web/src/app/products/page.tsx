"use client";

import { useEffect, useState, FormEvent } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
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
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getProductsForSalon,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products-service";
import type { Product } from "@/lib/repositories/products";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const { locale } = useLocale();
  const appLocale = locale === "nb" ? "nb" : "en";
  const t = translations[appLocale].products || {
    title: "Products",
    description: "Manage your inventory and products",
    noProducts: "No products yet",
    createFirst: "Create your first product",
    name: "Name",
    price: "Price",
    stock: "Stock",
    sku: "SKU",
    status: "Status",
    actions: "Actions",
    create: "Create Product",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    active: "Active",
    inactive: "Inactive",
    namePlaceholder: "Product name",
    pricePlaceholder: "0.00",
    stockPlaceholder: "0",
    skuPlaceholder: "SKU-001",
  };

  const { salon, isReady } = useCurrentSalon();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError("No salon found");
        setLoading(false);
        return;
      }

      const { data: productsData, error: productsError } = await getProductsForSalon(salon.id);

      if (productsError) {
        setError(productsError);
      } else {
        setProducts(productsData || []);
      }

      setLoading(false);
    }

    loadProducts();
  }, [salon?.id, isReady]);

  function openCreateModal() {
    setEditingProduct(null);
    setName("");
    setPrice(0);
    setStock(0);
    setSku("");
    setIsActive(true);
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price_cents / 100); // Convert cents to currency
    setStock(product.stock);
    setSku(product.sku || "");
    setIsActive(product.is_active);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!salon?.id) return;

    setSaving(true);
    setError(null);

    try {
      const priceCents = Math.round(price * 100);

      if (editingProduct) {
        // Update existing product
        const { data, error: updateError } = await updateProduct(salon.id, editingProduct.id, {
          name,
          price_cents: priceCents,
          stock,
          sku: sku || null,
          is_active: isActive,
        });

        if (updateError) {
          setError(updateError);
          setSaving(false);
          return;
        }

        if (data) {
          setProducts(products.map((p) => (p.id === data.id ? data : p)));
          closeModal();
        }
      } else {
        // Create new product
        const { data, error: createError } = await createProduct({
          salon_id: salon.id,
          name,
          price_cents: priceCents,
          stock,
          sku: sku || null,
          is_active: isActive,
        });

        if (createError) {
          setError(createError);
          setSaving(false);
          return;
        }

        if (data) {
          setProducts([data, ...products]);
          closeModal();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!salon?.id) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(productId);
    setError(null);

    try {
      const { error: deleteError } = await deleteProduct(salon.id, productId);

      if (deleteError) {
        setError(deleteError);
      } else {
        setProducts(products.filter((p) => p.id !== productId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  }

  if (!isReady) {
    return (
      <DashboardShell>
        <PageHeader title={t.title} description={t.description} />
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-64 w-full animate-pulse rounded bg-muted" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title={t.title} description={t.description} />

      {error && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <TableToolbar>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.create}
        </Button>
      </TableToolbar>

      {loading ? (
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-64 w-full animate-pulse rounded bg-muted" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title={t.noProducts}
          description={t.createFirst}
          action={
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="h-4 w-4" />
              {t.create}
            </Button>
          }
        />
      ) : (
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
                        onClick={() => openEditModal(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editingProduct ? t.edit : t.create}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {t.name}
                </label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  {t.price} (NOK)
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  placeholder={t.pricePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  {t.stock}
                </label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                  placeholder={t.stockPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sku" className="text-sm font-medium">
                  {t.sku} (Optional)
                </label>
                <Input
                  id="sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder={t.skuPlaceholder}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  {t.active}
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : t.save}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}

