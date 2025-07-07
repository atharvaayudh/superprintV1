/*
  # Initial Schema for Order Management System

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `company` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `sales_coordinators`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `product_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `product_names`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category_id` (uuid, foreign key)
      - `base_price` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `colors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `hex_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `orders`
      - `id` (uuid, primary key)
      - `order_id` (text, unique)
      - `order_date` (date)
      - `delivery_date` (date)
      - `customer_id` (uuid, foreign key)
      - `order_type` (text)
      - `sales_coordinator_id` (uuid, foreign key)
      - `product_category_id` (uuid, foreign key)
      - `product_name_id` (uuid, foreign key)
      - `color_id` (uuid, foreign key)
      - `description` (text)
      - `size_breakdown` (jsonb)
      - `total_qty` (integer)
      - `branding_type` (text)
      - `placement1` (text)
      - `placement1_size` (text)
      - `placement2` (text)
      - `placement2_size` (text)
      - `placement3` (text)
      - `placement3_size` (text)
      - `placement4` (text)
      - `placement4_size` (text)
      - `mockup_files` (text[])
      - `attachments` (text[])
      - `remarks` (text)
      - `cost_per_pc` (numeric)
      - `total_amount` (numeric)
      - `order_status` (text)
      - `edd` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  company text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales_coordinators table
CREATE TABLE IF NOT EXISTS sales_coordinators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_names table
CREATE TABLE IF NOT EXISTS product_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES product_categories(id) ON DELETE CASCADE,
  base_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create colors table
CREATE TABLE IF NOT EXISTS colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hex_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  order_date date NOT NULL,
  delivery_date date NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_type text NOT NULL CHECK (order_type IN ('new', 'repeat', 'sample', 'rush')),
  sales_coordinator_id uuid REFERENCES sales_coordinators(id) ON DELETE CASCADE,
  product_category_id uuid REFERENCES product_categories(id) ON DELETE CASCADE,
  product_name_id uuid REFERENCES product_names(id) ON DELETE CASCADE,
  color_id uuid REFERENCES colors(id) ON DELETE CASCADE,
  description text NOT NULL,
  size_breakdown jsonb NOT NULL DEFAULT '{}',
  total_qty integer NOT NULL DEFAULT 0,
  branding_type text NOT NULL DEFAULT 'none' CHECK (branding_type IN ('embroidery', 'screen-print', 'heat-transfer', 'sublimation', 'vinyl', 'dtf', 'none')),
  placement1 text,
  placement1_size text,
  placement2 text,
  placement2_size text,
  placement3 text,
  placement3_size text,
  placement4 text,
  placement4_size text,
  mockup_files text[] DEFAULT '{}',
  attachments text[] DEFAULT '{}',
  remarks text,
  cost_per_pc numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  order_status text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'in-production', 'quality-check', 'ready', 'shipped', 'delivered', 'cancelled')),
  edd date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for sales_coordinators
CREATE POLICY "Enable read access for all users" ON sales_coordinators FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON sales_coordinators FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON sales_coordinators FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON sales_coordinators FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_categories
CREATE POLICY "Enable read access for all users" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON product_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON product_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON product_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_names
CREATE POLICY "Enable read access for all users" ON product_names FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON product_names FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON product_names FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON product_names FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for colors
CREATE POLICY "Enable read access for all users" ON colors FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON colors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON colors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON colors FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for orders
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_product_names_category_id ON product_names(category_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_coordinators_updated_at BEFORE UPDATE ON sales_coordinators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_names_updated_at BEFORE UPDATE ON product_names FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_colors_updated_at BEFORE UPDATE ON colors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();