"use client";

import { useState } from "react";
import { ListPage, type PageState } from "@teqbook/page";
import { ErrorBoundary } from "@teqbook/feedback";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { FeatureGate } from "@/components/feature-gate";
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
  const [searchQuery, setSearchQuery] = useState("");

  const { saving, deletingId, handleSubmit, handleDelete } = useProductActions(
    products, setProducts, setError,
    () => { setShowModal(false); setEditingProduct(null); }
  );

  function openCreateModal() { setEditingProduct(null); setShowModal(true); }
  function openEditModal(product: Product) { setEditingProduct(product); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingProduct(null); }

  const pageState: PageState = !isReady || loading
    ? { status: "loading" }
    : error
      ? { status: "error", message: error, retry: () => setError(null) }
      : products.length === 0
        ? {
            status: "empty",
            title: t.noProducts,
            description: t.createFirst,
            action: (
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                {t.create}
              </Button>
            ),
          }
        : { status: "ready" };

  return (
    <FeatureGate feature="INVENTORY">
      <ErrorBoundary>
        <DashboardShell>
        <ListPage
          title={t.title}
          description={t.description}
          actions={[
            {
              label: t.create,
              icon: Plus,
              onClick: openCreateModal,
              priority: "primary",
            },
          ]}
          state={pageState}
        >
          <ProductsTable
            products={products}
            onEdit={openEditModal}
            onDelete={handleDelete}
            deletingId={deletingId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            translations={t}
          />
        </ListPage>

        <ProductFormDialog
          isOpen={showModal}
          editingProduct={editingProduct}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
          translations={t}
        />
        </DashboardShell>
      </ErrorBoundary>
    </FeatureGate>
  );
}
