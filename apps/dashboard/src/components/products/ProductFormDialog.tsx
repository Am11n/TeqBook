"use client";

import { FormEvent, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form/Field";
import type { Product } from "@/lib/repositories/products";

interface ProductFormDialogProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSubmit: (
    e: FormEvent,
    editingProduct: Product | null,
    formData: {
      name: string;
      price: number;
      stock: number;
      sku: string;
      isActive: boolean;
    }
  ) => void;
  saving: boolean;
  translations: {
    create: string;
    edit: string;
    name: string;
    price: string;
    stock: string;
    sku: string;
    active: string;
    save: string;
    cancel: string;
    namePlaceholder: string;
    pricePlaceholder: string;
    stockPlaceholder: string;
    skuPlaceholder: string;
  };
}

export function ProductFormDialog({
  isOpen,
  editingProduct,
  onClose,
  onSubmit,
  saving,
  translations: t,
}: ProductFormDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setName(editingProduct.name);
        setPrice(editingProduct.price_cents / 100);
        setStock(editingProduct.stock);
        setSku(editingProduct.sku || "");
        setIsActive(editingProduct.is_active);
      } else {
        setName("");
        setPrice(0);
        setStock(0);
        setSku("");
        setIsActive(true);
      }
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  function handleSubmit(e: FormEvent) {
    onSubmit(e, editingProduct, {
      name,
      price,
      stock,
      sku,
      isActive,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingProduct ? t.edit : t.create}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label={t.name} htmlFor="name" required>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
            />
          </Field>

          <Field label={`${t.price} (NOK)`} htmlFor="price" required>
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
          </Field>

          <Field label={t.stock} htmlFor="stock" required>
            <Input
              id="stock"
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
              placeholder={t.stockPlaceholder}
            />
          </Field>

          <Field label={`${t.sku} (Optional)`} htmlFor="sku">
            <Input
              id="sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder={t.skuPlaceholder}
            />
          </Field>

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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t.cancel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

