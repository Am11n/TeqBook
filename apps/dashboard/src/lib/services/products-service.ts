// =====================================================
// Products Service
// =====================================================
// Business logic layer for products/inventory
// Orchestrates repository calls and handles domain rules

import {
  getProductsForCurrentSalon,
  getProductById,
  createProduct as createProductRepo,
  updateProduct as updateProductRepo,
  deleteProduct as deleteProductRepo,
  type Product,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/lib/repositories/products";
import * as featureFlagsService from "@/lib/services/feature-flags-service";
import { logProductEvent } from "@/lib/services/audit-trail-service";

/**
 * Get products for current salon
 */
export async function getProductsForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number; activeOnly?: boolean }
): Promise<{ data: Product[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Check if INVENTORY feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "INVENTORY"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "INVENTORY feature is not available in your plan. Please upgrade to access inventory management.",
    };
  }

  // Call repository
  return await getProductsForCurrentSalon(salonId, options);
}

/**
 * Get product by ID
 */
export async function getProductByIdForSalon(
  salonId: string,
  productId: string
): Promise<{ data: Product | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  if (!productId) {
    return { data: null, error: "Product ID is required" };
  }

  // Call repository
  return await getProductById(salonId, productId);
}

/**
 * Create a new product with business logic
 */
export async function createProduct(
  input: CreateProductInput
): Promise<{ data: Product | null; error: string | null }> {
  // Validation
  if (!input.salon_id) {
    return { data: null, error: "Salon ID is required" };
  }

  // Check if INVENTORY feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    input.salon_id,
    "INVENTORY"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "INVENTORY feature is not available in your plan. Please upgrade to access inventory management.",
    };
  }

  if (!input.name || input.name.trim().length === 0) {
    return { data: null, error: "Product name is required" };
  }

  if (input.price_cents < 0) {
    return { data: null, error: "Price cannot be negative" };
  }

  // Call repository
  const result = await createProductRepo(input);

  // Log to audit trail on success
  if (!result.error && result.data) {
    logProductEvent("create", {
      salonId: input.salon_id,
      resourceId: result.data.id,
      productName: result.data.name,
      priceCents: result.data.price_cents,
      stockQuantity: result.data.stock ?? undefined,
      isActive: result.data.is_active,
    }).catch(() => {
      // Silent fail - don't block product creation if audit fails
    });
  }

  return result;
}

/**
 * Update a product with business logic
 */
export async function updateProduct(
  salonId: string,
  productId: string,
  updates: UpdateProductInput
): Promise<{ data: Product | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  if (!productId) {
    return { data: null, error: "Product ID is required" };
  }

  // Check if INVENTORY feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "INVENTORY"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "INVENTORY feature is not available in your plan. Please upgrade to access inventory management.",
    };
  }

  if (updates.name !== undefined && updates.name.trim().length === 0) {
    return { data: null, error: "Product name cannot be empty" };
  }

  if (updates.price_cents !== undefined && updates.price_cents < 0) {
    return { data: null, error: "Price cannot be negative" };
  }

  // Call repository
  const result = await updateProductRepo(salonId, productId, updates);

  // Log to audit trail on success
  if (!result.error && result.data) {
    logProductEvent("update", {
      salonId,
      resourceId: productId,
      productName: result.data.name,
      priceCents: result.data.price_cents,
      stockQuantity: result.data.stock ?? undefined,
      isActive: result.data.is_active,
    }).catch(() => {
      // Silent fail - don't block product update if audit fails
    });
  }

  return result;
}

/**
 * Delete a product with business logic
 */
export async function deleteProduct(
  salonId: string,
  productId: string
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId) {
    return { error: "Salon ID is required" };
  }

  if (!productId) {
    return { error: "Product ID is required" };
  }

  // Check if INVENTORY feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "INVENTORY"
  );

  if (featureError) {
    return { error: featureError };
  }

  if (!hasFeature) {
    return {
      error: "INVENTORY feature is not available in your plan. Please upgrade to access inventory management.",
    };
  }

  // Call repository
  const result = await deleteProductRepo(salonId, productId);

  // Log to audit trail on success
  if (!result.error) {
    logProductEvent("delete", {
      salonId,
      resourceId: productId,
    }).catch(() => {
      // Silent fail - don't block product deletion if audit fails
    });
  }

  return result;
}

