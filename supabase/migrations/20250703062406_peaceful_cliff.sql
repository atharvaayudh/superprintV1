/*
  # Add Priority Field to Orders

  1. Changes
    - Add priority field to orders table
    - Update existing orders with default priority
    - Add check constraint for priority values

  2. Security
    - No changes to existing RLS policies
*/

-- Add priority field to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'priority'
  ) THEN
    ALTER TABLE orders ADD COLUMN priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;

-- Create index for priority field
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority);