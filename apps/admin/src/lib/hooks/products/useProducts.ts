"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getProductsForSalon } from "@/lib/services/products-service";
import type { Product } from "@/lib/repositories/products";

export function useProducts() {
  const { salon, isReady } = useCurrentSalon();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!isReady || !salon?.id) {
      if (!isReady) return;
      setError("No salon found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: productsData, error: productsError } = await getProductsForSalon(salon.id);

    if (productsError) {
      setError(productsError);
    } else {
      setProducts(productsData || []);
    }

    setLoading(false);
  }, [salon?.id, isReady]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    setProducts,
    setError,
    loadProducts,
  };
}

