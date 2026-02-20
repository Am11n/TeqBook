import { supabase } from "@/lib/supabase-client";
import type { Product, CreateProductInput, UpdateProductInput } from "./types";

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
      .select("id, salon_id, name, price_cents, stock, sku, is_active, created_at, updated_at", { count: "exact" })
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (options?.activeOnly) query = query.eq("is_active", true);
    const { data, error, count } = await query;
    if (error) return { data: null, error: error.message };
    return { data: data as Product[], error: null, total: count ?? undefined };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getProductById(
  salonId: string,
  productId: string
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, salon_id, name, price_cents, stock, sku, is_active, created_at, updated_at")
      .eq("id", productId)
      .eq("salon_id", salonId)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: "Product not found" };
    return { data: data as Product, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createProduct(
  input: CreateProductInput
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert({
        salon_id: input.salon_id, name: input.name, price_cents: input.price_cents,
        stock: input.stock ?? 0, sku: input.sku || null, is_active: input.is_active ?? true,
      })
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Product, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

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
    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: "Product not found" };
    return { data: data as Product, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteProduct(
  salonId: string,
  productId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("products").delete().eq("id", productId).eq("salon_id", salonId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
