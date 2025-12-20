// =====================================================
// Products Repository
// =====================================================
// Centralized data access layer for products/inventory
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

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

/**
 * Get all products for a salon with pagination
 */
export async function getProductsForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number; activeOnly?: boolean }
): Promise<{ data: Product[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (options?.activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Product[], error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get product by ID
 */
export async function getProductById(
  salonId: string,
  productId: string
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Product not found" };
    }

    return { data: data as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a new product
 */
export async function createProduct(
  input: CreateProductInput
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert({
        salon_id: input.salon_id,
        name: input.name,
        price_cents: input.price_cents,
        stock: input.stock ?? 0,
        sku: input.sku || null,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update a product
 */
export async function updateProduct(
  salonId: string,
  productId: string,
  updates: UpdateProductInput
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .eq("salon_id", salonId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Product not found" };
    }

    return { data: data as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(
  salonId: string,
  productId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("salon_id", salonId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get products for a booking
 */
export type BookingProduct = {
  id: string;
  booking_id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  product: Product;
};

export async function getProductsForBooking(
  bookingId: string
): Promise<{ data: BookingProduct[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("booking_products")
      .select(
        `
        id,
        booking_id,
        product_id,
        quantity,
        price_cents,
        products (*)
      `
      )
      .eq("booking_id", bookingId);

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: (data || []).map((row: any) => ({
        id: row.id,
        booking_id: row.booking_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price_cents: row.price_cents,
        product: (Array.isArray(row.products) ? row.products[0] : row.products) as Product,
      })) as BookingProduct[],
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Add product to booking
 */
export async function addProductToBooking(
  bookingId: string,
  productId: string,
  quantity: number,
  priceCents: number
): Promise<{ data: BookingProduct | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("booking_products")
      .insert({
        booking_id: bookingId,
        product_id: productId,
        quantity,
        price_cents: priceCents,
      })
      .select(
        `
        id,
        booking_id,
        product_id,
        quantity,
        price_cents,
        products (*)
      `
      )
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: {
        id: data.id,
        booking_id: data.booking_id,
        product_id: data.product_id,
        quantity: data.quantity,
        price_cents: data.price_cents,
        product: (Array.isArray(data.products) ? data.products[0] : data.products) as Product,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update product quantity in booking
 */
export async function updateBookingProduct(
  bookingProductId: string,
  quantity: number
): Promise<{ data: BookingProduct | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("booking_products")
      .update({ quantity })
      .eq("id", bookingProductId)
      .select(
        `
        id,
        booking_id,
        product_id,
        quantity,
        price_cents,
        products (*)
      `
      )
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: {
        id: data.id,
        booking_id: data.booking_id,
        product_id: data.product_id,
        quantity: data.quantity,
        price_cents: data.price_cents,
        product: (Array.isArray(data.products) ? data.products[0] : data.products) as Product,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Remove product from booking
 */
export async function removeProductFromBooking(
  bookingProductId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("booking_products")
      .delete()
      .eq("id", bookingProductId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

