"use client";

import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/repositories/products";

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: { productId: string; quantity: number }[];
  setSelectedProducts: (products: { productId: string; quantity: number }[]) => void;
  fmtPrice: (cents: number) => string;
}

export function ProductSelector({
  products,
  selectedProducts,
  setSelectedProducts,
  fmtPrice,
}: ProductSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Products (Optional)</label>
      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
        {products.map((product) => {
          const selected = selectedProducts.find((sp) => sp.productId === product.id);
          const quantity = selected?.quantity || 0;
          return (
            <div key={product.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex-1">
                <span className="font-medium">{product.name}</span>
                <span className="ml-2 text-muted-foreground">({fmtPrice(product.price_cents)})</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (quantity > 0) {
                      setSelectedProducts(
                        selectedProducts
                          .map((sp) => sp.productId === product.id ? { ...sp, quantity: quantity - 1 } : sp)
                          .filter((sp) => sp.quantity > 0)
                      );
                    }
                  }}
                  disabled={quantity === 0}
                  className="h-7 w-7 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (quantity === 0) {
                      setSelectedProducts([...selectedProducts, { productId: product.id, quantity: 1 }]);
                    } else {
                      setSelectedProducts(
                        selectedProducts.map((sp) => sp.productId === product.id ? { ...sp, quantity: quantity + 1 } : sp)
                      );
                    }
                  }}
                  className="h-7 w-7 p-0"
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {selectedProducts.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Total:{" "}
          {fmtPrice(selectedProducts.reduce((sum, sp) => {
            const product = products.find((p) => p.id === sp.productId);
            return sum + (product ? product.price_cents * sp.quantity : 0);
          }, 0))}
        </p>
      )}
    </div>
  );
}
