import { supabase } from "@/lib/supabase-client";
import type { Product, BookingProduct } from "./types";

const BOOKING_PRODUCT_SELECT = `
  id, booking_id, product_id, quantity, price_cents,
  products (id, salon_id, name, price_cents, stock, sku, is_active, created_at, updated_at)
`;

type BookingProductRow = {
  id: string;
  booking_id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  products: Product | Product[];
};

function mapBookingProductRow(row: BookingProductRow): BookingProduct {
  return {
    id: row.id,
    booking_id: row.booking_id,
    product_id: row.product_id,
    quantity: row.quantity,
    price_cents: row.price_cents,
    product: (Array.isArray(row.products) ? row.products[0] : row.products) as Product,
  };
}

export async function getProductsForBooking(
  bookingId: string
): Promise<{ data: BookingProduct[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("booking_products")
      .select(BOOKING_PRODUCT_SELECT)
      .eq("booking_id", bookingId);
    if (error) return { data: null, error: error.message };
    return { data: (data || []).map(mapBookingProductRow) as BookingProduct[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function addProductToBooking(
  bookingId: string,
  productId: string,
  quantity: number,
  priceCents: number
): Promise<{ data: BookingProduct | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("booking_products")
      .insert({ booking_id: bookingId, product_id: productId, quantity, price_cents: priceCents })
      .select(BOOKING_PRODUCT_SELECT)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: mapBookingProductRow(data), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateBookingProduct(
  bookingProductId: string,
  quantity: number
): Promise<{ data: BookingProduct | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("booking_products")
      .update({ quantity })
      .eq("id", bookingProductId)
      .select(BOOKING_PRODUCT_SELECT)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: mapBookingProductRow(data), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function removeProductFromBooking(
  bookingProductId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("booking_products").delete().eq("id", bookingProductId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
