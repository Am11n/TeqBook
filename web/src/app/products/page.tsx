"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import { Plus } from "lucide-react";
import { useProducts } from "@/lib/hooks/products/useProducts";
import { useProductActions } from "@/lib/hooks/products/useProductActions";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import type { Product } from "@/lib/repositories/products";

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

  const { isReady } = useCurrentSalon();
  const { products, loading, error, setProducts, setError } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { saving, deletingId, handleSubmit, handleDelete } = useProductActions(
    products,
    setProducts,
    setError,
    () => {
      setShowModal(false);
      setEditingProduct(null);
    }
  );

  function openCreateModal() {
    setEditingProduct(null);
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
  }

  if (!isReady) {
    return (
      <PageLayout
        title={t.title}
        description={t.description}
        showCard={false}
      >
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-64 w-full animate-pulse rounded bg-muted" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t.title}
      description={t.description}
      actions={
        <Button onClick={openCreateModal} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t.create}
        </Button>
      }
      showCard={false}
    >
      {error && (
        <Card className="p-4 border-destructive bg-destructive/10 mb-4">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

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
        <ProductsTable
          products={products}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
          translations={t}
        />
      )}

      <ProductFormDialog
        isOpen={showModal}
        editingProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmit}
        saving={saving}
        translations={t}
      />
    </PageLayout>
  );
}

