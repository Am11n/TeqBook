import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase BEFORE importing anything that uses it
vi.mock("@/lib/supabase-client", () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  }));

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

import {
  getProductsForCurrentSalon,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsForBooking,
  addProductToBooking,
  updateBookingProduct,
  removeProductFromBooking,
} from "@/lib/repositories/products";
import { supabase } from "@/lib/supabase-client";

describe("Products Repository", () => {
  const mockSalonId = "salon-1";
  const mockProductId = "product-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductsForCurrentSalon", () => {
    it("should return products with pagination", async () => {
      const mockProducts = [
        {
          id: "product-1",
          salon_id: mockSalonId,
          name: "Shampoo",
          price_cents: 10000,
          stock: 10,
          is_active: true,
        },
      ];

      const mockRange = {
        range: vi.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 1,
        }),
      };

      const mockOrder = {
        order: vi.fn().mockReturnValue(mockRange),
      };

      const mockQuery = {
        eq: vi.fn().mockReturnValue(mockOrder),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getProductsForCurrentSalon(mockSalonId, { page: 0, pageSize: 10 });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProducts);
      expect(result.total).toBe(1);
      expect(mockRange.range).toHaveBeenCalledWith(0, 9);
    });

    it("should filter by activeOnly when provided", async () => {
      const mockRange = {
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      const mockOrder = {
        order: vi.fn().mockReturnValue(mockRange),
      };

      const mockQuery = {
        eq: vi.fn().mockReturnValue(mockOrder),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      await getProductsForCurrentSalon(mockSalonId, { activeOnly: true });

      expect(mockQuery.eq).toHaveBeenCalledWith("salon_id", mockSalonId);
      expect(mockOrder.order).toHaveBeenCalled();
    });

    it("should return error when Supabase returns error", async () => {
      const mockRange = {
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
          count: null,
        }),
      };

      const mockOrder = {
        order: vi.fn().mockReturnValue(mockRange),
      };

      const mockQuery = {
        eq: vi.fn().mockReturnValue(mockOrder),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getProductsForCurrentSalon(mockSalonId);

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });

    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getProductsForCurrentSalon(mockSalonId);

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("getProductById", () => {
    it("should return product when found", async () => {
      const mockProduct = {
        id: mockProductId,
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
        stock: 10,
        is_active: true,
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: mockProduct,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getProductById(mockSalonId, mockProductId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProduct);
      expect(mockQuery.eq).toHaveBeenCalledWith("id", mockProductId);
      expect(mockQuery.eq).toHaveBeenCalledWith("salon_id", mockSalonId);
    });

    it("should return error when product not found", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getProductById(mockSalonId, "non-existent");

      expect(result.error).toBe("Product not found");
      expect(result.data).toBeNull();
    });

    it("should return error when Supabase returns error", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getProductById(mockSalonId, mockProductId);

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });
  });

  describe("createProduct", () => {
    it("should create product successfully", async () => {
      const mockProduct = {
        id: mockProductId,
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
        stock: 0,
        sku: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSingle = {
        single: vi.fn().mockResolvedValue({
          data: mockProduct,
          error: null,
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockSingle),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockSelect),
      } as any);

      const input = {
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
      };

      const result = await createProduct(input);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProduct);
    });

    it("should use default values for optional fields", async () => {
      const mockProduct = {
        id: mockProductId,
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
        stock: 0,
        sku: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSingle = {
        single: vi.fn().mockResolvedValue({
          data: mockProduct,
          error: null,
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockSingle),
      };

      const mockInsert = vi.fn().mockReturnValue(mockSelect);

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await createProduct({
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
      });

      expect(mockInsert).toHaveBeenCalledWith({
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
        stock: 0,
        sku: null,
        is_active: true,
      });
    });

    it("should return error when creation fails", async () => {
      const mockSingle = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Creation failed" },
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockSingle),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockSelect),
      } as any);

      const result = await createProduct({
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
      });

      expect(result.error).toBe("Creation failed");
      expect(result.data).toBeNull();
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const mockProduct = {
        id: mockProductId,
        salon_id: mockSalonId,
        name: "Updated Shampoo",
        price_cents: 15000,
        stock: 20,
        is_active: true,
      };

      const mockSingle = {
        single: vi.fn().mockResolvedValue({
          data: mockProduct,
          error: null,
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockSingle),
      };

      const mockEq2 = {
        eq: vi.fn().mockReturnValue(mockSelect),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const updates = {
        name: "Updated Shampoo",
        price_cents: 15000,
      };

      const result = await updateProduct(mockSalonId, mockProductId, updates);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProduct);
      expect(mockEq1.eq).toHaveBeenCalledWith("id", mockProductId);
      expect(mockEq2.eq).toHaveBeenCalledWith("salon_id", mockSalonId);
    });

    it("should return error when product not found", async () => {
      const mockSingle = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockSingle),
      };

      const mockEq2 = {
        eq: vi.fn().mockReturnValue(mockSelect),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const result = await updateProduct(mockSalonId, mockProductId, { name: "Updated" });

      expect(result.error).toBe("Product not found");
      expect(result.data).toBeNull();
    });

    it("should return error when Supabase returns error", async () => {
      const mockSingle = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockSingle),
      };

      const mockEq2 = {
        eq: vi.fn().mockReturnValue(mockSelect),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const result = await updateProduct(mockSalonId, mockProductId, { name: "Updated" });

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const mockEq2 = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const result = await deleteProduct(mockSalonId, mockProductId);

      expect(result.error).toBeNull();
      expect(mockEq1.eq).toHaveBeenCalledWith("id", mockProductId);
      expect(mockEq2.eq).toHaveBeenCalledWith("salon_id", mockSalonId);
    });

    it("should return error when deletion fails", async () => {
      const mockEq2 = {
        eq: vi.fn().mockResolvedValue({ error: { message: "Deletion failed" } }),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const result = await deleteProduct(mockSalonId, mockProductId);

      expect(result.error).toBe("Deletion failed");
    });

    it("should handle exceptions in deleteProduct", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await deleteProduct(mockSalonId, mockProductId);

      expect(result.error).toBe("Network error");
    });
  });

  describe("getProductById - exception handling", () => {
    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getProductById(mockSalonId, mockProductId);

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("createProduct - exception handling", () => {
    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await createProduct({
        salon_id: mockSalonId,
        name: "Shampoo",
        price_cents: 10000,
      });

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("updateProduct - exception handling", () => {
    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await updateProduct(mockSalonId, mockProductId, { name: "Updated" });

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("booking_products helpers", () => {
    it("getProductsForBooking should map products object to product field", async () => {
      const bookingId = "booking-1";
      const mockRows = [
        {
          id: "bp-1",
          booking_id: bookingId,
          product_id: "product-1",
          quantity: 2,
          price_cents: 5000,
          products: {
            id: "product-1",
            salon_id: mockSalonId,
            name: "Shampoo",
            price_cents: 5000,
            stock: 10,
            sku: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
        }),
      } as any);

      const result = await getProductsForBooking(bookingId);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toEqual({
        id: "bp-1",
        booking_id: bookingId,
        product_id: "product-1",
        quantity: 2,
        price_cents: 5000,
        product: mockRows[0].products,
      });
    });

    it("getProductsForBooking should handle products array (take first)", async () => {
      const bookingId = "booking-1";
      const mockRows = [
        {
          id: "bp-1",
          booking_id: bookingId,
          product_id: "product-1",
          quantity: 2,
          price_cents: 5000,
          products: [
            {
              id: "product-1",
              salon_id: mockSalonId,
              name: "Shampoo",
              price_cents: 5000,
              stock: 10,
              sku: null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
        }),
      } as any);

      const result = await getProductsForBooking(bookingId);

      expect(result.error).toBeNull();
      expect(result.data?.[0].product.id).toBe("product-1");
    });

    it("getProductsForBooking should return error when Supabase returns error", async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
        }),
      } as any);

      const result = await getProductsForBooking("booking-1");
      expect(result.error).toBe("DB error");
      expect(result.data).toBeNull();
    });

    it("addProductToBooking should return mapped BookingProduct", async () => {
      const bookingId = "booking-1";
      const productId = "product-1";

      const mockInserted = {
        id: "bp-1",
        booking_id: bookingId,
        product_id: productId,
        quantity: 2,
        price_cents: 5000,
        products: {
          id: productId,
          salon_id: mockSalonId,
          name: "Shampoo",
          price_cents: 5000,
          stock: 10,
          sku: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockInserted, error: null }),
          }),
        }),
      } as any);

      const result = await addProductToBooking(bookingId, productId, 2, 5000);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        id: "bp-1",
        booking_id: bookingId,
        product_id: productId,
        quantity: 2,
        price_cents: 5000,
        product: mockInserted.products,
      });
    });

    it("addProductToBooking should return error when insert fails", async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "Insert failed" } }),
          }),
        }),
      } as any);

      const result = await addProductToBooking("booking-1", "product-1", 1, 1000);
      expect(result.error).toBe("Insert failed");
      expect(result.data).toBeNull();
    });

    it("updateBookingProduct should return mapped BookingProduct", async () => {
      const mockUpdated = {
        id: "bp-1",
        booking_id: "booking-1",
        product_id: "product-1",
        quantity: 3,
        price_cents: 5000,
        products: {
          id: "product-1",
          salon_id: mockSalonId,
          name: "Shampoo",
          price_cents: 5000,
          stock: 10,
          sku: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
            }),
          }),
        }),
      } as any);

      const result = await updateBookingProduct("bp-1", 3);

      expect(result.error).toBeNull();
      expect(result.data?.quantity).toBe(3);
      expect(result.data?.product.id).toBe("product-1");
    });

    it("updateBookingProduct should return error when update fails", async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Update failed" } }),
            }),
          }),
        }),
      } as any);

      const result = await updateBookingProduct("bp-1", 3);
      expect(result.error).toBe("Update failed");
      expect(result.data).toBeNull();
    });

    it("removeProductFromBooking should delete successfully", async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await removeProductFromBooking("bp-1");
      expect(result.error).toBeNull();
    });

    it("removeProductFromBooking should return error when delete fails", async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
        }),
      } as any);

      const result = await removeProductFromBooking("bp-1");
      expect(result.error).toBe("Delete failed");
    });

    it("getProductsForBooking should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getProductsForBooking("booking-1");
      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });

    it("addProductToBooking should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await addProductToBooking("booking-1", "product-1", 1, 1000);
      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });

    it("updateBookingProduct should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await updateBookingProduct("bp-1", 3);
      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });

    it("removeProductFromBooking should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await removeProductFromBooking("bp-1");
      expect(result.error).toBe("Network error");
    });
  });
});
