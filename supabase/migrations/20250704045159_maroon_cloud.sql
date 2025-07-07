/*
  # Fix Orders Table RLS Policies

  1. Security Updates
    - Enable RLS on orders table (if not already enabled)
    - Add comprehensive RLS policies for orders table
    - Allow authenticated users to perform CRUD operations on orders
    - Ensure proper access control for order management

  2. Storage Buckets
    - Create mockups bucket for order mockup files
    - Create attachments bucket for order attachment files
    - Set appropriate public access policies for file uploads

  3. Policy Details
    - INSERT: Allow authenticated users to create orders
    - SELECT: Allow authenticated users to read all orders
    - UPDATE: Allow authenticated users to update orders
    - DELETE: Allow authenticated users to delete orders
*/

-- Ensure RLS is enabled on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON orders;

-- Create comprehensive RLS policies for orders table
CREATE POLICY "Allow authenticated users to insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('mockups', 'mockups', true),
  ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for mockups bucket
CREATE POLICY "Allow authenticated users to upload mockups"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'mockups');

CREATE POLICY "Allow public access to mockups"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'mockups');

CREATE POLICY "Allow authenticated users to update mockups"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'mockups');

CREATE POLICY "Allow authenticated users to delete mockups"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'mockups');

-- Create storage policies for attachments bucket
CREATE POLICY "Allow authenticated users to upload attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Allow public access to attachments"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'attachments');

CREATE POLICY "Allow authenticated users to update attachments"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'attachments');

CREATE POLICY "Allow authenticated users to delete attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments');