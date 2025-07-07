/*
  # Delete All Orders and Fix Status System

  1. Delete all existing orders to start fresh
  2. Update order status constraint to new values
  3. Ensure proper indexing and constraints
*/

-- Delete all existing orders
DELETE FROM orders;

-- Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;

-- Add the new constraint with updated status values
ALTER TABLE orders ADD CONSTRAINT orders_order_status_check 
CHECK (order_status IN ('pending-approval', 'sticker-printing', 'sample-approval', 'under-fusing', 'under-packaging', 'ready-to-ship', 'dispatched', 'cancelled'));

-- Update default value
ALTER TABLE orders ALTER COLUMN order_status SET DEFAULT 'pending-approval';

-- Recreate the index
DROP INDEX IF EXISTS idx_orders_order_status;
CREATE INDEX idx_orders_order_status ON orders(order_status);