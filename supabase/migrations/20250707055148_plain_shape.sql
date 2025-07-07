/*
  # Remove Customer Table and Simplify Customer Data

  1. Changes
    - Delete all existing customers
    - Drop customer table and related constraints
    - Modify orders table to use simple customer_name field instead of customer_id
    - Update order policies and constraints

  2. Security
    - Maintain existing RLS policies for orders
    - Remove customer-related policies
*/

-- Delete all existing orders first
DELETE FROM orders;

-- Drop foreign key constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

-- Drop customer_id column and add customer_name
ALTER TABLE orders DROP COLUMN IF EXISTS customer_id;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT '';

-- Drop customers table completely
DROP TABLE IF EXISTS customers CASCADE;

-- Update indexes
DROP INDEX IF EXISTS idx_orders_customer_id;
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);