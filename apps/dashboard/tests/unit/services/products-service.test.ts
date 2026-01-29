import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProductsForSalon,
  getProductByIdForSalon,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products-service";
import * as productsRepo from "@/lib/repositories/products";
import * as featureFlagsService from "@/lib/services/feature-flags-service";

// Mock repositories and services
vi.mock("@/lib/repositories/products");
vi.mock("@/lib/services/feature-flags-service");

describe("Products Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductsForSalon", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getProductsForSalon("");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(featureFlagsService.hasFeature)).not.toHaveBeenCalled();
      expect(vi.mocked(productsRepo.getProductsForCurrentSalon)).not.toHaveBeenCalled();
    });

    it("should return error if INVENTORY feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getProductsForSalon("salon-1");

      expect(result.error).toContain("INVENTORY feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.getProductsForCurrentSalon)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await getProductsForSalon("salon-1");

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.getProductsForCurrentSalon)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      const mockProducts = [
        {
          id: "product-1",
          salon_id: "salon-1",
          name: "Shampoo",
          price_cents: 10000,
          stock: 10,
          sku: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(productsRepo.getProductsForCurrentSalon).mockResolvedValue({
        data: mockProducts,
        error: null,
        total: 1,
      });

      const result = await getProductsForSalon("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProducts);
      expect(result.total).toBe(1);
      expect(vi.mocked(productsRepo.getProductsForCurrentSalon)).toHaveBeenCalledWith("salon-1", undefined);
    });

    it("should pass options to repository", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(productsRepo.getProductsForCurrentSalon).mockResolvedValue({
        data: [],
        error: null,
        total: 0,
      });

      await getProductsForSalon("salon-1", { page: 1, pageSize: 10, activeOnly: true });

      expect(vi.mocked(productsRepo.getProductsForCurrentSalon)).toHaveBeenCalledWith("salon-1", {
        page: 1,
        pageSize: 10,
        activeOnly: true,
      });
    });
  });

  describe("getProductByIdForSalon", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getProductByIdForSalon("", "product-1");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.getProductById)).not.toHaveBeenCalled();
    });

    it("should return error if productId is empty", async () => {
      const result = await getProductByIdForSalon("salon-1", "");

      expect(result.error).toBe("Product ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.getProductById)).not.toHaveBeenCalled();
    });

    it("should call repository with valid IDs", async () => {
      const mockProduct = {
        id: "product-1",
        salon_id: "salon-1",
        name: "Shampoo",
        price_cents: 10000,
        stock: 10,
        sku: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(productsRepo.getProductById).mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      const result = await getProductByIdForSalon("salon-1", "product-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProduct);
      expect(vi.mocked(productsRepo.getProductById)).toHaveBeenCalledWith("salon-1", "product-1");
    });
  });

  describe("createProduct", () => {
    it("should return error if salonId is missing", async () => {
      const result = await createProduct({
        salon_id: "",
        name: "Shampoo",
        price_cents: 10000,
      });

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.createProduct)).not.toHaveBeenCalled();
    });

    it("should return error if name is empty", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createProduct({
        salon_id: "salon-1",
        name: "",
        price_cents: 10000,
      });

      expect(result.error).toBe("Product name is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.createProduct)).not.toHaveBeenCalled();
    });

    it("should return error if name is only whitespace", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createProduct({
        salon_id: "salon-1",
        name: "   ",
        price_cents: 10000,
      });

      expect(result.error).toBe("Product name is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.createProduct)).not.toHaveBeenCalled();
    });

    it("should return error if price is negative", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await createProduct({
        salon_id: "salon-1",
        name: "Shampoo",
        price_cents: -100,
      });

      expect(result.error).toBe("Price cannot be negative");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.createProduct)).not.toHaveBeenCalled();
    });

    it("should return error if INVENTORY feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await createProduct({
        salon_id: "salon-1",
        name: "Shampoo",
        price_cents: 10000,
      });

      expect(result.error).toContain("INVENTORY feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.createProduct)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await createProduct({
        salon_id: "salon-1",
        name: "Shampoo",
        price_cents: 10000,
      });

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.createProduct)).not.toHaveBeenCalled();
    });

    it("should call repository with valid input", async () => {
      const mockProduct = {
        id: "product-1",
        salon_id: "salon-1",
        name: "Shampoo",
        price_cents: 10000,
        stock: 10,
        sku: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(productsRepo.createProduct).mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      const input = {
        salon_id: "salon-1",
        name: "Shampoo",
        price_cents: 10000,
      };

      const result = await createProduct(input);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProduct);
      expect(vi.mocked(productsRepo.createProduct)).toHaveBeenCalledWith(input);
    });
  });

  describe("updateProduct", () => {
    it("should return error if salonId is empty", async () => {
      const result = await updateProduct("", "product-1", { name: "New Name" });

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.updateProduct)).not.toHaveBeenCalled();
    });

    it("should return error if productId is empty", async () => {
      const result = await updateProduct("salon-1", "", { name: "New Name" });

      expect(result.error).toBe("Product ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.updateProduct)).not.toHaveBeenCalled();
    });

    it("should return error if name is empty string", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await updateProduct("salon-1", "product-1", { name: "" });

      expect(result.error).toBe("Product name cannot be empty");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.updateProduct)).not.toHaveBeenCalled();
    });

    it("should return error if price is negative", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await updateProduct("salon-1", "product-1", { price_cents: -100 });

      expect(result.error).toBe("Price cannot be negative");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.updateProduct)).not.toHaveBeenCalled();
    });

    it("should return error if INVENTORY feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await updateProduct("salon-1", "product-1", { name: "New Name" });

      expect(result.error).toContain("INVENTORY feature is not available");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.updateProduct)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await updateProduct("salon-1", "product-1", { name: "New Name" });

      expect(result.error).toBe("Feature check failed");
      expect(result.data).toBeNull();
      expect(vi.mocked(productsRepo.updateProduct)).not.toHaveBeenCalled();
    });

    it("should call repository with valid updates", async () => {
      const mockProduct = {
        id: "product-1",
        salon_id: "salon-1",
        name: "New Name",
        price_cents: 15000,
        stock: 10,
        sku: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(productsRepo.updateProduct).mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      const updates = { name: "New Name", price_cents: 15000 };
      const result = await updateProduct("salon-1", "product-1", updates);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProduct);
      expect(vi.mocked(productsRepo.updateProduct)).toHaveBeenCalledWith("salon-1", "product-1", updates);
    });
  });

  describe("deleteProduct", () => {
    it("should return error if salonId is empty", async () => {
      const result = await deleteProduct("", "product-1");

      expect(result.error).toBe("Salon ID is required");
      expect(vi.mocked(productsRepo.deleteProduct)).not.toHaveBeenCalled();
    });

    it("should return error if productId is empty", async () => {
      const result = await deleteProduct("salon-1", "");

      expect(result.error).toBe("Product ID is required");
      expect(vi.mocked(productsRepo.deleteProduct)).not.toHaveBeenCalled();
    });

    it("should return error if INVENTORY feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await deleteProduct("salon-1", "product-1");

      expect(result.error).toContain("INVENTORY feature is not available");
      expect(vi.mocked(productsRepo.deleteProduct)).not.toHaveBeenCalled();
    });

    it("should return error if feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Feature check failed",
      });

      const result = await deleteProduct("salon-1", "product-1");

      expect(result.error).toBe("Feature check failed");
      expect(vi.mocked(productsRepo.deleteProduct)).not.toHaveBeenCalled();
    });

    it("should call repository when feature is available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      vi.mocked(productsRepo.deleteProduct).mockResolvedValue({
        error: null,
      });

      const result = await deleteProduct("salon-1", "product-1");

      expect(result.error).toBeNull();
      expect(vi.mocked(productsRepo.deleteProduct)).toHaveBeenCalledWith("salon-1", "product-1");
    });
  });
});
