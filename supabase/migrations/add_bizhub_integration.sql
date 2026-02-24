-- Add Bizhub integration fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS bizhub_id INTEGER,
ADD COLUMN IF NOT EXISTS make VARCHAR(100),
ADD COLUMN IF NOT EXISTS model VARCHAR(100), 
ADD COLUMN IF NOT EXISTS asset_tag VARCHAR(100),
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'GHS',
ADD COLUMN IF NOT EXISTS bizhub_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived'));

-- Create index for fast Bizhub ID lookups
CREATE INDEX IF NOT EXISTS idx_products_bizhub_id ON products(bizhub_id);

-- Create index for status filtering  
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Update existing products to have 'active' status if they don't have one
UPDATE products SET status = 'active' WHERE status IS NULL;

COMMENT ON COLUMN products.bizhub_id IS 'Reference to Bizhub inventory item ID';
COMMENT ON COLUMN products.make IS 'Product manufacturer (from Bizhub)';
COMMENT ON COLUMN products.model IS 'Product model (from Bizhub)'; 
COMMENT ON COLUMN products.asset_tag IS 'Bizhub asset tag identifier';
COMMENT ON COLUMN products.currency IS 'Price currency (GHS, USD, etc.)';
COMMENT ON COLUMN products.bizhub_quantity IS 'Current quantity in Bizhub inventory';
COMMENT ON COLUMN products.original_price IS 'Original price from Bizhub before any markups';
COMMENT ON COLUMN products.status IS 'Publication status: draft=imported but not published, active=live on website, inactive=temporarily hidden, archived=no longer sold';