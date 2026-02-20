export type Product = {
  id: string;
  salon_id: string;
  name: string;
  price_cents: number;
  stock: number;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateProductInput = {
  salon_id: string;
  name: string;
  price_cents: number;
  stock?: number;
  sku?: string | null;
  is_active?: boolean;
};

export type UpdateProductInput = {
  name?: string;
  price_cents?: number;
  stock?: number;
  sku?: string | null;
  is_active?: boolean;
};

export type BookingProduct = {
  id: string;
  booking_id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  product: Product;
};
