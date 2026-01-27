"use client";

import { useState, FormEvent } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products-service";
import type { Product } from "@/lib/repositories/products";

export function useProductActions(
  products: Product[],
  setProducts: (products: Product[] | ((prev: Product[]) => Product[])) => void,
  setError: (error: string | null) => void,
  onSuccess?: () => void
) {
  const { salon } = useCurrentSalon();
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (
    e: FormEvent,
    editingProduct: Product | null,
    formData: {
      name: string;
      price: number;
      stock: number;
      sku: string;
      isActive: boolean;
    }
  ) => {
    e.preventDefault();

    if (!salon?.id) return;

    setSaving(true);
    setError(null);

    try {
      const priceCents = Math.round(formData.price * 100);

      if (editingProduct) {
        // Update existing product
        const { data, error: updateError } = await updateProduct(
          salon.id,
          editingProduct.id,
          {
            name: formData.name,
            price_cents: priceCents,
            stock: formData.stock,
            sku: formData.sku || null,
            is_active: formData.isActive,
          }
        );

        if (updateError) {
          setError(updateError);
          setSaving(false);
          return;
        }

        if (data) {
          setProducts(products.map((p) => (p.id === data.id ? data : p)));
          onSuccess?.();
        }
      } else {
        // Create new product
        const { data, error: createError } = await createProduct({
          salon_id: salon.id,
          name: formData.name,
          price_cents: priceCents,
          stock: formData.stock,
          sku: formData.sku || null,
          is_active: formData.isActive,
        });

        if (createError) {
          setError(createError);
          setSaving(false);
          return;
        }

        if (data) {
          setProducts([data, ...products]);
          onSuccess?.();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
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
  };

  return {
    saving,
    deletingId,
    handleSubmit,
    handleDelete,
  };
}

