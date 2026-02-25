-- Railway PostgreSQL Database Setup for Payless4Tech
-- This replaces Supabase with Railway-hosted PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table (main curated product catalog)
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic product info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    detailed_specs TEXT,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- Original price from Bizhub
    currency VARCHAR(10) DEFAULT 'GHS',
    
    -- Product details
    condition VARCHAR(50) NOT NULL, -- New, Open Box, Used, Refurbished
    category VARCHAR(100) NOT NULL, -- laptops, phones, accessories
    
    -- Images
    image_url TEXT, -- Primary product image
    
    -- Bizhub integration
    bizhub_id INTEGER UNIQUE, -- Reference to Bizhub inventory item
    make VARCHAR(100), -- HP, Dell, Apple, etc.
    model VARCHAR(100), -- EliteBook 845 G7, MacBook Pro, etc.
    asset_tag VARCHAR(100), -- Bizhub asset tag
    bizhub_quantity INTEGER DEFAULT 0, -- Current stock in Bizhub
    
    -- Publication status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived'))
);

-- Additional product images table
CREATE TABLE product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (for filtering)
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic admin users table (for admin panel access)
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Will use bcrypt
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_bizhub_id ON products(bizhub_id);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_display_order ON product_images(display_order);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES 
('Laptops', 'laptops'),
('Phones', 'phones'),
('Tablets', 'tablets'),
('Accessories', 'accessories'),
('Monitors', 'monitors');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_images_updated_at 
    BEFORE UPDATE ON product_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE products IS 'Curated product catalog with Bizhub integration';
COMMENT ON COLUMN products.bizhub_id IS 'Reference to Bizhub inventory item ID';
COMMENT ON COLUMN products.status IS 'Publication status: draft=imported but not published, active=live on website, inactive=temporarily hidden, archived=discontinued';
COMMENT ON COLUMN products.original_price IS 'Original price from Bizhub before any markups';
COMMENT ON COLUMN products.bizhub_quantity IS 'Current quantity in Bizhub inventory (synced)';

COMMENT ON TABLE product_images IS 'Additional product images for gallery display';
COMMENT ON TABLE categories IS 'Product categories for filtering and navigation';
COMMENT ON TABLE admin_users IS 'Admin panel user accounts';