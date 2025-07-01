-- Fix RLS policies for operators table to allow proper admin access

-- First, drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all operators" ON operators;
DROP POLICY IF EXISTS "Admins can create operators" ON operators;

-- Create better admin policies that actually work
-- Admin users should be able to do everything on operators table
CREATE POLICY "Admin full access to operators" ON operators
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM operators admin_op 
    WHERE admin_op.id = auth.uid() 
    AND admin_op.role = 'admin'
  )
);

-- Allow operators to read all operator profiles (needed for admin dashboard to show data)
CREATE POLICY "Allow reading all operators for admin dashboard" ON operators
FOR SELECT 
USING (true);

-- Allow creating operators (for admin functionality)
CREATE POLICY "Allow creating operators" ON operators
FOR INSERT 
WITH CHECK (true);