-- =====================================================
-- Add Products Table and Booking Products Junction Table
-- =====================================================
-- This SQL script creates the products table and booking_products
-- junction table for inventory/product sales functionality
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Products Table
-- =====================================================
DO $$
BEGIN
  -- Create products table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE TABLE products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      salon_id UUID NOT NULL,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      sku TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_salon_id_fkey'
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_salon_id_fkey
      FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add comments (idempotent - can be run multiple times)
COMMENT ON TABLE products IS 'Products/inventory items that can be sold during bookings';
COMMENT ON COLUMN products.name IS 'Product name';
COMMENT ON COLUMN products.price_cents IS 'Product price in cents (e.g., 2500 = $25.00)';
COMMENT ON COLUMN products.stock IS 'Current stock quantity (can be negative for unlimited)';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit (optional product identifier)';
COMMENT ON COLUMN products.is_active IS 'Whether the product is active and available for sale';

-- =====================================================
-- 2. Booking Products Junction Table
-- =====================================================
DO $$
BEGIN
  -- Create booking_products junction table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_products') THEN
    CREATE TABLE booking_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price_cents INTEGER NOT NULL, -- Price at time of sale (snapshot)
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Add foreign key constraints if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'booking_products_booking_id_fkey'
    AND table_name = 'booking_products'
  ) THEN
    ALTER TABLE booking_products
      ADD CONSTRAINT booking_products_booking_id_fkey
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'booking_products_product_id_fkey'
    AND table_name = 'booking_products'
  ) THEN
    ALTER TABLE booking_products
      ADD CONSTRAINT booking_products_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;

  -- Add unique constraint to prevent duplicate entries
  -- (Same product can't be added twice to same booking)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'booking_products_booking_product_unique'
    AND table_name = 'booking_products'
  ) THEN
    ALTER TABLE booking_products
      ADD CONSTRAINT booking_products_booking_product_unique
      UNIQUE (booking_id, product_id);
  END IF;
END $$;

-- Add comments (idempotent - can be run multiple times)
COMMENT ON TABLE booking_products IS 'Junction table linking bookings to products sold';
COMMENT ON COLUMN booking_products.quantity IS 'Quantity of product sold in this booking';
COMMENT ON COLUMN booking_products.price_cents IS 'Price per unit at time of sale (snapshot for historical accuracy)';

-- =====================================================
-- 3. Indexes for Performance
-- =====================================================

-- Index for products by salon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_products_salon_id'
  ) THEN
    CREATE INDEX idx_products_salon_id ON products(salon_id);
  END IF;
END $$;

-- Index for active products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_products_salon_active'
  ) THEN
    CREATE INDEX idx_products_salon_active ON products(salon_id, is_active) WHERE is_active = true;
  END IF;
END $$;

-- Index for booking_products by booking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_booking_products_booking_id'
  ) THEN
    CREATE INDEX idx_booking_products_booking_id ON booking_products(booking_id);
  END IF;
END $$;

-- Index for booking_products by product
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_booking_products_product_id'
  ) THEN
    CREATE INDEX idx_booking_products_product_id ON booking_products(product_id);
  END IF;
END $$;

-- =====================================================
-- 4. Updated_at Trigger for Products
-- =====================================================

-- Create function to update updated_at timestamp (idempotent)
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (idempotent - DROP IF EXISTS handles it)
DROP TRIGGER IF EXISTS products_updated_at_trigger ON products;
CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- =====================================================
-- 5. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on products table (idempotent - no error if already enabled)
DO $$
BEGIN
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL; -- Ignore if already enabled
END $$;

DO $$
BEGIN
  ALTER TABLE booking_products ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL; -- Ignore if already enabled
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view products for their salon" ON products;
DROP POLICY IF EXISTS "Users can insert products for their salon" ON products;
DROP POLICY IF EXISTS "Users can update products for their salon" ON products;
DROP POLICY IF EXISTS "Users can delete products for their salon" ON products;
DROP POLICY IF EXISTS "Superadmins can view all products" ON products;
DROP POLICY IF EXISTS "Users can view booking_products for their salon" ON booking_products;
DROP POLICY IF EXISTS "Users can insert booking_products for their salon" ON booking_products;
DROP POLICY IF EXISTS "Users can update booking_products for their salon" ON booking_products;
DROP POLICY IF EXISTS "Users can delete booking_products for their salon" ON booking_products;
DROP POLICY IF EXISTS "Superadmins can view all booking_products" ON booking_products;

-- Products policies
CREATE POLICY "Users can view products for their salon"
  ON products FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products for their salon"
  ON products FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products for their salon"
  ON products FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products for their salon"
  ON products FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Superadmins can view all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- Booking products policies
CREATE POLICY "Users can view booking_products for their salon"
  ON booking_products FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert booking_products for their salon"
  ON booking_products FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update booking_products for their salon"
  ON booking_products FOR UPDATE
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete booking_products for their salon"
  ON booking_products FOR DELETE
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Superadmins can view all booking_products"
  ON booking_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- =====================================================
-- Usage Examples:
-- =====================================================
-- -- Create a product
-- INSERT INTO products (salon_id, name, price_cents, stock, sku, is_active)
-- VALUES ('salon-id'::UUID, 'Hair Gel', 5000, 10, 'HG-001', true);
--
-- -- Link product to booking
-- INSERT INTO booking_products (booking_id, product_id, quantity, price_cents)
-- VALUES ('booking-id'::UUID, 'product-id'::UUID, 2, 5000);
--
-- -- Get products for a booking
-- SELECT p.*, bp.quantity, bp.price_cents as sale_price_cents
-- FROM booking_products bp
-- INNER JOIN products p ON bp.product_id = p.id
-- WHERE bp.booking_id = 'booking-id'::UUID;

